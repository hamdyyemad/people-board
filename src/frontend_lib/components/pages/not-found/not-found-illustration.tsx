/**
 * Decorative 404 illustration panel (desktop only).
 * SVG sourced from reference design, recolored to PeopleBoard primary teal (#0d6363).
 */

export function NotFoundIllustration() {
  return (
    <div
      aria-hidden="true"
      className="relative flex w-full items-center justify-center p-8"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/illustrations/not-found.svg"
        alt=""
        width={500}
        height={500}
        className="w-full max-w-md rounded-lg shadow-lg"
      />
    </div>
  );
}
