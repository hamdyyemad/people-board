import Link from "next/link";

interface ForgotPasswordLinkProps {
  translations: Record<string, string>;
}

export function ForgotPasswordLink({ translations }: ForgotPasswordLinkProps) {
  const t = (key: string) => translations[key] || key;

  return (
    <div className="flex justify-end">
      <Link
        href="/auth/forgot-password"
        className="text-sm text-primary hover:underline"
      >
        {t("forgotPassword")}
      </Link>
    </div>
  );
}
