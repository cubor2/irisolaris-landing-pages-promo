# Irisolaris Store — Landing Pages Promo · Handoff v1

> Dernière mise à jour : juin 2026  
> Statut : **PAC Climatisation = v1 livrable** · PAC Piscine & Centrale PV = à décliner

---

## Vue d'ensemble

Projet de landing pages promotionnelles statiques (HTML/CSS/JS) pour Irisolaris Store, livrables à la DSI pour hébergement. Une Google Sheet centralisée collecte les leads et les stats visiteurs via Google Apps Script.

| Landing | Dossier | Statut |
|---------|---------|--------|
| PAC Climatisation | `pac-climatisation/` | ✅ v1 prête |
| PAC Piscine | `pac-piscine/` | ⏳ à créer |
| Centrale PV | `centrale-pv/` | ⏳ à créer |

---

## Ressources partagées (communes aux 3 LPs)

### Google Sheet
- **URL** : https://docs.google.com/spreadsheets/d/1BM7ow3NBnbc-ItYQV8czw0cvmjKI36G5tBYac-XnI1c/edit
- **Onglets** : `Dashboard` · `Events` · `Leads`

### Apps Script
- **Code** : `google-apps-script/Code.gs`
- **Setup DSI** : `google-apps-script/INSTRUCTIONS.txt`
- **URL déploiement web (juin 2026)** :
  ```
  https://script.google.com/macros/s/AKfycbzp_iJPJZQhYEx5_fYY1Lkzhwya2p5vf7PFB0O3mixIXKyygZW5Kjk8uvgYcUi5C87D/exec
  ```
- **Test obligatoire après chaque déploiement** : ouvrir l'URL `/exec` → doit afficher `{"status":"ok",...}`

### Fonctions Apps Script utiles
| Fonction | Rôle |
|----------|------|
| `setupAll()` | Réparation complète (Leads, Dashboard, onglets vides) |
| `repairDashboard()` | Recalcule le Dashboard + colonne d'aide |
| `repairLeads()` | Corrige le décalage de colonnes Leads |
| `cleanParasiteLeads()` | Supprime les lignes Leads incomplètes |
| `cleanDefaultSheets()` | Supprime les onglets vides type « Feuille 1 » |

### Charte graphique
- Fichier : `charte graphique.txt`
- Couleurs : `#2377ff` · `#06244c` · `#FF610B`
- Titres : **Korolev Condensed** (fichiers `.otf` dans `Korolev-Font/` → copier vers `assets/fonts/` de chaque LP)
- Corps : sans-serif système

---

## Architecture PAC Climatisation (modèle à répliquer)

```
pac-climatisation/
├── index.html
├── css/
│   ├── style.css          # Contenu LP (hero, form, sections)
│   ├── iss-chrome.css     # Header, footer, nav (commun)
│   └── cookie-consent.css # Bandeau cookies
├── js/
│   ├── config.js          # ⚠️ landingId, landingLabel, sheetWebAppUrl
│   ├── nav.js
│   ├── cookie-consent.js  # Consentement localStorage + événement issCookieConsent
│   ├── stats.js           # Tracking Events (POST, record_type=event)
│   └── form.js            # Tunnel 4 étapes + envoi Leads (POST, record_type=lead)
└── assets/
    ├── fonts/             # Korolev .otf
    ├── cookie/            # SVG icônes bandeau
    ├── logo-header.svg
    ├── logo-footer.svg
    ├── footer-bg.webp
    ├── hero-heiwa-clim.webp
    └── favicon.png
```

### Ordre des scripts (index.html)
```html
config.js → nav.js → cookie-consent.js → stats.js → form.js
```

### Flux données

```
Visiteur accepte cookies analytics
  → stats.js envoie record_type=event → onglet Events
  → pageview, form_start, form_step, session_end, form_complete

Visiteur envoie formulaire complet
  → form.js envoie record_type=lead → onglet Leads (validation serveur stricte)

Dashboard
  → valeurs calculées par Apps Script (pas de formules Sheet)
  → colonne « Comment c'est calculé » pour le client
```

