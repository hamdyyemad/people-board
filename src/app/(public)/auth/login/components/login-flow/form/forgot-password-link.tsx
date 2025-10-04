import Link from "next/link";

export function ForgotPasswordLink() {
  return (
    <div className="flex justify-end">
      <Link
        href="/auth/forgot-password"
        className="text-sm text-primary hover:underline"
      >
        Forgot Password?
      </Link>
    </div>
  );
}
