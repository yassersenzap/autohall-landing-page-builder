# 06 — Spécification export ZIP MVP v1
## Plateforme interne de génération de landing pages — Auto Hall

**Version :** 1.0  
**Statut :** Document de conception avant code  
**Projet :** Builder interne de landing pages Auto Hall  
**Stack cible :** React, NestJS, PostgreSQL, Docker, Export ZIP compatible cPanel

---

# 1. Objectif du document

Ce document définit la spécification technique de l’export ZIP généré par le builder.

Il décrit précisément :

```text
Le rôle de l’export.
La structure du ZIP.
Les fichiers obligatoires.
Le contenu attendu de chaque fichier.
Les règles de sécurité.
Les règles de compatibilité avec cPanel.
Le fonctionnement du formulaire de leads.
Les validations avant génération.
Les tests à réaliser avant livraison.
```

Règle critique :

```text
Un export ZIP doit être directement déployable sur cPanel sans modification manuelle du code.
```

Si l’export nécessite qu’un développeur corrige le HTML, adapte le CSS ou modifie le JavaScript à chaque campagne, le builder ne remplit pas son objectif.

---

# 2. Contexte technique

Le builder est une application privée hébergée sur un serveur local Auto Hall avec Docker :

```text
Frontend builder : React
Backend builder : NestJS
Base builder : PostgreSQL
Déploiement builder : serveur local Auto Hall + Docker
```

Les landing pages générées par le builder seront exportées sous forme de ZIP puis déployées manuellement sur cPanel, généralement sur des sous-domaines séparés.

Exemples :

```text
https://offresav.myautohall.ma
https://offre-ford.autohall.ma
https://campagne-chery.autohall.ma
```

Le ZIP ne doit pas dépendre de l’application React du builder. Il doit produire une landing page autonome, légère et compatible avec l’hébergement cPanel.

---

# 3. Principe d’architecture retenu

Le builder manipule une structure JSON contrôlée appelée `layout_json`.

Le backend NestJS transforme cette structure en fichiers statiques :

```text
layout_json
→ index.html
→ css/styles.css
→ js/config.js
→ js/lead-form.js
→ assets/
→ ZIP final
```

Principe non négociable :

```text
Le ZIP exporté ne contient pas le builder.
Le ZIP exporté ne contient pas React.
Le ZIP exporté ne contient pas de secret.
Le ZIP exporté ne contient pas de connexion directe à une base de données.
```

---

# 4. Rôle de l’export ZIP

L’export ZIP doit permettre à l’équipe Auto Hall de :

```text
Télécharger une landing page finalisée.
Déployer la landing page sur cPanel.
Servir la page depuis un sous-domaine public.
Collecter les leads via un formulaire.
Envoyer les leads vers une API publique contrôlée.
```

L’export n’a pas pour rôle de gérer :

```text
L’authentification des utilisateurs du builder.
La base PostgreSQL du builder.
La synchronisation métier avancée.
La consultation des leads.
La modification de la page après déploiement.
```

Ces responsabilités restent côté backend builder et dashboard.

---

# 5. Structure obligatoire du ZIP

Chaque ZIP généré doit respecter cette structure minimale :

```text
landing-page-export.zip
│
├── index.html
│
├── css/
│   └── styles.css
│
├── js/
│   ├── config.js
│   └── lead-form.js
│
├── assets/
│   ├── images/
│   ├── videos/
│   ├── fonts/
│   └── documents/
│
└── README_DEPLOYMENT.txt
```

Version MVP minimale obligatoire :

```text
index.html
css/styles.css
js/config.js
js/lead-form.js
assets/images/
README_DEPLOYMENT.txt
```

Les autres dossiers peuvent être générés seulement s’ils sont nécessaires.

---

# 6. Fichiers obligatoires

## 6.1 `index.html`

Rôle :

```text
Contenir la structure HTML de la landing page.
Charger le CSS.
Charger la configuration publique.
Charger le script de soumission du formulaire.
Afficher les blocs générés depuis layout_json.
```

Interdictions :

```text
Pas de script inline dangereux.
Pas de connexion SQL.
Pas de token privé.
Pas de logique métier complexe.
Pas de dépendance au backend privé du builder.
```

---

## 6.2 `css/styles.css`

Rôle :

```text
Contenir les styles générés pour la landing page.
Gérer le responsive desktop/tablet/mobile.
Gérer les blocs : hero, text, image, video, form, cards, etc.
```

