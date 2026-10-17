import { Tabs } from 'expo-router';

import { Palette } from '@/constants/theme';

/**
 * Plan and Capture are the app's two main destinations, so they live in a tab
 * navigator rather than on a stack.
 *
 * This is what makes switching feel right: both screens stay mounted, so moving
 * between them is instant, there is no push animation on every tap, the stack
 * never grows, and a half-typed message on Capture survives a glance at the
 * plan. On a stack each tap pushed a new screen and remounted it — which is
 * exactly why the transitions felt wrong.
 *
 * The tab bar itself is hidden. The app's own NavBar at the top of each screen
 * is the navigation UI, matching the web app.
 */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
        sceneStyle: { backgroundColor: Palette.paper },
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="capture" />
    </Tabs>
  );
}
