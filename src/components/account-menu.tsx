import { Link } from "@tanstack/react-router";
import { Cable } from "lucide-react";
import { UserButton } from "@clerk/tanstack-react-start";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export function AccountMenu({ showSignup = true }: { showSignup?: boolean }) {
  const { user } = useCurrentUserState();

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          to="/login"
          className="inline-flex h-10 items-center rounded-full border-thick border-ink bg-paper px-3 font-display text-sm font-bold shadow-hard-sm hover:bg-paper-2"
        >
          Sign in
        </Link>
        {showSignup ? (
          <Link
            to="/signup"
            className="chunky inline-flex h-10 items-center rounded-full bg-yolk px-3 font-display text-sm font-bold"
          >
            Sign up
          </Link>
        ) : null}
      </div>
    );
  }

  const label = user.displayName ?? user.primaryEmail ?? "Account";

  return (
    <div className="flex items-center gap-2">
      <Link
        to="/connect"
        className="inline-flex size-10 items-center justify-center rounded-full border-thick border-ink bg-paper shadow-hard-sm hover:bg-yolk"
        aria-label="Connect services"
        title="Connect"
      >
        <Cable className="size-4" strokeWidth={2.4} />
      </Link>
      <UserButton
        afterSignOutUrl="/"
        fallback={
          <span className="grid size-9 place-items-center rounded-full border-thick border-ink bg-grape font-display text-sm font-black text-paper">
            {label.charAt(0).toUpperCase()}
          </span>
        }
      />
      <span className="hidden max-w-28 truncate font-display text-sm font-bold lg:inline">
        {label}
      </span>
    </div>
  );
}