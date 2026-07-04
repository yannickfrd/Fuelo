# fuelo

Application mobile pour suivre les pleins de carburant et signaler les conducteurs dangereux.

Développée avec [Expo](https://expo.dev) (SDK 56), React Native et SQLite.

## Fonctionnalités

- **Véhicules** — Ajoutez et gérez vos véhicules (voiture, moto, scooter, etc.)
- **Pleins** — Enregistrez vos pleins avec kilométrage, prix au litre et type de carburant
- **Radar** — Un chauffard en vue ? Appuyez sur le canard. Collecte de données 100 % scientifique, avec graphiques et tout. (Les résultats ne sont pas opposables devant un tribunal.)
- **Paramètres** — Choisissez entre le thème clair, sombre ou automatique (selon le téléphone)

## Stack technique

- [Expo Router](https://expo.dev/router) — navigation basée sur les fichiers
- [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/) + [drizzle-orm](https://orm.drizzle.team/) — base de données locale
- [expo-audio](https://docs.expo.dev/versions/latest/sdk/audio/) — retour sonore (coin coin 🦆)
- [react-native-gifted-charts](https://github.com/Abhinandan-Kushwaha/react-native-gifted-charts) — graphiques
- [react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/) v4 — animations

## Démarrage

> Un **build de développement** est requis (pas Expo Go) en raison des modules natifs.

```bash
# Installer les dépendances
npm install

# Compiler et lancer sur Android (première fois ou après des changements natifs)
npm run android

# Démarrer Metro uniquement (si le build est déjà installé)
npx expo start --localhost --android
```

### Windows + émulateur Android

Si Metro ne se connecte pas sur Windows :

```bash
adb reverse tcp:8081 tcp:8081
NODE_OPTIONS=--dns-result-order=ipv4first npx expo start --localhost --android
```

## Structure du projet

```
src/
  app/          # Écrans Expo Router (routing par fichiers)
  components/   # Composants réutilisables (PascalCase)
  constants/    # theme.ts — Colors, Fonts, Spacing
  contexts/     # Contextes React (sessionContext, themeContext)
  db/           # Client SQLite et schéma drizzle
  hooks/        # Hooks personnalisés (camelCase, préfixe use*)
  repositories/ # Couche d'accès aux données (un fichier par entité)
  types/        # Types TypeScript partagés
assets/
  sounds/       # coinCoin.mp3 — son de canard
  images/       # Icônes et splash screen
```

## Commandes

```bash
npm run lint     # ESLint via expo lint
npm run android  # Compiler et lancer sur émulateur/appareil Android
npm run web      # Lancer sur navigateur web
```

