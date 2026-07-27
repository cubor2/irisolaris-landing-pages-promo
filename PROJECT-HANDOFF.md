# Irisolaris Store — Landing Pages Promo · Handoff v3

> Dernière mise à jour : juin 2026  
> Statut : **3 landing pages en production** — formulaires HubSpot · stats visiteurs Google Sheet

---

## Vue d'ensemble

Projet de landing pages promotionnelles statiques (HTML/CSS/JS) pour Irisolaris Store.

| Rôle | Outil |
|------|-------|
| **Formulaires / leads** | HubSpot (embed par LP) |
| **Stats visiteurs** | Google Sheet (onglet Events + Dashboard) |

| Landing | Dossier | `landingId` | Statut |
|---------|---------|-------------|--------|
| PAC Climatisation | `pac-climatisation/` | `pac-climatisation` | ✅ prod |
| PAC Piscine | `pac-piscine/` | `pac-piscine` | ✅ prod |
| Centrale PV | `centrale-pv/` | `centrale-pv` | ✅ prod |

---

## URLs production (Cloudflare Pages)

| Landing | URL |
|---------|-----|
| PAC Climatisation | `https://irisolaris-landing-pages-promo.pages.dev/` |
| PAC Piscine | `https://irisolaris-landing-pages-promo.pages.dev/pac-piscine/` |
| Centrale PV | `https://irisolaris-landing-pages-promo.pages.dev/centrale-pv/` |

Alias : `/pac-climatisation` redirige vers `/`

---

## Formulaires HubSpot

Portal ID : **8428913**

| Landing | Form ID |
|---------|---------|
| PAC Climatisation | `66d613f6-2373-442c-a19d-557d389f30b8` |
| PAC Piscine | `b32af30a-4c92-4b9e-a055-3861bff00107` |
| Centrale PV | `40b563c0-0cb6-4cbb-84d0-effbf7b45db1` |

Script commun (dans chaque `index.html`) :
```html
<script src="https://js.hsforms.net/forms/embed/8428913.js" defer></script>
```

Textes des anciens formulaires custom (référence HubSpot) : **`FORMULAIRES-HUBSPOT.txt`**

### Rollback formulaires custom

Branche Git **`backup-formulaires-custom`** — contient les 3 tunnels 4 étapes + envoi Google Sheet.

---

## Google Sheet (stats visiteurs uniquement)

### URL
https://docs.google.com/spreadsheets/d/1BM7ow3NBnbc-ItYQV8czw0cvmjKI36G5tBYac-XnI1c/edit

### Onglets
| Onglet | Rôle |
|--------|------|
| **Dashboard** | Stats visiteurs par LP (4 indicateurs) |
| **Events** | pageview, session_end (cookies analytics requis) |
| **Leads** | Historique ancien formulaire custom (plus alimenté) |

### Dashboard — indicateurs actifs
- Visiteurs (sessions uniques)
- Pages vues
- Temps moyen sur la page (secondes)
- Visites courtes (< 30 s)

Les leads et taux de conversion sont gérés dans **HubSpot**.

### Apps Script
- **Code** : `google-apps-script/Code.gs`
- **Setup DSI** : `google-apps-script/INSTRUCTIONS.txt`
- **URL web app** :
  ```
  https://script.google.com/macros/s/AKfycbzp_iJPJZQhYEx5_fYY1Lkzhwya2p5vf7PFB0O3mixIXKyygZW5Kjk8uvgYcUi5C87D/exec
  ```
- Après chaque modif `Code.gs` : nouvelle version web + `repairDashboard()`

Menu Sheet : **ISS Landing Pages** → réinitialisation / recalcul.

---

## Architecture d'un dossier LP

```
pac-climatisation/   (idem pac-piscine/, centrale-pv/)
├── index.html       # embed HubSpot dans #form-panel
├── css/
├── js/
│   ├── config.js    # landingId, sheetWebAppUrl (stats)
│   ├── stats.js     # pageview / session_end → Sheet
│   └── form.js      # scroll CTA vers #devis (garde-fou si pas de #lead-form)
└── assets/
```

### Scripts (index.html)
```
config.js → nav.js → cookie-consent.js → stats.js → form.js → script HubSpot
```

---

## Build & déploiement

```powershell
npm run build          # génère dist/
npm run preview        # build + serve local :5500
.\deploy-preview.ps1   # build + wrangler deploy manuel
```

Cloudflare Pages (auto sur `git push main`) :
| Champ | Valeur |
|--------|--------|
| Build command | `npm run build` |
| Output directory | `dist` |

Guide : **`DEPLOY-GITHUB-CLOUDFLARE.md`**

Repo : https://github.com/cubor2/irisolaris-landing-pages-promo

---

## Checklist mise en prod

1. [ ] `Code.gs` déployé (nouvelle version web Apps Script)
2. [ ] `repairDashboard()` exécuté une fois
3. [ ] `git push` sur `main` → Cloudflare rebuild
4. [ ] Vérifier les 3 URLs + formulaires HubSpot
5. [ ] Test stats visiteurs (voir `INSTRUCTIONS.txt`)

---

## Historique

1. **v1** — PAC Climatisation, formulaire custom → Sheet, Cloudflare mono-LP
2. **v2** — 3 LPs, Dashboard multi-colonnes, build `dist/` unifié
3. **v3** — Formulaires HubSpot, Dashboard stats visiteurs seules, carrousel mobile trust bar
