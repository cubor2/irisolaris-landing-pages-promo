# Irisolaris Store — Landing Pages Promo · Handoff v2

> Dernière mise à jour : juin 2026  
> Statut : **3 landing pages livrées** (PAC Climatisation · PAC Piscine · Centrale PV)

---

## Vue d'ensemble

Projet de landing pages promotionnelles statiques (HTML/CSS/JS) pour Irisolaris Store. Une Google Sheet centralisée collecte les leads et les stats visiteurs via Google Apps Script.

| Landing | Dossier | `landingId` | Statut |
|---------|---------|-------------|--------|
| PAC Climatisation | `pac-climatisation/` | `pac-climatisation` | ✅ v1 |
| PAC Piscine | `pac-piscine/` | `pac-piscine` | ✅ v1 |
| Centrale PV | `centrale-pv/` | `centrale-pv` | ✅ v1 |

---

## URLs production (Cloudflare Pages)

| Landing | URL |
|---------|-----|
| PAC Climatisation | `https://irisolaris-landing-pages-promo.pages.dev/` |
| PAC Piscine | `https://irisolaris-landing-pages-promo.pages.dev/pac-piscine/` |
| Centrale PV | `https://irisolaris-landing-pages-promo.pages.dev/centrale-pv/` |

Alias : `/pac-climatisation` redirige vers `/`

---

## Ressources partagées

### Google Sheet
- **URL** : https://docs.google.com/spreadsheets/d/1BM7ow3NBnbc-ItYQV8czw0cvmjKI36G5tBYac-XnI1c/edit
- **Onglets** : `Dashboard` · `Events` · `Leads`

### Apps Script
- **Code** : `google-apps-script/Code.gs`
- **Setup DSI** : `google-apps-script/INSTRUCTIONS.txt`
- **URL déploiement web** :
  ```
  https://script.google.com/macros/s/AKfycbzp_iJPJZQhYEx5_fYY1Lkzhwya2p5vf7PFB0O3mixIXKyygZW5Kjk8uvgYcUi5C87D/exec
  ```
- **Test obligatoire** : ouvrir l'URL `/exec` → `{"status":"ok",...}`

### Dashboard
Colonnes par landing : **PAC Climatisation** · **PAC Piscine** · **Centrale PV** · **Total** · **Comment c'est calculé**

Menu Google Sheet : **ISS Landing Pages** → réinitialisation / recalcul.

### Charte graphique
- Fichier : `charte graphique.txt`
- Couleurs : `#2377ff` · `#06244c` · `#FF610B`
- Titres : **Korolev Condensed** (`assets/fonts/` dans chaque LP)

### Contenus source
- Campagnes visuelles + wordings : `Campagnes/`
- Fiches produits : `Contenus/infos produits.txt`

---

## Contenu par landing

### PAC Climatisation
- Hero : « Coup de froid sur les prix ! » — **1 690€ TTC** — HEIWA Hyōkō 3
- Image : `assets/campaign-clim.webp`

### PAC Piscine
- Hero : « À ce prix-là, plongez ! » — **3 590€** — HEIWA Blue 35 m³
- Image : `assets/campaign-piscine.webp`
- Formulaire étape 2 adapté piscine (besoin + équipement actuel)

### Centrale PV
- Hero : « Payez moins, tous les jours ! » — **6 990€** — ASTRO N7s 455 W
- Mention 6 kWc dans le disclaimer `*`
- Image : `assets/campaign-centrale.webp`
- Formulaire étape 2 adapté PV (projet solaire + situation toiture)

---

## Architecture d'un dossier LP

```
pac-climatisation/   (idem pac-piscine/, centrale-pv/)
├── index.html
├── css/             style.css · iss-chrome.css · cookie-consent.css
├── js/              config.js · nav.js · cookie-consent.js · stats.js · form.js
├── assets/          fonts · images campagne · produit · logos
└── _redirects       (utilisé en dev mono-LP ; le build génère dist/_redirects)
```

### `config.js` (par LP)
```javascript
landingId: "pac-climatisation" | "pac-piscine" | "centrale-pv"
landingLabel: "PAC Climatisation" | "PAC Piscine" | "Centrale PV"
sheetWebAppUrl: (identique pour les 3)
```

### Scripts (index.html)
```
config.js → nav.js → cookie-consent.js → stats.js → canvas-confetti → form.js
```

### Tunnel formulaire (4 étapes)
1. Logement (propriétaire, type, surface, CP)
2. Besoin (adapté par LP)
3. Projet (type, délai)
4. Contact (prénom, nom, tel, email, RGPD)

---

## Build & déploiement

### Build multi-LP
```powershell
npm run build          # génère dist/
npm run preview        # build + serve local sur :5500
.\deploy-preview.ps1   # build + wrangler deploy
```

Le script `build-site.js` :
- Place **PAC Climatisation** à la racine de `dist/`
- Place **PAC Piscine** et **Centrale PV** dans `dist/pac-piscine/` et `dist/centrale-pv/`
- Réécrit les chemins HTML en relatifs pour les sous-dossiers
- Génère `dist/_redirects`

### Cloudflare Pages (GitHub auto-deploy)
| Champ | Valeur |
|--------|--------|
| Build command | `npm run build` |
| Output directory | `dist` |

Guide complet : **`DEPLOY-GITHUB-CLOUDFLARE.md`**

### Repo GitHub
https://github.com/cubor2/irisolaris-landing-pages-promo

---

## Preview locale (dossier source)

```powershell
npx serve pac-climatisation -l 5500
npx serve pac-piscine -l 5501
npx serve centrale-pv -l 5502
```

En mode source, chaque LP utilise des chemins absolus `/css/`, `/js/`, `/assets/` (servir le dossier LP à la racine du serveur).

---

## Pièges connus

| Problème | Cause | Solution |
|----------|-------|----------|
| CSS/JS cassés en prod | Chemins relatifs au mauvais dossier | Utiliser `npm run build` + `dist/` |
| LP piscine/PV sans style | Servies hors sous-dossier | URL `/pac-piscine/` ou `/centrale-pv/` |
| Leads non enregistrés | fetch no-cors | POST via iframe (form.js) |
| 0 visiteur Dashboard | `/exec` pas redeployé | Tester `/exec` après chaque deploy Apps Script |
| Colonnes Leads décalées | Migration Session ID | `repairLeads()` |

---

## Checklist mise en prod

1. [ ] `Code.gs` déployé (nouvelle version web Apps Script)
2. [ ] `repairDashboard()` ou `resetTestData()` si besoin
3. [ ] Cloudflare : build command `npm run build`, output `dist`
4. [ ] `git push` sur `main` → vérifier les 3 URLs
5. [ ] Protocole test dans `google-apps-script/INSTRUCTIONS.txt` (par LP)

---

## Pistes v2 (hors scope)

- GA4 / GTM (hook `issCookieConsent` prêt dans stats.js)
- Domaine custom DSI (ex. promo.irisolaris-store.com)
- Champs formulaire métier supplémentaires par LP

---

## Historique

1. **v1** — PAC Climatisation, Sheet + Dashboard, Cloudflare mono-LP
2. **v2** — PAC Piscine + Centrale PV, Dashboard multi-colonnes, build `dist/` 3-en-1, confetti succès formulaire
