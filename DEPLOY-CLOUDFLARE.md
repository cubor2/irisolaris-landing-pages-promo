# Déploiement Cloudflare Pages — manuel (Wrangler)

> **Recommandé :** GitHub + build auto. Voir **`DEPLOY-GITHUB-CLOUDFLARE.md`**.

---

## Déploiement rapide

```powershell
cd "c:\Users\Admin\Desktop\Freelance\IRIS STORE\landing pages promo"
.\deploy-preview.ps1
```

Le script :
1. Lance `node build-site.js` → dossier `dist/`
2. Déploie `dist/` sur Cloudflare Pages

---

## Connexion Cloudflare (une fois)

```powershell
npx wrangler login
```

---

## URLs

| Landing | URL |
|---------|-----|
| PAC Climatisation | `https://irisolaris-landing-pages-promo.pages.dev/` |
| PAC Piscine | `https://irisolaris-landing-pages-promo.pages.dev/pac-piscine/` |
| Centrale PV | `https://irisolaris-landing-pages-promo.pages.dev/centrale-pv/` |

---

## Alternative : interface Cloudflare (sans terminal)

1. Exécuter `npm run build` en local
2. [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → projet
3. **Upload assets** → sélectionner le contenu du dossier `dist/`

---

## Ancien projet mono-LP

L'ancien déploiement `iss-pac-climatisation` (output `pac-climatisation` seul) reste utilisable pour la clim seule. Le setup actuel regroupe les 3 LPs dans `irisolaris-landing-pages-promo`.
