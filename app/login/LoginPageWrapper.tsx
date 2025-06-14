// app/login/page.tsx
import { Suspense } from "react";
import LoginPageWrapper from "./LoginPageWrapper";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginPageWrapper />
    </Suspense>
  );
}
