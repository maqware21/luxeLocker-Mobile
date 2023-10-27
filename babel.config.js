module.exports = {
  presets: ["module:metro-react-native-babel-preset"],
  plugins: [
    [
      "module-resolver",
      {
        root: ["./src"],
        extensions: [
          ".ios.ts",
          ".android.ts",
          ".ts",
          ".ios.tsx",
          ".android.tsx",
          ".jsx",
          ".js",
          ".json",
        ],
        alias: {
          "^~(.+)": "./src/\\1",
          "@components": "./src/components",
          "@assets": "./assets",
          "@utils": "./src/utils",
        },
      },
    ],
    [
      "react-native-reanimated/plugin",
      {
        globals: ["__scanCodes"],
      },
    ],
    [
      "module:react-native-dotenv",
      {
        envName: "APP_ENV",
        moduleName: "@env",
        path: ".env"
      }
    ]
  ],
};
