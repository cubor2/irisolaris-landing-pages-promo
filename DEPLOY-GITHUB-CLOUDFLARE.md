# GitHub + Cloudflare Pages — déploiement automatique (3 landing pages)

Chaque push sur `main` reconstruit et déploie les **3 landing pages** sur un seul site Cloudflare.

---

## Vue d'ensemble

```
GitHub (repo)  →  npm run build  →  dist/  →  Cloudflare Pages
     push            build-site.js              irisolaris-landing-pages-promo.pages.dev
```

| URL production | Landing |
|----------------|---------|
| `/` | PAC Climatisation |
| `/pac-piscine/` | PAC Piscine |
| `/centrale-pv/` | Centrale PV |

Redirections alias : `/pac-climatisation` → `/`

---

## Paramètres Cloudflare Pages (à configurer une fois)

1. [dash.cloudflare.com](https://dash.cloudflare.com/) → **Workers & Pages** → projet lié au repo
2. **Settings** → **Build & deployments** :

| Champ | Valeur |
|--------|--------|
| **Production branch** | `main` |
| **Framework preset** | None |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |

3. **Save** puis **Retry deployment** (ou push sur `main`)

> Si le projet s'appelle encore `iss-pac-climatisation` avec output `pac-climatisation`, **mettre à jour** ces deux champs après le push multi-LP.

---

## URLs de test

- **PAC Climatisation** : `https://irisolaris-landing-pages-promo.pages.dev/?utm_source=test&utm_medium=manual&utm_campaign=clim-qa`
- **PAC Piscine** : `https://irisolaris-landing-pages-promo.pages.dev/pac-piscine/?utm_source=test&utm_medium=manual&utm_campaign=piscine-qa`
- **Centrale PV** : `https://irisolaris-landing-pages-promo.pages.dev/centrale-pv/?utm_source=test&utm_medium=manual&utm_campaign=pv-qa`

---

## Build local

```powershell
cd "c:\Users\Admin\Desktop\Freelance\IRIS STORE\landing pages promo"
npm run build
npx serve dist -l 5500
```

- Clim : http://localhost:5500/
- Piscine : http://localhost:5500/pac-piscine/
- PV : http://localhost:5500/centrale-pv/

---

## Mises à jour

```powershell
git add .
git commit -m "Description de la modification"
git push
```

Cloudflare rebuild en ~1 min.

---

## Déploiement manuel (sans attendre le push)

```powershell
.\deploy-preview.ps1
```

Nécessite `npx wrangler login` une fois.

---

## Structure du build (`build-site.js`)

- Copie `pac-climatisation/` à la racine de `dist/` (chemins absolus `/css/`, `/js/`, `/assets/`)
- Copie `pac-piscine/` et `centrale-pv/` dans des sous-dossiers avec chemins relatifs dans `index.html`
- Génère `dist/_redirects` pour les alias d'URL

Les sources restent dans leurs dossiers respectifs ; ne pas éditer `dist/` à la main.

---

## Repo GitHub

https://github.com/cubor2/irisolaris-landing-pages-promo
