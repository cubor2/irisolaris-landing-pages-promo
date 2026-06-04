# GitHub + Cloudflare Pages — déploiement automatique

Oui, c’est **plus simple** à long terme : chaque push sur GitHub redéploie la page automatiquement.

---

## Vue d’ensemble

```
GitHub (repo)  →  Cloudflare Pages  →  https://iss-pac-climatisation.pages.dev
     push              build auto
```

---

## Étape 1 — Créer le dépôt GitHub

1. [github.com/new](https://github.com/new)
2. Nom suggéré : `irisolaris-landing-pages-promo`
3. **Private** ou **Public** (au choix)
4. Ne pas cocher « Add README » (le projet existe déjà en local)
5. Créer le dépôt

---

## Étape 2 — Envoyer le code (première fois)

Dans PowerShell, à la racine du projet :

```powershell
cd "c:\Users\Admin\Desktop\Freelance\IRIS STORE\landing pages promo"

git init
git add .
git commit -m "PAC Climatisation v1 — landing promo Irisolaris Store"
git branch -M main
git remote add origin https://github.com/cubor2/irisolaris-landing-pages-promo.git
git push -u origin main
```

Repo : https://github.com/cubor2/irisolaris-landing-pages-promo

*(Si GitHub demande une auth : Personal Access Token ou GitHub CLI `gh auth login`)*

---

## Étape 3 — Relier Cloudflare à GitHub

1. [dash.cloudflare.com](https://dash.cloudflare.com/) → **Workers & Pages** → **Create**
2. **Pages** → **Connect to Git**
3. Autoriser Cloudflare sur GitHub → choisir le repo `irisolaris-landing-pages-promo`
4. Paramètres de build :

| Champ | Valeur |
|--------|--------|
| **Production branch** | `main` |
| **Framework preset** | None |
| **Build command** | *(vide)* |
| **Build output directory** | `pac-climatisation` |

5. **Save and Deploy**

---

## URL de test

Après le premier build :

- **Production** : `https://iss-pac-climatisation.pages.dev`  
  (ou le nom que Cloudflare propose selon le projet Pages)

Chaque `git push` sur `main` → nouveau déploiement en ~1 min.

---

## Mises à jour suivantes

```powershell
git add .
git commit -m "Description de la modification"
git push
```

Cloudflare rebuild tout seul. Plus besoin de `wrangler deploy` ni d’upload manuel.

---

## Avantages vs upload / Wrangler seul

| | GitHub + Cloudflare | Upload manuel |
|--|---------------------|---------------|
| Historique des versions | Oui | Non |
| Déploiement auto | Oui (push) | Non |
| Partage avec DSI / client | Repo | Fichiers zip |
| Rollback | Branches / commits | Difficile |

---

## Preview branches (optionnel)

Cloudflare Pages peut aussi déployer des **preview URLs** pour chaque branche ou PR — pratique pour valider PAC Piscine / Centrale PV avant `main`.

---

## Fichiers sensibles

- `config.js` contient l’URL Apps Script publique (normal pour une LP)
- Pas de secrets dans le repo si vous n’ajoutez pas de clés API privées
