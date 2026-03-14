// We make value readonly in this value object to enforce immutability, 
// which is a core principle in Domain-Driven Design (DDD) value objects.
// readonly value: string;
// This means once the DepartmentName object is created, 
// its value cannot be changed.
// 1. A Value Object represents a concept defined only by its value, 
// not identity. Once created, it should not change.
// Example:
// const name = new DepartmentName("HR");
// name.value = "Finance"; // ❌ Not allowed because it's readonly

// If it were mutable, the object could change unexpectedly 
// and break domain rules.
// Correct approach:
// const name = new DepartmentName("HR");
// const newName = new DepartmentName("Finance");
// You create a new object instead of modifying the existing one.
// ==================================================================
// 2. Protect Domain Invariants
// Your constructor enforces validation:
// this.validate(value);
// If value were mutable, someone could bypass validation:
// const name = new DepartmentName("HR");
// name.value = ""; // ❌ breaks validation rules
// Using readonly ensures that validation always holds after construction.
// ==================================================================
// 3. Prevent Accidental Side Effects
// Without readonly, someone might unintentionally change it:
// function updateDepartment(name: DepartmentName) {
//   name.value = "IT"; // dangerous
// }
// With readonly, TypeScript prevents this at compile time.
// ==================================================================
// 4. Makes Equality Reliable
// Your equality check:
// equals(other: DepartmentName): boolean {
//   return this.value.toLowerCase() === other.value.toLowerCase();
// }
// If values could change later, equality comparisons could become inconsistent.
// Immutability guarantees:
// Once created, the value never changes
// Equality checks remain reliable
// ==================================================================
// ✅ Summary
// We use readonly because value objects should:
// 1. Be immutable
// 2. Protect domain rules
// 3. Prevent side effects
// 4. Ensure reliable equality comparisons
// ==================================================================
//💡 Common DDD rule: 
// Entities are mutable, but Value Objects are immutable.
// ==================================================================
export class DepartmentName {
  readonly value: string;

  constructor(value: string) {
    this.validate(value);
    this.value = value.trim();
  }

  private validate(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new Error('Department name cannot be empty');
    }
    if (value.trim().length > 255) {
      throw new Error('Department name cannot exceed 255 characters');
    }
  }

  equals(other: DepartmentName): boolean {
    return this.value.toLowerCase() === other.value.toLowerCase();
  }
}