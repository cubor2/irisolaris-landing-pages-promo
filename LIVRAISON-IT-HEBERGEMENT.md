# Hébergement des landing pages promo — Guide IT

**Objet :** héberger 3 landing pages statiques et les publier sur des sous-domaines de `irisolaris-store.com`.

---

## 1. Ce que vous recevez

Trois dossiers indépendants, 100 % statiques (HTML / CSS / JS). Aucune base de données, aucun backend à installer.

| Dossier | Landing |
|---------|---------|
| `pac-climatisation` | PAC Climatisation |
| `pac-piscine` | PAC Piscine |
| `centrale-pv` | Centrale PV |

Chaque dossier est autonome et contient : le fichier `index.html`, et les sous-dossiers `css`, `js`, `assets` (images, polices, icônes).

> Les autres fichiers éventuels du dépôt (`dist`, `build-site.js`, `_redirects`, fichiers `.md`) sont internes et peuvent être ignorés.

---

## 2. Principe d'hébergement

**1 sous-domaine = 1 dossier, servi à la racine du sous-domaine.**

| Sous-domaine (à créer, nom indicatif) | Dossier à déposer |
|---------------------------------------|-------------------|
| `clim.irisolaris-store.com` | `pac-climatisation` |
| `piscine.irisolaris-store.com` | `pac-piscine` |
| `pv.irisolaris-store.com` | `centrale-pv` |

Le **contenu** d'un dossier (et non le dossier lui-même) doit être déposé à la racine web du sous-domaine. Exemple : `https://clim.irisolaris-store.com/css/style.css` doit répondre.

---

## 3. Mise en place (par sous-domaine)

1. Créer le sous-domaine (DNS) pointant vers votre serveur web.
2. Déposer le contenu du dossier à la racine du sous-domaine.
3. Installer un certificat HTTPS (Let's Encrypt ou wildcard `*.irisolaris-store.com`).
4. Rediriger `http://` vers `https://`.
5. Vérifier (voir checklist).

Document par défaut : `index.html`.

---

## 4. Points d'attention (importants)

1. **HTTPS obligatoire.** Sans HTTPS, le formulaire et les polices sont bloqués par le navigateur.

2. **Hébergement à la racine du sous-domaine.** Les pages utilisent des chemins absolus (`/css/`, `/js/`, `/assets/`). Servies dans un sous-répertoire (ex. `…/clim/`), le style ne se chargerait pas. Si vous ne pouvez pas utiliser de sous-domaine, prévenez-nous : l'ajustement est rapide.

3. **Formulaire HubSpot.** Chaque page charge un script externe HubSpot. Si vous appliquez une politique de sécurité (CSP), autorisez les domaines HubSpot : `*.hsforms.net`, `*.hsforms.com`, `*.hubspot.com`. Les demandes de devis partent directement vers HubSpot, sans traitement de votre côté.

4. **Noms de fichiers (serveur Linux).** Sensibles à la casse : déposer les fichiers sans les renommer.

5. **Types de fichiers `.webp` et `.otf`.** Vérifier qu'ils sont servis avec le bon type MIME (`image/webp` et `font/otf`) si ce n'est pas le cas par défaut.

---

## 5. Checklist de validation (par sous-domaine)

- [ ] La page s'affiche avec styles, images et polices
- [ ] HTTPS valide, sans avertissement
- [ ] Le formulaire de devis s'affiche
- [ ] `http://` redirige vers `https://`
- [ ] Affichage mobile correct

---

Pour toute adaptation (hébergement en sous-répertoire, CSP spécifique), nous contacter avant la mise en ligne.