Règles :

```text
CSS unique.
CSS lisible.
CSS compatible navigateurs modernes.
Pas de dépendance à Tailwind en production exportée.
Pas de CSS externe obligatoire.
```

Le builder peut utiliser Tailwind ou d’autres bibliothèques côté React, mais l’export doit produire un CSS autonome.

---

## 6.3 `js/config.js`

Rôle :

```text
Contenir les paramètres publics nécessaires au fonctionnement de la page.
```

Exemple :

```javascript
window.LANDING_CONFIG = {
  campaignId: "uuid-campaign",
  landingPageId: "uuid-landing-page",
  leadEndpoint: "https://api-builder.autohall.ma/public/leads",
  sourceUrl: "https://offre-ford.autohall.ma",
  requestType: "OFFER_REQUEST",
  brand: "Ford",
  model: "Ranger"
};
```

Règle critique :

```text
config.js peut contenir des identifiants publics.
config.js ne doit jamais contenir de secret.
```

Autorisé :

```text
campaignId
landingPageId
leadEndpoint public
sourceUrl
requestType
brand
model
```

Interdit :

```text
Mot de passe
Token privé
Clé API secrète
Chaîne de connexion SQL
Nom d’utilisateur base de données
IP interne sensible
```

---

## 6.4 `js/lead-form.js`

Rôle :

```text
Gérer la soumission du formulaire.
Lire les champs saisis.
Lire window.LANDING_CONFIG.
Envoyer les données vers /public/leads.
Afficher un message de succès ou d’erreur.
Empêcher les doubles soumissions.
```

Il ne doit pas :

```text
Faire de validation métier finale.
Accéder directement à la base de données.
Contenir des secrets.
Contenir du code spécifique à une campagne non généré proprement.
```

La validation finale reste côté backend NestJS.

---

## 6.5 `assets/`

Rôle :

```text
Stocker les images, vidéos, polices ou documents nécessaires à la landing page.
```

Structure recommandée :

```text
assets/
├── images/
├── videos/
├── fonts/
└── documents/
```

Règles :

```text
Les assets doivent être référencés par chemins relatifs.
Les noms doivent être normalisés.
Les fichiers dangereux doivent être refusés.
Les images doivent être optimisées autant que possible.
```

---

## 6.6 `README_DEPLOYMENT.txt`

Rôle :

```text
Donner à l’utilisateur SI/Digital les instructions de déploiement cPanel.
```

Contenu minimal :

```text
Nom de la landing page.
Date d’export.
Campagne liée.
Sous-domaine cible.
Fichiers à déposer sur cPanel.
Rappel de ne pas modifier config.js sans validation.
Rappel de tester le formulaire après déploiement.
```

---

# 7. Convention de nommage du ZIP

Format recommandé :

```text
{slug-landing-page}_{date-export}.zip
```

Exemple :

```text
promo-ford-ranger_2026-05-18.zip
```

Règles :

```text
Le nom du fichier doit être en minuscules.
Les espaces doivent être remplacés par des tirets.
Les caractères spéciaux doivent être supprimés.
La date doit permettre d’identifier la version.
```

---

# 8. Convention de nommage des fichiers assets

Les assets ne doivent pas garder des noms dangereux ou instables.

Exemple mauvais :

```text
Image Finale client!!! (copie).jpg
```

Exemple correct :

```text
asset_9f3a2c_ford-ranger.webp
```

Format recommandé :

```text
asset_{shortUuid}_{slug}.{extension}
```

Règles :

```text
Pas d’espace.
Pas d’accent.
Pas de caractères spéciaux.
Pas de nom trop long.
Pas de fichier exécutable.
```

---

# 9. Extensions autorisées

## 9.1 Images

```text
.jpg
.jpeg
.png
.webp
.svg contrôlé
```

## 9.2 Vidéos

```text
.mp4
.webm
```

## 9.3 Polices

```text
.woff
.woff2
```

## 9.4 Documents

```text
.pdf
```

## 9.5 Extensions interdites

```text
.php
.exe
.sh
.bat
.cmd
.sql
.env
.js uploadé par utilisateur
.html uploadé par utilisateur
```

Règle :

```text
Aucun fichier exécutable fourni par un utilisateur ne doit être inclus dans l’export.
```

---

# 10. Génération de `index.html`

