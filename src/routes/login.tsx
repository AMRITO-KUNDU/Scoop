import { createFileRoute, Navigate } from "@tanstack/react-router";
import { AuthPanel } from "@/components/auth-panel";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-paper px-4 py-10">
        <p className="font-display text-xl font-black uppercase tracking-tight">
          Loading SCOOP…
        </p>
      </main>
    );
  }
  if (user) return <Navigate to="/capture" />;
  return (
    <main className="flex min-h-dvh items-center justify-center bg-paper px-4 py-10">
      <AuthPanel mode="signin" />
    </main>
  );
}
