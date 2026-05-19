# Jodie Peltier — Préparation Mentale

Site vitrine et back-office pour l'activité de préparation mentale de Jodie Peltier.

## ✨ Fonctionnalités

- **Site public** : Accueil, présentation, éthique, à propos, services, réservation
- **Espace admin** (mot de passe : `jodie`) :
  - Planning interactif (créneaux par semaine)
  - Gestion des services et tarifs
  - Suivi des réservations
  - Édition de tous les textes du site
- **Données persistantes** dans le navigateur (localStorage)
- Design pastel apaisant (sauge, terracotta, ocre)

## 🚀 Lancer en local

Prérequis : [Node.js](https://nodejs.org/) (version 18+).

```bash
npm install
npm run dev
```

Le site s'ouvre sur `http://localhost:5173`.

## 📦 Construire pour la production

```bash
npm run build
```

Les fichiers prêts à déployer sont dans le dossier `dist/`.

## 🌐 Déploiement

### Option A — Netlify (recommandé, le plus simple)
1. Mettez `base: '/'` dans `vite.config.js`
2. Allez sur [netlify.com](https://netlify.com) → "Add new site" → "Import from Git"
3. Sélectionnez le repo, Netlify détecte automatiquement Vite

### Option B — Vercel
1. Mettez `base: '/'` dans `vite.config.js`
2. Allez sur [vercel.com](https://vercel.com) → "Add New Project" → importez le repo

### Option C — GitHub Pages
1. Vérifiez que `base: '/NOM_DU_REPO/'` dans `vite.config.js`
2. Dans Settings → Pages, choisissez "GitHub Actions"
3. Le workflow inclus se charge du reste

## 🎨 Personnalisation

Tous les textes par défaut se modifient directement depuis l'interface admin. Pour modifier les couleurs, voyez les variables CSS au début de `src/App.jsx` (`:root { --cream, --sage, ... }`).

## ⚠️ Notes importantes

- **Mot de passe admin** : actuellement `jodie` en clair (cherchez `'jodie'` dans `src/App.jsx`). À changer avant publication.
- **Données** : stockées dans le navigateur de chaque visiteur. Pour une vraie base de données partagée, il faudra ajouter un backend (Supabase, Firebase, etc.).
- **Réservations** : les demandes ne génèrent pas encore d'email automatique.

## 📄 Licence

© Jodie Peltier — Tous droits réservés
