import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { CalendarDays, ScanText } from "lucide-react";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { AccountMenu } from "@/components/account-menu";
import { Wordmark } from "@/components/logo";
import { Splash } from "@/components/splash";
import { cn } from "@/lib/utils";

const TABS = [
  { to: "/capture" as const, label: "Capture", icon: ScanText },
  { to: "/plan" as const, label: "Plan", icon: CalendarDays },
];

function AppNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-40 border-b-thick border-ink bg-paper/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-3 sm:gap-3 sm:px-4">
        <Link to="/capture" className="shrink-0" aria-label="SCOOP home">
          <Wordmark compact />
        </Link>
        <nav className="ml-1 flex min-w-0 flex-1 items-center">
          <div className="inline-flex rounded-full border-thick border-ink bg-paper p-1 shadow-hard-sm">
            {TABS.map((tab) => {
              const active = pathname === tab.to;
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.to}
                  to={tab.to}
                  className={cn(
                    "inline-flex h-9 items-center gap-1.5 rounded-full px-3 font-display text-sm font-black sm:px-4",
                    active ? "bg-yolk text-ink" : "text-ink hover:bg-paper-2",
                  )}
                >
                  <Icon className="size-4" strokeWidth={2.4} />
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </nav>
        <AccountMenu />
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { user, isPending } = useCurrentUserState();
  if (isPending) return <Splash />;
  if (!user) return <RedirectToSignIn />;
  return (
    <div className="min-h-dvh bg-paper">
      <AppNav />
      <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:py-10">{children}</main>
    </div>
  );
}
