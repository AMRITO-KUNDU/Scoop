import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: () =>
        new Response(JSON.stringify({ message: "Clerk Auth Active" }), {
          headers: { "Content-Type": "application/json" },
        }),
      POST: () =>
        new Response(JSON.stringify({ message: "Clerk Auth Active" }), {
          headers: { "Content-Type": "application/json" },
        }),
    },
  },
});
