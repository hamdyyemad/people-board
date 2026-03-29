# FormModalBody — Re-render Isolation Fix

**Date:** March 29, 2026
**Scope:** `src/frontend_lib/components/shared/data-table/crud-modal/products/form-modal-body.tsx`

---

## Problem

Typing a single character in the "Department Name" input caused **three** unnecessary
re-renders on every keystroke:

| Component | Reason | Time |
|---|---|---|
| `Combobox` (parentName) | `onValueChange` prop changed (new closure) | ~5.3ms |
| `FormModalBody` | `useState(values)` updated the whole object | ~0.8ms |
| `ModalFooter` | `onConfirm` and `confirmDisabled` props changed | ~0.7ms |

The only component that **should** re-render is the `FieldInput` for the specific
field being edited (e.g. `key="name"`), plus the footer **only** when overall
validity actually changes (e.g. going from empty to filled on a required field).

### Why it happened

```
FormModalBody
├── useState({ name: "", parentName: "" })   ← EVERY keystroke replaces this object
├── handleChange = (key, value) => setState(...)  ← new closure every render
│
├── FormGrid
│   ├── FormFieldRenderer key="name"
│   │   └── FieldInput  ← receives new `onChange` ref + new `value` from parent
│   └── FormFieldRenderer key="parentName"
│       └── Combobox     ← receives new `onValueChange` ref → re-renders
│
└── FormFooterWrapper
    └── ModalFooter      ← receives new `onConfirm` ref + re-derived `isValid`
```

The root cause is a **single `useState` object** holding all field values at the
parent level. Any field change replaces the entire object, which:

1. Re-renders `FormModalBody` itself.
2. Creates new closures for `handleChange` / `onConfirm`.
3. Passes new prop references to **every** child, even those whose data didn't change.

`React.memo` would mask this but not fix it — the real fix is pushing state ownership
down to each field.

---

## Solution: External Store + Per-Field Subscriptions

Instead of `useState` at the parent, we use an **external form controller** (plain
object with subscriber lists) and let each field subscribe **only to its own key**
via `useSyncExternalStore`.

### Architecture after the fix

```
FormModalBody (renders once on mount — no state)
│
├── FormGrid (renders once — receives stable controller ref)
│   ├── FormFieldRenderer key="name"
│   │   └── FieldInput
│   │       └── useFieldValue(controller, "name")      ← subscribes to "name" only
│   │       └── handleInputChange = useCallback(...)    ← stable ref
│   │
│   └── FormFieldRenderer key="parentName"
│       └── FieldInput
│           └── useFieldValue(controller, "parentName") ← subscribes to "parentName" only
│           └── handleInputChange = useCallback(...)     ← stable ref
│
└── FormFooterWrapper (renders only when validity flips)
    └── useFormValidity(controller)  ← subscribes to validity only
    └── handleConfirm = useCallback(...)  ← stable ref, reads from controller snapshot
```

### What re-renders now when typing in "name"

| Component | Re-renders? | Why |
|---|---|---|
| `FormModalBody` | No | No state, no props changed |
| `FormGrid` | No | `controller` ref is stable |
| `FieldInput key="name"` | **Yes** | Subscribed to `"name"` — value changed |
| `FieldInput key="parentName"` | No | Not subscribed to `"name"` |
| `FormFooterWrapper` | Only if validity flips | Subscribed to validity, not individual fields |
| `ModalFooter` | Only if validity flips | `onConfirm` is a stable `useCallback` |

---

## FormController — the external store

`createFormController()` returns a plain object (not a class, not a hook) that holds:

- **`values`** — `Record<string, string>` of all field values.
- **`requiredFilled`** — `Map<string, boolean>` tracking which required fields have content.
- **`valid`** — derived boolean, recomputed only when a required field's filled status changes.
- **`fieldListeners`** — `Map<string, Set<() => void>>` for per-key subscriptions.
- **`validityListeners`** — `Set<() => void>` for validity subscriptions.

