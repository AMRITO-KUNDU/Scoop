import { useState, useSyncExternalStore } from "react";
import { Link } from "@tanstack/react-router";
import { Cable, LogOut } from "lucide-react";
import { authEnabled, signOut } from "@/lib/auth/client";
import { hasGateSessionMarker } from "@/lib/auth/gate-session-marker";
import { useCurrentUser, useCurrentUserState } from "@/lib/auth/use-current-user";

const subscribeToNothing = () => () => {};
const noGateSessionOnServer = () => false;

function Avatar({
  name,
  src,
}: {
  name: string;
  src: string | null;
}) {
  if (src) {
    return (
      <img
        src={src}
        alt=""
        className="size-9 rounded-full border-thick border-ink object-cover"
      />
    );
  }
  return (
    <span className="grid size-9 place-items-center rounded-full border-thick border-ink bg-grape font-display text-sm font-black text-paper">
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

export function AccountMenu({ showSignup = true }: { showSignup?: boolean }) {
  const { user, isPending } = useCurrentUserState();
  const liveUser = useCurrentUser();
  const [signingOut, setSigningOut] = useState(false);
  const gateSession = useSyncExternalStore(
    subscribeToNothing,
    hasGateSessionMarker,
    noGateSessionOnServer,
  );

  if (isPending) {
    return (
      <div className="h-10 w-24 animate-pulse rounded-full border-thick border-ink bg-paper-2 sm:w-28" />
    );
  }

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

  const label = liveUser?.displayName ?? liveUser?.primaryEmail ?? "Account";
  const showSignOut = authEnabled && !gateSession;

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
      <Avatar name={label} src={liveUser?.profileImageUrl ?? null} />
      <span className="hidden max-w-28 truncate font-display text-sm font-bold lg:inline">
        {label}
      </span>
      {showSignOut ? (
        <button
          type="button"
          disabled={signingOut}
          onClick={() => {
            setSigningOut(true);
            void signOut("/").catch(() => setSigningOut(false));
          }}
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border-thick border-ink bg-paper px-2.5 font-display text-sm font-bold shadow-hard-sm hover:bg-paper-2 disabled:opacity-50 sm:px-3"
          aria-label="Sign out"
        >
          <LogOut className="size-4 sm:hidden" strokeWidth={2.4} />
          <span className="hidden sm:inline">{signingOut ? "Signing out…" : "Sign out"}</span>
        </button>
      ) : null}
    </div>
  );
}