Le fichier `index.html` doit contenir :

```text
Doctype HTML5.
Balises meta essentielles.
Titre SEO.
Description SEO.
Lien CSS.
Contenu généré depuis les blocs.
Chargement de config.js.
Chargement de lead-form.js.
```

Structure minimale :

```html
<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Offre Auto Hall</title>
  <meta name="description" content="Découvrez les offres Auto Hall du moment.">
  <link rel="stylesheet" href="css/styles.css">
</head>
<body>
  <main>
    <!-- Blocs générés ici -->
  </main>

  <script src="js/config.js"></script>
  <script src="js/lead-form.js"></script>
</body>
</html>
```

Règles :

```text
Le HTML doit être proprement indenté.
Les textes doivent être échappés.
Les URLs doivent être validées.
Les champs formulaire doivent avoir des labels.
```

---

# 11. Génération du CSS

Le CSS exporté doit être autonome.

Il doit gérer :

```text
Layout global.
Typographie.
Couleurs du thème.
Responsive.
Blocs.
Formulaires.
Boutons.
Messages de succès/erreur.
```

Structure recommandée :

```text
1. Variables CSS
2. Reset minimal
3. Layout global
4. Typographie
5. Blocs communs
6. Blocs spécifiques
7. Formulaire
8. Responsive
```

Exemple :

```css
:root {
  --primary-color: #003B73;
  --secondary-color: #F5F7FA;
  --text-color: #111827;
  --background-color: #FFFFFF;
  --font-family: Arial, sans-serif;
}

body {
  margin: 0;
  font-family: var(--font-family);
  color: var(--text-color);
  background: var(--background-color);
}
```

Règle :

```text
Le CSS ne doit pas dépendre du CSS du site officiel Auto Hall.
```

La landing page en sous-domaine doit être autonome.

---

# 12. Génération du JavaScript formulaire

Le fichier `lead-form.js` doit être minimal.

Responsabilités :

```text
Sélectionner le formulaire.
Bloquer la double soumission.
Lire les données.
Construire le payload.
Envoyer une requête POST.
Afficher le résultat.
```

Pseudo-code :

```text
Au chargement de la page :
  trouver le formulaire lead
  écouter submit
  empêcher comportement par défaut
  désactiver le bouton
  lire les champs
  fusionner avec LANDING_CONFIG
  envoyer vers leadEndpoint
  afficher succès si 201
  afficher erreur si échec
  réactiver le bouton
```

Règles :

```text
Ne jamais faire confiance seulement à la validation JS.
Ne jamais exposer d’erreur technique brute à l’utilisateur.
Ne jamais envoyer un payload illimité.
```

---

# 13. Contrat du payload envoyé vers `/public/leads`

Le formulaire exporté doit envoyer ce format :

```json
{
  "campaignId": "uuid-campaign",
  "landingPageId": "uuid-landing-page",
  "fullName": "Client Exemple",
  "phone": "0600000000",
  "email": "client@example.com",
  "city": "Casablanca",
  "brand": "Ford",
  "model": "Ranger",
  "requestType": "OFFER_REQUEST",
  "message": "Je souhaite être contacté.",
  "sourceUrl": "https://offre-ford.autohall.ma",
  "metadata": {
    "utmSource": "facebook",
    "utmCampaign": "promo-mai-2026",
    "utmMedium": "cpc"
  }
}
```

Champs minimaux obligatoires :

```text
campaignId
landingPageId
fullName
phone
requestType
sourceUrl
```

---

# 14. Gestion des UTM

Le script exporté doit pouvoir récupérer les paramètres UTM présents dans l’URL.

Exemples :

```text
utm_source
utm_medium
utm_campaign
utm_content
utm_term
```

Ces valeurs doivent être envoyées dans `metadata`.

Objectif :

```text
Permettre au marketing d’identifier l’origine des leads.
```

Règle :

```text
Les UTM doivent être nettoyés avant envoi.
Le backend doit également les valider.
```

---

# 15. Compatibilité cPanel

Le ZIP doit être compatible avec un hébergement cPanel standard.

Le déploiement attendu :

```text
1. Créer ou sélectionner le sous-domaine.
2. Ouvrir le File Manager cPanel.
3. Aller dans le dossier racine du sous-domaine.
4. Uploader le ZIP.
5. Extraire le ZIP.
6. Vérifier que index.html est à la racine.
7. Tester l’ouverture de la page.
8. Tester le formulaire.
```

