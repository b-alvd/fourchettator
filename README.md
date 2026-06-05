# Fourchettator.fr - Next.js + Turso (libSQL)

Site de recettes : frontend + backend (App Router + route handlers).
Base de données = **SQLite** : un fichier en local, Turso (libSQL) en prod sur Vercel.

## Démarrer en local

```bash
npm install
npm run dev
```

Sans `.env`, l'app tourne en **mode seed mémoire**

## Avec une base (vrai fichier SQLite, zéro hébergement)

```bash
cp .env.example .env
# dans .env : TURSO_DATABASE_URL=file:dev.db
npm run db:init   # crée les tables + insère les recettes dans dev.db
npm run dev
```

Dès que `TURSO_DATABASE_URL` est rempli, toute la couche données bascule sur la base (recettes + favoris persistés). Aucun changement de code.

## Passer en prod sur Vercel (base Turso)

1. Créer une base Turso (CLI ou dashboard turso.tech) et récupérer son URL `libsql://…` + un token.
2. En local, pointer `.env` dessus le temps du seed puis lancer `npm run db:init` :
   ```
   TURSO_DATABASE_URL=libsql://ton-instance.turso.io
   TURSO_AUTH_TOKEN=ton-token
   ```
3. Push le repo sur GitHub → importer sur Vercel (détection auto de Next.js).
4. Sur Vercel → **Settings → Environment Variables**, ajouter :
   - `TURSO_DATABASE_URL` = `libsql://ton-instance.turso.io`
   - `TURSO_AUTH_TOKEN` = ton token
5. Redeploy.

Sans ces variables en prod, le site reste fonctionnel en mode mémoire (favoris non persistés).

## Architecture

```
app/
  page.js                    Accueil (lit la DB au runtime)
  recettes/page.js           Liste (délègue au client Browse)
  recettes/[id]/page.js      Détail (server component)
  api/recipes/route.js       GET liste (?q= &cat= &sort=)
  api/recipes/[id]/route.js  GET une recette
  api/favorites/route.js     GET / POST favoris
lib/
  data.js        recettes de référence (seed + fallback mémoire)
  db.js          client libSQL singleton (safe serverless)
  recipes.js     accès données recettes (DB ou mémoire)
  favorites.js   accès données favoris (DB ou mémoire)
components/      Header, Browse, RecipeCard, RecipeGrid, IngredientsPanel, useFavorites
db/
  schema.sql     tables SQLite/libSQL
  seed.js        npm run db:init
```

## Pourquoi Turso plutôt qu'un SQLite fichier sur Vercel ?

Sur Vercel (serverless) le système de fichiers est éphémère et en lecture seule : un fichier `.db` committé se **lit** mais toute **écriture est perdue**. Turso garde la simplicité de SQLite (un client libSQL, le même code) tout en supportant les écritures en prod, sans serveur à gérer.
