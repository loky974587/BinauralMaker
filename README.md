# Binaural Maker

Application React + Tailwind + PrimeReact pour générer des battements binauraux dans le navigateur via la Web Audio API.

## Prérequis

- Node.js 20+
- npm 10+
- Firebase CLI (`npm i -g firebase-tools`)

## Lancer en local

```bash
npm install
npm run dev
```

## Build de production

```bash
npm run build
npm run preview
```

## Déploiement Firebase Hosting

1. Remplacer `your-firebase-project-id` dans `.firebaserc`.
2. Se connecter: `firebase login`
3. Déployer:

```bash
npm run build
firebase deploy --only hosting
```

## Déploiement automatique via GitHub Actions

Un workflow est inclus dans `.github/workflows/deploy-firebase.yml` et déploie automatiquement sur Firebase Hosting à chaque merge/push sur `main`.

Secrets GitHub à configurer dans le repository :

- `FIREBASE_SERVICE_ACCOUNT`: JSON du compte de service Firebase (clé privée).
- `FIREBASE_PROJECT_ID`: ID du projet Firebase cible.

Le workflow peut aussi être lancé manuellement via l'onglet **Actions** (`workflow_dispatch`).

## Fonctionnalités

- Réglage de la fréquence de base.
- Réglage de la fréquence de battement binaural.
- Contrôle du volume.
- Lecture/Pause en temps réel avec séparation gauche/droite.

> ⚠️ Utiliser un casque stéréo pour percevoir l'effet binaural.