### Tunnel formulaire (4 étapes)
1. Logement (propriétaire, type, surface, CP)
2. Besoin (climatisation/chauffage, chauffage actuel)
3. Projet (type, délai)
4. Contact (prénom, nom, tel, email, RGPD)

---

## Pièges rencontrés en v1 (à ne pas refaire)

| Problème | Cause | Solution |
|----------|-------|----------|
| Leads non enregistrés | `fetch` no-cors ne fonctionne pas | POST via iframe cachée |
| Lignes parasites dans Leads | Ancien script + events mal routés | `record_type` strict event/lead |
| 0 visiteur au Dashboard | URL `/exec` pas redeployée | Toujours tester `/exec` après deploy |
| Deux URLs différentes | Nouveau deploy ≠ URL dans config.js | Copier l'URL depuis « Gérer les déploiements » |
| Colonnes Leads décalées | Migration Session ID mal alignée | `repairLeads()` |
| Dashboard #NAME? | Formules Sheet locale FR | Calcul côté Apps Script |
| Taux conversion > 100% | Données de test (leads >> visiteurs) | Normal en dev, se stabilise en prod |

---

## Checklist déploiement d'une nouvelle LP

1. [ ] Dupliquer `pac-climatisation/` → `pac-piscine/` ou `centrale-pv/`
2. [ ] Adapter `config.js` : `landingId`, `landingLabel` (garder la même `sheetWebAppUrl`)
3. [ ] Adapter contenu `index.html` (hero, textes, images produit)
4. [ ] Adapter `style.css` si visuels spécifiques (hero image, etc.)
5. [ ] Réutiliser tel quel : `iss-chrome.css`, `cookie-consent.*`, `nav.js`, `form.js`, `stats.js`
6. [ ] Vérifier fonts + assets copiés
7. [ ] Tester en local : cookies → Events tab · formulaire → Leads tab
8. [ ] Livrer dossier complet à la DSI (inclure `assets/fonts/`)

---

## Contenus brief pour les 2 LPs restantes

### PAC Piscine
- Accroche : « Des prix qui vont vous faire plonger ! »
- Produit : HEIWA BLUE 35–115 m³
- `landingId`: `pac-piscine` · `landingLabel`: `PAC Piscine`

### Centrale PV
- Accroche : « PAYEZ MOINS, TOUS LES JOURS »
- Produit : 3–18 kWc
- `landingId`: `centrale-pv` · `landingLabel`: `Centrale PV`

---

## Déploiement (recommandé : GitHub → Cloudflare)

1. Repo GitHub + push du code
2. Cloudflare Pages → **Connect to Git** → output dir : `pac-climatisation`

Guide : **`DEPLOY-GITHUB-CLOUDFLARE.md`**

Alternative sans Git : **`DEPLOY-CLOUDFLARE.md`** ou `.\deploy-preview.ps1`

---

## Pistes v2 (hors scope v1)

- Intégration GA4 / GTM (hook `issCookieConsent` déjà en place dans stats.js)
- Hébergement HTTPS DSI (évite les quirks `file://` en test local)
- Reset stats de test avant mise en prod client
- Formulaire : champs spécifiques par LP si besoin métier (sinon garder le même tunnel)

---

## Historique sessions (résumé)

1. **Structure initiale** — LP PAC Climatisation mobile-first, charte Irisolaris, tunnel multi-étapes
2. **Header/footer** — Alignement site source, fonts Korolev self-hosted, footer 4 colonnes
3. **Formulaire** — Validation UX, envoi Sheet via iframe, leads complets uniquement
4. **Cookies** — Bandeau CookieYes-like, consentement analytics gating stats
5. **Stats & Dashboard** — Onglets Events/Leads, Dashboard calculé, colonnes d'aide client
6. **Debug production** — Parasites Leads, décalage colonnes, redeploy `/exec`, URL config mise à jour