Règle :

```text
index.html doit être directement accessible à la racine du dossier public du sous-domaine.
```

Exemple correct :

```text
public_html/offre-ford/index.html
```

Exemple mauvais :

```text
public_html/offre-ford/promo-ford-ranger/index.html
```

Sauf si l’équipe SI/Digital choisit volontairement un sous-dossier.

---

# 16. Sous-domaine séparé du site officiel

Le choix recommandé est de déployer les landing pages sur des sous-domaines séparés.

Avantages :

```text
Isolation du site officiel Auto Hall.
Réduction du risque de casser une page existante.
Déploiement plus simple sur cPanel.
Indépendance technique du PHP du site officiel.
Meilleure gestion par campagne.
Suppression ou remplacement facile d’une campagne.
```

Point important :

```text
Le fait que le site officiel soit en PHP n’empêche pas d’héberger une landing page HTML statique sur cPanel.
```

cPanel peut servir des fichiers PHP, HTML, CSS, JS et assets dans des dossiers différents. Le problème n’est pas le langage, mais l’organisation du déploiement, les routes, les droits, la sécurité et la maintenance.

---

# 17. Relation avec le site officiel Auto Hall

Les landing pages en sous-domaines peuvent être reliées au site officiel par :

```text
Un lien direct.
Une carte campagne.
Un bouton promotionnel.
Une bannière.
Une redirection marketing.
Une publicité externe.
Un QR code.
```

Le site officiel peut pointer vers la landing page sans que la landing page soit intégrée techniquement au code PHP du site officiel.

Principe :

```text
Le site officiel reste stable.
La landing page vit séparément.
Les leads sont centralisés côté API.
```

---

# 18. Validation avant génération ZIP

Le backend doit refuser l’export si une condition critique n’est pas respectée.

Checklist obligatoire :

```text
La landing page existe.
La campagne associée existe.
Le layout_json est valide.
La page contient au moins un bloc.
Les blocs ont des IDs uniques.
Les types de blocs sont autorisés.
Les propriétés des blocs sont valides.
Les assets référencés existent.
Les URLs sont valides.
Le formulaire est valide si activé.
Le leadEndpoint public est configuré.
Aucun secret n’est présent dans la configuration.
Aucune extension interdite n’est incluse.
```

Si une validation échoue :

```text
L’export doit être bloqué.
Une erreur claire doit être retournée au builder.
Aucun ZIP partiel ne doit être proposé à l’utilisateur.
```

---

# 19. Données à stocker après export

Chaque export doit être historisé dans la base PostgreSQL du builder.

Informations recommandées :

```text
export_id
landing_page_id
zip_filename
zip_path
checksum
status
created_by
created_at
public_base_url
error_message si échec
```

Objectif :

```text
Tracer quelle version a été générée.
Permettre le téléchargement ultérieur.
Identifier les erreurs d’export.
```

---

# 20. Checksum

Chaque ZIP généré doit avoir un checksum.

Exemple :

```text
SHA-256
```

Utilité :

```text
Vérifier l’intégrité du fichier.
Comparer deux exports.
Tracer une version livrée.
```

Ce n’est pas indispensable pour une démo scolaire, mais c’est une bonne pratique professionnelle.

---

# 21. Versioning des exports

Chaque export doit être considéré comme une version figée.

Règle :

```text
Modifier une landing page dans le builder ne modifie pas automatiquement un ZIP déjà généré.
```

Workflow correct :

```text
Modifier landing page dans builder.
Sauvegarder.
Générer un nouvel export.
Déployer le nouveau ZIP sur cPanel.
```

Cela évite les incohérences entre ce qui est visible dans le builder et ce qui est réellement déployé.

---

# 22. Sécurité de l’export

## 22.1 Interdictions absolues

Le ZIP ne doit jamais contenir :

```text
.env
Mots de passe
Tokens privés
Clés API secrètes
Connexion SQL
Fichier PHP généré avec accès base
Script exécutable non contrôlé
Backup de base de données
Fichiers internes du builder
node_modules
package.json du builder
Source React du builder
```

## 22.2 Protection contre XSS

Le backend doit échapper les contenus texte avant génération HTML.

Champs concernés :

```text
Titres
Sous-titres
Paragraphes
Labels
Messages
Questions FAQ
Réponses FAQ
Captions
```

