import { ResetPasswordForm } from "@/components/ResetPasswordForm";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Reset password", path: "/reset-password", noIndex: true });

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
