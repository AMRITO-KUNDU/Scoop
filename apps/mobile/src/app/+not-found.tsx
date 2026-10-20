import { Redirect } from 'expo-router';

/**
 * Catches any URL that doesn't match a route and sends the user home.
 *
 * Without this file, Expo Router falls back to its built-in "Unmatched Route"
 * screen. The case this app actually hits is Clerk's hosted-auth callback: when
 * the browser session hands control back to the app it opens a callback URL
 * that isn't a screen, and on Android the router resolves it to nothing — so on
 * the first sign-in the user lands on "Unmatched Route" and has to press back.
 * Redirecting to `/` makes that flow land on the plan screen instead.
 *
 * See expo/expo#28621 and the Expo Router `+not-found` docs.
 */
export default function NotFound() {
  return <Redirect href="/" />;
}
