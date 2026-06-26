# Hébergement des landing pages promo — Guide pour le service IT

**Destinataire :** service informatique Irisolaris
**Objet :** héberger 3 landing pages statiques et les publier sur des sous-domaines de `irisolaris-store.com`

---

## 1. Ce que vous recevez

Trois dossiers indépendants, 100 % statiques (HTML/CSS/JS, aucune base de données, aucun backend à installer) :

```
pac-climatisation/     ? landing « PAC Climatisation »
pac-piscine/           ? landing « PAC Piscine »
centrale-pv/           ? landing « Centrale PV »
```

Chaque dossier est **autonome** et contient tout le nécessaire :

```
pac-climatisation/
??? index.html
??? css/        (style.css, iss-chrome.css, cookie-consent.css)
??? js/         (config.js, nav.js, cookie-consent.js, stats.js, form.js)
??? assets/     (images .webp/.png, polices .otf, icônes .svg, favicon)
```

> Les autres fichiers du dépôt (`dist/`, `build-site.js`, `_redirects`, `*.md`, `google-apps-script/`) sont des outils internes **à ignorer** pour l'hébergement.

---

## 2. Modèle recommandé : 1 sous-domaine = 1 dossier

| Sous-domaine (à créer) | Contenu servi (racine du site) |
|------------------------|--------------------------------|
| `clim.irisolaris-store.com` | contenu du dossier `pac-climatisation/` |
| `piscine.irisolaris-store.com` | contenu du dossier `pac-piscine/` |
| `pv.irisolaris-store.com` | contenu du dossier `centrale-pv/` |

> Les noms de sous-domaines sont indicatifs : adaptez-les à votre convention. L'important est **qu'un dossier soit servi à la racine de son sous-domaine**.

**Pourquoi à la racine ?** Les pages utilisent des chemins absolus (`/css/…`, `/js/…`, `/assets/…`). Le contenu de chaque dossier doit donc être déposé **directement à la racine** du sous-domaine, par exemple :

```
clim.irisolaris-store.com  ?  /var/www/clim/
   ??? index.html
   ??? css/
   ??? js/
   ??? assets/
```

`https://clim.irisolaris-store.com/css/style.css` doit répondre 200.

---

## 3. Pas à pas

### Étape 1 — Créer les sous-domaines (DNS)
Créer 3 enregistrements DNS (A / AAAA ou CNAME) pointant vers votre hébergement web :
- `clim` ? serveur web
- `piscine` ? serveur web
- `pv` ? serveur web

### Étape 2 — Déposer les fichiers
Copier **le contenu** de chaque dossier (et non le dossier lui-même) dans la racine web du sous-domaine correspondant.

### Étape 3 — Activer HTTPS
Installer un certificat SSL pour chaque sous-domaine (Let's Encrypt ou certificat wildcard `*.irisolaris-store.com`). **HTTPS est obligatoire** (voir points d'attention).

### Étape 4 — Forcer le HTTPS et le `www`? non applicable
- Rediriger `http://` ? `https://` sur chaque sous-domaine.
- Définir `index.html` comme document par défaut.

### Étape 5 — Vérifier
Ouvrir chaque sous-domaine en HTTPS et dérouler la checklist (section 6).

---

## 4. Configuration serveur

### Document par défaut
`index.html`

### Types MIME à servir correctement
Vérifier que ces extensions sont servies avec le bon `Content-Type` (souvent OK par défaut, mais `.webp` et `.otf` manquent parfois sur d'anciennes configs) :

| Extension | Content-Type |
|-----------|--------------|
| `.webp` | `image/webp` |
| `.svg` | `image/svg+xml` |
| `.otf` | `font/otf` |
| `.js` | `text/javascript` |
| `.css` | `text/css` |

**Exemple Nginx :**
```nginx
types {
    image/webp  webp;
    font/otf    otf;
}
```

**Exemple Apache (.htaccess) :**
```apache
AddType image/webp .webp
AddType font/otf .otf
```

### Cache (recommandé, optionnel)
Mettre en cache long les assets versionnables (`/assets/`, `/css/`, `/js/`) et court le `index.html`.

---

## 5. Redirections

Dans le modèle « 1 sous-domaine = 1 dossier », **aucune redirection interne n'est nécessaire**. Le fichier `_redirects` présent dans les dossiers est spécifique à notre plateforme de test (Cloudflare) et peut être **ignoré / supprimé**.

Redirections utiles à mettre en place de votre côté :
- `http://` ? `https://` (chaque sous-domaine)
- éventuellement, des liens depuis le site principal (boutons campagne) vers les sous-domaines.

---

## 6. Points d'attention

1. **HTTPS obligatoire.** Le formulaire (HubSpot) et les polices se chargent en HTTPS. En HTTP, le navigateur bloquerait des contenus (« mixed content ») et le formulaire ne s'afficherait pas.

2. **Formulaire HubSpot (script externe).** Chaque page charge le script `https://js.hsforms.net/forms/embed/8428913.js`.
   - Le serveur n'a rien à installer, mais le **navigateur du visiteur** doit pouvoir joindre HubSpot.
   - Si vous appliquez une **Content-Security-Policy (CSP)**, autorisez au minimum :
     `js.hsforms.net`, `*.hsforms.net`, `*.hsforms.com`, `*.hs-sites.com`, `*.hubspot.com`, `forms.hsforms.com`.
   - Les soumissions de formulaire partent directement vers HubSpot (pas de traitement côté serveur).

3. **Casse des noms de fichiers (Linux).** Sur serveur Linux, les noms sont sensibles à la casse. Déposer les fichiers **tels quels** sans renommer (ex. `style.css`, pas `Style.css`).

4. **Chemins absolus = hébergement à la racine.** Si une page est servie dans un sous-répertoire (ex. `irisolaris-store.com/clim/`) au lieu d'un sous-domaine racine, le CSS/JS ne se chargera pas. ? privilégier le modèle sous-domaine, ou nous prévenir pour adapter les chemins.

5. **Statistiques de visite (optionnel, déjà intégré).** Les pages envoient des stats anonymes de fréquentation vers un Google Apps Script (`script.google.com`). Cela fonctionne sans action de votre part. Si une CSP stricte est en place, autoriser `script.google.com` et `script.googleusercontent.com` (sinon seules les stats de visite sont perdues, le reste fonctionne).

6. **Cookies / RGPD.** Un bandeau de consentement est intégré aux pages (gestion locale, pas de serveur requis).

7. **Pas de page 404 dédiée.** Sites mono-page : une URL inconnue renverra le 404 par défaut du serveur. Optionnel : rediriger les 404 vers `index.html`.

---

## 7. Checklist de validation (par sous-domaine)

- [ ] `https://<sous-domaine>/` affiche la page avec styles et images
- [ ] Cadenas HTTPS valide (pas d'avertissement « mixed content »)
- [ ] Le formulaire de devis s'affiche dans le cadre blanc (chargement HubSpot OK)
- [ ] Le bouton « Estimer mon projet » fait défiler jusqu'au formulaire
- [ ] Polices d'écriture correctes (titres en Korolev Condensed)
- [ ] `http://<sous-domaine>/` redirige bien vers `https://`
- [ ] Test mobile : mise en page responsive OK

---

## 8. Contacts / questions

Pour toute adaptation (hébergement en sous-répertoire plutôt qu'en sous-domaine, changement de noms de fichiers, CSP spécifique), nous contacter avant mise en ligne — l'ajustement est rapide côté code.
