// Dynamic Expo config. Expo reads app.json and passes its contents in as
// `config`, so nothing here repeats the static config — this file only layers
// the Android size optimisations on top.
//
// Why a dynamic config instead of putting expo-build-properties in app.json:
// the plugin's options apply to every native build, but some of them should
// only apply to the APKs we hand out directly. The APK build profiles in
// eas.json set the flags below (EAS also exposes profile env vars when it
// evaluates this file); the Play Store .aab profile leaves them unset.
//
//   EXPO_ABI_SPLIT=true  -> build a single ABI (arm64-v8a). Permanent for APKs;
//                           must stay off for the store bundle, which needs to
//                           reach 32-bit devices too.
//   EXPO_MINIFY=true     -> R8 + resource shrinking + JS bundle compression.
//                           Currently APK-only until a release build is
//                           confirmed to work; move it to the store profile
//                           once you trust it.

module.exports = ({ config }) => {
  // Read inside the function: the profile env vars are present when EAS
  // evaluates this file, and this avoids any module-load-order surprises.
  const abiSplit = process.env.EXPO_ABI_SPLIT === 'true';
  const minify = process.env.EXPO_MINIFY === 'true';

  const plugins = (config.plugins ?? []).filter(
    (plugin) => !(Array.isArray(plugin) && plugin[0] === 'expo-build-properties')
  );

  const android = {
    // Compress native libraries inside the APK. React Native 0.73+ stores them
    // uncompressed by default, which inflates the .apk a lot. No code stripping.
    useLegacyPackaging: true,
  };

  if (minify) {
    // R8 strips unused Java/Kotlin bytecode and obfuscates the rest.
    android.enableMinifyInReleaseBuilds = true;
    // Remove unreferenced resources. The plugin requires minify to be on.
    android.enableShrinkResourcesInReleaseBuilds = true;
    // Compress the Hermes JS bundle: smaller APK, slightly slower cold start.
    android.enableBundleCompression = true;
  }

  if (abiSplit) {
    // Ship only arm64-v8a, the ABI used by essentially every phone since ~2016.
    // A universal APK otherwise carries four copies of every .so library.
    // Add "armeabi-v7a" here if you must support very old 32-bit-only devices.
    android.buildArchs = ['arm64-v8a'];
  }

  return {
    ...config,
    plugins: [
      ...plugins,
      ['expo-build-properties', { android }],
    ],
  };
};
