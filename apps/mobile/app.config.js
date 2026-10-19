// Dynamic Expo config. Expo reads app.json and passes its contents in as
// `config`, so nothing here repeats the static config — this file only layers
// the Android size optimisations on top.
//
// Why a dynamic config instead of putting expo-build-properties in app.json:
// the plugin's options apply to every native build, but we only want to drop
// CPU architectures for the APKs we hand out directly. The APK build profiles
// in eas.json set EXPO_ABI_SPLIT=true (EAS also exposes profile env vars when
// it evaluates this file), and the Play Store .aab profile does not — so the
// store bundle keeps every architecture.

module.exports = ({ config }) => {
  // Read inside the function: the profile env var is present when EAS
  // evaluates this file, and this avoids any module-load-order surprises.
  const abiSplit = process.env.EXPO_ABI_SPLIT === 'true';

  const plugins = (config.plugins ?? []).filter(
    (plugin) => !(Array.isArray(plugin) && plugin[0] === 'expo-build-properties')
  );

  const androidBuildProperties = {
    // Compress native libraries inside the APK. React Native 0.73+ stores them
    // uncompressed by default, which inflates the .apk a lot. No code stripping.
    useLegacyPackaging: true,
  };

  if (abiSplit) {
    // Ship only arm64-v8a, the ABI used by essentially every phone since ~2016.
    // A universal APK otherwise carries four copies of every .so library.
    // Add "armeabi-v7a" here if you must support very old 32-bit-only devices.
    androidBuildProperties.buildArchs = ['arm64-v8a'];
  }

  return {
    ...config,
    plugins: [
      ...plugins,
      ['expo-build-properties', { android: androidBuildProperties }],
    ],
  };
};
