"use client";
import dynamic from "next/dynamic";
import { Suspense } from "react";

// Dynamically import LoginForm component with SSR disabled
const LoginForm = dynamic(() => import("./LoginForm") as Promise<{ default: React.ComponentType<any> }>, { ssr: false });

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
