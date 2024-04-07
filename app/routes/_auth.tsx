import { Outlet } from "@remix-run/react";

export default function AuthLayout() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <Outlet />
    </main>
  );
}
