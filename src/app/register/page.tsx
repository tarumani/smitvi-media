import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Register", path: "/register", noIndex: true });

export default function RegisterPage() {
  return (
    <div className="px-4 py-16">
      <Suspense>
        <AuthForm mode="register" />
      </Suspense>
    </div>
  );
}