## 22.3 URLs

Les URLs doivent être validées.

Autorisé :

```text
https://...
#lead-form
assets/images/...
assets/videos/...
```

Interdit :

```text
javascript:
data:text/html
file://
vbscript:
```

---

# 23. Performance minimale

Une landing page marketing doit être rapide.

Règles :

```text
Ne pas exporter React.
Ne pas exporter de bundle lourd inutile.
Optimiser les images.
Limiter le JavaScript.
Utiliser CSS unique.
Utiliser lazy-loading pour les images non critiques.
Prévoir width et height quand possible.
```

Objectif MVP :

```text
La page doit s’ouvrir rapidement sur mobile.
Le formulaire doit être utilisable sans latence visible.
```

---

# 24. SEO minimal

Le builder doit permettre de générer :

```text
title
meta description
lang
Open Graph title
Open Graph description
Open Graph image si disponible
```

Exemple :

```html
<title>Promo Ford Auto Hall</title>
<meta name="description" content="Découvrez les offres Ford disponibles chez Auto Hall.">
<meta property="og:title" content="Promo Ford Auto Hall">
<meta property="og:description" content="Offres limitées Auto Hall.">
<meta property="og:image" content="assets/images/hero.webp">
```

Ce niveau est suffisant pour un MVP.

---

# 25. Accessibilité minimale

Le fichier exporté doit respecter des règles simples :

```text
Images avec alt.
Inputs avec labels.
Boutons avec texte lisible.
Contraste raisonnable.
Formulaire utilisable au clavier.
Messages d’erreur visibles.
Structure HTML sémantique.
```

Ce n’est pas optionnel. Une page marketing inaccessible réduit la qualité réelle de la campagne.

---

# 26. Responsive

Le CSS généré doit supporter au minimum :

```text
Desktop
Tablet
Mobile
```

Breakpoints recommandés :

```text
mobile : jusqu’à 767px
tablet : 768px à 1023px
desktop : 1024px et plus
```

Règle :

```text
Le rendu mobile doit être validé avant export final.
```

La majorité des campagnes publicitaires génèrent du trafic mobile. Une landing page non responsive est un échec métier, même si elle fonctionne techniquement.

---

# 27. Messages utilisateur du formulaire

Le formulaire doit prévoir :

```text
Message de succès.
Message d’erreur validation.
Message d’erreur serveur.
Message d’envoi en cours.
```

Exemples :

```text
Envoi en cours...
Votre demande a bien été envoyée.
Veuillez vérifier les champs obligatoires.
Une erreur est survenue. Veuillez réessayer.
```

Règle :

```text
Ne jamais afficher une erreur technique brute au visiteur.
```

---

# 28. Gestion du mode dégradé

Si l’API publique est indisponible :

```text
Le formulaire doit afficher un message d’erreur propre.
Le bouton doit redevenir utilisable.
Le visiteur ne doit pas voir une erreur JavaScript brute.
```

Le backend peut ensuite gérer des mécanismes plus avancés, mais côté ZIP le minimum est une expérience propre.

---

# 29. README de déploiement

Exemple de contenu généré :

```text
Landing Page Export — Auto Hall

Nom de la campagne : Promo Ford Mai 2026
Landing page : Landing Ford Ranger
Date d’export : 2026-05-18
Sous-domaine cible : https://offre-ford.autohall.ma

Instructions :
1. Ouvrir cPanel.
2. Accéder au File Manager.
3. Ouvrir le dossier racine du sous-domaine.
4. Uploader ce ZIP.
5. Extraire le contenu.
6. Vérifier que index.html est à la racine.
7. Ouvrir le sous-domaine dans le navigateur.
8. Tester le formulaire avec un lead de test.
9. Vérifier la réception du lead dans le dashboard.

Attention :
- Ne pas modifier js/config.js sans validation SI/Digital.
- Ne pas ajouter de fichier PHP ou script non validé.
- Ne pas supprimer assets/ si des images sont utilisées.
```

---

# 30. Workflow complet d’export

