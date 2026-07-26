import { Suspense } from "react";
import OtpAuthForm from "@/components/OtpAuthForm";

export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6">
      <Suspense fallback={null}>
        <OtpAuthForm mode="signup" />
      </Suspense>
    </main>
  );
}