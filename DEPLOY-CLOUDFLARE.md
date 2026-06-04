# Déploiement Cloudflare Pages — URL de test

> **Recommandé :** GitHub + Cloudflare (auto-deploy à chaque push).  
> Voir **`DEPLOY-GITHUB-CLOUDFLARE.md`**.

Landing à publier : dossier `pac-climatisation/` (contient `index.html`).

URL de test typique après déploiement :
`https://iss-pac-climatisation.pages.dev`

---

## Prérequis

1. Compte [Cloudflare](https://dash.cloudflare.com/) (gratuit)
2. Node.js installé (déjà OK si `npx wrangler` fonctionne)

---

## Déploiement en 3 commandes

Ouvrir un terminal dans le dossier du projet :

```powershell
cd "c:\Users\Admin\Desktop\Freelance\IRIS STORE\landing pages promo"
```

### 1. Connexion Cloudflare (une seule fois)

```powershell
npx wrangler login
```

→ Le navigateur s’ouvre, connectez-vous et autorisez Wrangler.

### 2. Premier déploiement

```powershell
npx wrangler pages deploy pac-climatisation --project-name=iss-pac-climatisation --branch=preview
```

### 3. Mises à jour suivantes

Même commande à chaque modification :

```powershell
npx wrangler pages deploy pac-climatisation --project-name=iss-pac-climatisation --branch=preview
```

Wrangler affiche l’URL à la fin, par exemple :
`https://abc123.iss-pac-climatisation.pages.dev`

---

## Alternative : interface Cloudflare (sans terminal)

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **Create**
2. **Pages** → **Upload assets**
3. Nom du projet : `iss-pac-climatisation`
4. Glisser-déposer le contenu du dossier **`pac-climatisation`** (pas le dossier parent)
5. **Deploy site**

URL : `https://iss-pac-climatisation.pages.dev`

---

## Vérifications après mise en ligne

- [ ] Page s’affiche (hero, images, fonts)
- [ ] Formulaire → nouvelle ligne dans l’onglet **Leads**
- [ ] Cookies acceptés → événements dans **Events** + Dashboard
- [ ] Bandeau cookies et menu OK sur mobile

---

## Nom de projet personnalisé

Pour changer l’URL `.pages.dev`, modifiez `--project-name=` (ex. `irisolaris-pac-clim-test`).

Les noms doivent être en minuscules, chiffres et tirets uniquement.