```text
1. Utilisateur crée ou modifie la landing page dans le builder.
2. Frontend sauvegarde layout_json via API privée.
3. Backend valide layout_json.
4. Utilisateur clique sur Export.
5. Backend relit la landing page et ses assets.
6. Backend valide les règles d’export.
7. Backend génère index.html.
8. Backend génère css/styles.css.
9. Backend génère js/config.js.
10. Backend génère js/lead-form.js.
11. Backend copie les assets nécessaires.
12. Backend génère README_DEPLOYMENT.txt.
13. Backend compresse le dossier en ZIP.
14. Backend calcule le checksum.
15. Backend historise l’export.
16. Utilisateur télécharge le ZIP.
17. SI/Digital déploie le ZIP sur cPanel.
18. Test de la page et du formulaire.
```

---

# 31. Contrôle qualité avant livraison du ZIP

Avant de proposer le téléchargement, le système doit vérifier :

```text
index.html existe.
css/styles.css existe.
js/config.js existe.
js/lead-form.js existe.
assets référencés existent.
Aucune extension interdite n’est présente.
Le ZIP n’est pas vide.
Le checksum est calculé.
Le formulaire pointe vers /public/leads.
```

---

# 32. Tests d’acceptation

## 32.1 Export simple

```text
Créer une landing page avec Hero + Form.
Exporter en ZIP.
Extraire le ZIP localement.
Ouvrir index.html.
Vérifier le rendu visuel.
```

Résultat attendu :

```text
La page s’affiche correctement.
Le CSS est chargé.
Aucune erreur console critique.
```

## 32.2 Export avec assets

```text
Ajouter une image.
Exporter.
Extraire le ZIP.
Vérifier que l’image existe dans assets/images.
Vérifier que index.html référence le bon chemin.
```

Résultat attendu :

```text
L’image s’affiche correctement.
Aucun lien cassé.
```

## 32.3 Export avec formulaire

```text
Créer un formulaire.
Configurer requestType.
Exporter.
Déployer ou tester localement avec API accessible.
Soumettre un lead.
```

Résultat attendu :

```text
Requête POST envoyée vers /public/leads.
Message de succès affiché.
Lead créé côté backend.
```

## 32.4 Export invalide

```text
Supprimer un asset utilisé.
Lancer l’export.
```

Résultat attendu :

```text
Export refusé.
Erreur claire affichée.
Aucun ZIP invalide proposé.
```

## 32.5 Compatibilité cPanel

```text
Uploader le ZIP sur cPanel.
Extraire à la racine du sous-domaine.
Ouvrir le sous-domaine.
Tester la page.
Tester le formulaire.
```

Résultat attendu :

```text
La page fonctionne sur cPanel.
Les assets sont chargés.
Les leads sont envoyés vers l’API.
```

---

# 33. Risques à éviter

| Risque | Conséquence |
|---|---|
| Exporter le bundle React du builder | Page lourde et dépendance inutile |
| Inclure des secrets dans config.js | Fuite critique |
| Laisser du HTML libre non nettoyé | XSS |
| Ne pas vérifier les assets | Images cassées |
| Utiliser des chemins absolus locaux | Page cassée sur cPanel |
| Dépendre du site officiel PHP | Couplage inutile |
| Ne pas historiser les exports | Impossible de tracer les versions |
| Modifier un ZIP déjà généré | Incohérence de version |
| Absence de README | Déploiement manuel risqué |
| Absence de test formulaire | Campagne sans collecte réelle |

---

# 34. Décision d’architecture

La stratégie retenue est :

```text
Export ZIP statique autonome.
Déploiement cPanel sur sous-domaine séparé.
Formulaire connecté à une API publique sécurisée.
Aucune connexion directe à la base Auto Hall depuis la landing page.
Historisation de chaque export dans le builder.
```

Cette stratégie est la plus adaptée au contexte Auto Hall parce qu’elle respecte :

```text
L’existant cPanel.
La séparation entre site officiel et campagnes.
La sécurité des données.
L’autonomie marketing.
La maintenabilité SI/Digital.
La possibilité de simulation avant intégration réelle.
```

---

# 35. Conclusion

L’export ZIP est un composant critique du projet.

Il ne doit pas être traité comme une simple fonctionnalité de téléchargement. Il représente le pont entre le builder privé et l’environnement public cPanel.

La règle finale est simple :

```text
Le builder produit.
Le ZIP transporte.
cPanel héberge.
L’API publique collecte.
Le backend sécurise.
La base stocke.
Le dashboard consulte.
```

Un export propre garantit que chaque landing page peut être déployée rapidement, sans dépendre du site officiel, sans exposer de secrets, et sans casser le workflow de collecte des leads.
