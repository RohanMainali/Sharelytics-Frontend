"use client";
import dynamic from "next/dynamic";

// Dynamically import LoginForm component with SSR disabled
const LoginForm = dynamic(() => import("./LoginForm") as Promise<{ default: React.ComponentType<any> }>, { ssr: false });

export default function LoginPage() {
  return <LoginForm />;
}
