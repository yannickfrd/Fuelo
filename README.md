# fuelo

A mobile app to track vehicle fillups and monitor reckless drivers around you.

Built with [Expo](https://expo.dev) (SDK 56), React Native, and SQLite.

## Features

- **Vehicles** — Add and manage your vehicles (car, motorcycle, scooter, etc.)
- **Fillups** — Log fuel fillups with odometer, price per liter, and fuel type
- **Radar** — Spot a reckless driver? Hit the duck button. Purely scientific data collection with charts and everything. (Results may not hold up in court.)
- **Settings** — Choose between light, dark, or system theme

## Stack

- [Expo Router](https://expo.dev/router) — file-based navigation
- [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/) + [drizzle-orm](https://orm.drizzle.team/) — local database
- [expo-audio](https://docs.expo.dev/versions/latest/sdk/audio/) — sound feedback
- [react-native-gifted-charts](https://github.com/Abhinandan-Kushwaha/react-native-gifted-charts) — charts
- [react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/) v4 — animations

## Getting started

> A **development build** is required (not Expo Go) due to native modules.

```bash
# Install dependencies
npm install

# Build and run on Android (first time or after native changes)
npm run android

# Start Metro only (after the dev build is already installed)
npx expo start --localhost --android
```

### Windows + Android emulator

If Metro fails to connect on Windows, use:

```bash
adb reverse tcp:8081 tcp:8081
NODE_OPTIONS=--dns-result-order=ipv4first npx expo start --localhost --android
```

## Project structure

```
src/
  app/          # Expo Router screens (file-based routing)
  components/   # Reusable UI components (PascalCase)
  constants/    # theme.ts — Colors, Fonts, Spacing
  contexts/     # React contexts (sessionContext, themeContext)
  db/           # SQLite client and drizzle schema
  hooks/        # Custom hooks (camelCase, use* prefix)
  repositories/ # Data access layer (one file per entity)
  types/        # Shared TypeScript types
assets/
  sounds/       # coinCoin.mp3 — duck quack sound
  images/       # Icons and splash screen assets
```

## Commands

```bash
npm run lint     # ESLint via expo lint
npm run android  # Build and run on Android emulator/device
npm run web      # Start on web
```

