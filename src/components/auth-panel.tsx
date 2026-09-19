import { Link } from "@tanstack/react-router";
import { SignIn, SignUp } from "@clerk/tanstack-start";
import { Wordmark } from "@/components/logo";

export function AuthPanel({ mode }: { mode: "signin" | "signup" }) {
  const isSignup = mode === "signup";

  return (
    <div className="flex flex-col items-center justify-center space-y-6 w-full max-w-md mx-auto py-8">
      <Link to="/" className="inline-flex">
        <Wordmark />
      </Link>
      <div className="w-full flex justify-center">
        {isSignup ? (
          <SignUp
            routing="path"
            path="/signup"
            signInUrl="/login"
            fallbackRedirectUrl="/capture"
          />
        ) : (
          <SignIn
            routing="path"
            path="/login"
            signUpUrl="/signup"
            fallbackRedirectUrl="/capture"
          />
        )}
      </div>
    </div>
  );
}
