import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Login", path: "/login", noIndex: true });

export default function LoginPage() {
  return (
    <div className="px-4 py-16">
      <Suspense>
        <AuthForm mode="login" />
      </Suspense>
    </div>
  );
}
