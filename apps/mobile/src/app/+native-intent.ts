/**
 * Expo Router's entry point for links that arrive from outside the app.
 *
 * A share from WhatsApp, Gmail or Photos reaches us as `expo-sharing://…`, and
 * without this it would be treated as an unknown route. Everything else is left
 * exactly as it came in.
 */
export async function redirectSystemPath({
  path,
}: {
  path: string;
  initial: boolean;
}): Promise<string> {
  try {
    if (new URL(path).hostname === "expo-sharing") return "/handle-share";
    return path;
  } catch {
    return "/";
  }
}