### Methods

| Method | Purpose |
|---|---|
| `getFieldValue(key)` | Read a single field's current value |
| `setFieldValue(key, value)` | Write a value, emit to that key's listeners, maybe emit validity |
| `subscribeToField(key, cb)` | Subscribe to changes on one key — returns unsubscribe |
| `subscribeToValidity(cb)` | Subscribe to validity changes — returns unsubscribe |
| `isValid()` | Snapshot: are all required fields filled? |
| `prepareSubmission()` | Snapshot: build the `Record<string, unknown>` for `onConfirm` |
| `reset(fields, record)` | Re-initialise (used when `fields` or `record` props change) |

### Lifecycle

```
useFormController(fields, record)
  │
  ├── useRef(createFormController(fields, record))   ← created once
  │
  └── useEffect(() => controller.reset(fields, record), [fields, record])
      ↑ only runs if the parent passes different fields/record
```

The controller lives in a `useRef`, so it is **never** part of React state. It does
not cause parent re-renders.

---

## Hook: `useFieldValue`

```ts
function useFieldValue(controller: FormController, key: string) {
  return React.useSyncExternalStore(
    (listener) => controller.subscribeToField(key, listener),
    () => controller.getFieldValue(key),
    () => controller.getFieldValue(key)
  );
}
```

- Called inside `FieldInput`.
- Only the component calling this hook for `"name"` re-renders when `"name"` changes.
- `"parentName"`'s `FieldInput` is not notified.

---

## Hook: `useFormValidity`

```ts
function useFormValidity(controller: FormController) {
  return React.useSyncExternalStore(
    controller.subscribeToValidity,
    controller.isValid,
    controller.isValid
  );
}
```

- Called inside `FormFooterWrapper`.
- Only re-renders the footer when `isValid` actually **flips** (e.g. `false → true`).
- Typing more characters into an already-filled required field does **not** flip
  validity, so the footer stays still.

---

## Validity change flow

When `setFieldValue("name", "Engineering")` is called:

```
1. previousValue = ""
2. nextValue = "Engineering"
3. values["name"] = "Engineering"
4. field "name" is required?
   → Yes: was empty (false), now filled (true)
   → requiredFilled.set("name", true)
   → recompute: all required filled? → maybe flips valid from false → true
   → if flipped: emitValidity() → FormFooterWrapper re-renders
5. emitField("name") → FieldInput key="name" re-renders
```

On the **next** keystroke (e.g. "Engineering" → "Engineering D"):

```
1. previousValue = "Engineering"
2. nextValue = "Engineering D"
3. values["name"] = "Engineering D"
4. field "name" is required?
   → Yes: was filled (true), still filled (true) → no flip
   → NO emitValidity()
5. emitField("name") → FieldInput key="name" re-renders
   → FormFooterWrapper does NOT re-render
```

---

## Why not `React.memo`?

`React.memo` was deliberately **not** used as the primary fix because:

1. It only **masks** the problem — the parent still re-renders and rebuilds props.
2. It requires careful `areEqual` functions when props are objects/arrays.
3. It adds a shallow-comparison cost on **every** render for **every** memoized component.
4. It doesn't help when the real issue is **state living too high in the tree**.

The correct React pattern is: **push state down to the component that needs it**.
The external store is the mechanism that lets multiple leaf components share data
without lifting state to a common parent.

---

## File structure (unchanged)

The component hierarchy inside `form-modal-body.tsx` is the same:

```
FormModalBody          ← orchestrator, no state
├── FormGrid           ← layout wrapper
│   └── FormFieldRenderer (per field)
│       ├── FieldLabel
│       └── FieldInput ← subscribes to its own key via useFieldValue
└── FormFooterWrapper  ← subscribes to validity via useFormValidity
    └── ModalFooter
```

No new files were created. The `FormController` interface, factory, and hooks all
live in the same file.
