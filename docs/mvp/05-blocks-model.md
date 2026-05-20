# 05 — Modèle des blocs du builder MVP v1
## Plateforme interne de génération de landing pages — Auto Hall

**Version :** 1.0  
**Statut :** Document de conception avant code  
**Projet :** Builder interne de landing pages Auto Hall  
**Stack cible :** React, NestJS, PostgreSQL, Docker, Export ZIP compatible cPanel

---

# 1. Objectif du document

Ce document définit le modèle des blocs utilisés dans le builder visuel de landing pages.

Il sert de référence pour :

```text
La structure JSON des pages.
Le rendu React dans le builder.
Le rendu HTML/CSS/JS dans l’export ZIP.
Le panneau d’inspection.
La validation backend.
La compatibilité cPanel.
La maintenance future des templates.
```

Règle critique :

```text
Le builder ne doit pas sauvegarder du HTML libre généré au hasard.
Il doit sauvegarder une structure JSON contrôlée composée de blocs validés.
```

Un builder qui stocke directement du HTML libre devient rapidement dangereux : bugs d’export, injection de scripts, incohérence responsive, dette technique et impossibilité de maintenir les campagnes.

---

# 2. Principe général

Une landing page est composée d’une liste ordonnée de blocs.

Chaque bloc représente une section ou un composant visuel :

```text
Hero
Text
Image
Video
Button
Form
Features
Cards
Stats
FAQ
Spacer
```

Chaque bloc est stocké dans `layout_json.blocks`.

Structure minimale :

```json
{
  "id": "block_hero_001",
  "type": "hero",
  "order": 1,
  "props": {}
}
```

---

# 3. Structure globale d’une landing page

Le format de base du `layout_json` est le suivant :

```json
{
  "version": "1.0",
  "page": {
    "title": "Offre Auto Hall",
    "language": "fr",
    "theme": {
      "primaryColor": "#003B73",
      "secondaryColor": "#F5F7FA",
      "fontFamily": "Inter"
    },
    "seo": {
      "metaTitle": "Offre Auto Hall",
      "metaDescription": "Découvrez les offres Auto Hall du moment."
    }
  },
  "blocks": [],
  "form": {
    "enabled": true,
    "requestType": "TEST_DRIVE",
    "fields": ["full_name", "phone", "email", "city"]
  }
}
```

---

# 4. Règles communes à tous les blocs

Chaque bloc doit obligatoirement respecter cette structure :

| Champ | Type | Obligatoire | Description |
|---|---|---:|---|
| id | string | Oui | Identifiant unique du bloc |
| type | string | Oui | Type du bloc |
| order | number | Oui | Ordre d’affichage |
| props | object | Oui | Propriétés du bloc |
| visibility | object | Non | Règles d’affichage responsive |
| style | object | Non | Style contrôlé du bloc |

Exemple :

```json
{
  "id": "block_text_001",
  "type": "text",
  "order": 2,
  "props": {
    "content": "Découvrez notre nouvelle offre."
  },
  "visibility": {
    "desktop": true,
    "tablet": true,
    "mobile": true
  },
  "style": {
    "backgroundColor": "#FFFFFF",
    "textColor": "#111827",
    "paddingTop": 48,
    "paddingBottom": 48
  }
}
```

---

# 5. Règles d’identification

## 5.1 Format des IDs

Les IDs doivent être générés automatiquement par le système.

Format recommandé :

```text
block_{type}_{shortUuid}
```

Exemples :

```text
block_hero_9f3a2c
block_form_12ab88
block_image_77de21
```

Règles :

```text
Un ID ne doit jamais être saisi manuellement.
Un ID doit être unique dans une landing page.
Un ID ne doit pas changer lorsqu’on modifie un bloc.
```

---

# 6. Types de blocs MVP

Le MVP doit rester maîtrisé.

Les blocs autorisés en version 1 sont :

```text
hero
text
image
video
button
form
features
cards
stats
faq
spacer
```

Tout autre bloc est hors MVP.

---

# 7. Bloc Hero

## 7.1 Rôle

Le bloc `hero` est la section principale de la page.

Il sert à afficher :

```text
Un titre fort.
Un sous-titre.
Une image ou un fond.
Un bouton d’action.
```

## 7.2 Structure JSON

```json
{
  "id": "block_hero_001",
  "type": "hero",
  "order": 1,
  "props": {
    "title": "Promo exclusive Auto Hall",
    "subtitle": "Découvrez nos offres du mois.",
    "buttonText": "Je suis intéressé",
    "buttonTarget": "#lead-form",
    "backgroundType": "color",
    "backgroundColor": "#003B73",
    "backgroundImage": null,
    "alignment": "left"
  }
}
```

## 7.3 Propriétés autorisées

| Propriété | Type | Obligatoire | Valeurs |
|---|---|---:|---|
| title | string | Oui | Max 120 caractères |
| subtitle | string | Non | Max 250 caractères |
| buttonText | string | Non | Max 50 caractères |
| buttonTarget | string | Non | URL ou ancre |
| backgroundType | string | Oui | color, image |
| backgroundColor | string | Non | Hex color |
| backgroundImage | string | Non | Chemin asset |
| alignment | string | Oui | left, center, right |

## 7.4 Règles

```text
Le titre est obligatoire.
Le bouton est optionnel.
Si backgroundType = image, backgroundImage devient obligatoire.
Aucun HTML libre n’est autorisé dans title ou subtitle.
```

---

# 8. Bloc Text

## 8.1 Rôle

Le bloc `text` affiche un contenu éditorial simple.

Il sert pour :

```text
Description d’offre.
Texte commercial.
Conditions résumées.
Présentation courte.
```

## 8.2 Structure JSON

```json
{
  "id": "block_text_001",
  "type": "text",
  "order": 2,
  "props": {
    "heading": "Une offre pensée pour vous",
    "content": "Profitez des offres Auto Hall disponibles pendant une durée limitée.",
    "alignment": "center"
  }
}
```

## 8.3 Propriétés autorisées

| Propriété | Type | Obligatoire |
|---|---|---:|
| heading | string | Non |
| content | string | Oui |
| alignment | string | Oui |

Valeurs de `alignment` :

```text
left
center
right
```

## 8.4 Règles

```text
Le texte doit être nettoyé côté backend.
Pas de script.
Pas de balises HTML libres dans le MVP.
```

---

# 9. Bloc Image

## 9.1 Rôle

Le bloc `image` affiche une image liée à la campagne.

## 9.2 Structure JSON

```json
{
  "id": "block_image_001",
  "type": "image",
  "order": 3,
  "props": {
    "src": "assets/images/ford-ranger.webp",
    "alt": "Ford Ranger Auto Hall",
    "caption": "Offre limitée",
    "width": "full",
    "alignment": "center"
  }
}
```

## 9.3 Propriétés autorisées

| Propriété | Type | Obligatoire | Valeurs |
|---|---|---:|---|
| src | string | Oui | Chemin asset |
| alt | string | Oui | Texte alternatif |
| caption | string | Non | Texte |
| width | string | Oui | full, medium, small |
| alignment | string | Oui | left, center, right |

## 9.4 Règles

```text
Une image doit venir de la bibliothèque d’assets.
Le chemin doit être relatif dans l’export ZIP.
Le texte alt est obligatoire pour l’accessibilité.
```

---

# 10. Bloc Video

## 10.1 Rôle

Le bloc `video` permet d’intégrer une vidéo YouTube, Vimeo ou un fichier local exportable.

## 10.2 Structure JSON

```json
{
  "id": "block_video_001",
  "type": "video",
  "order": 4,
  "props": {
    "sourceType": "youtube",
    "url": "https://www.youtube.com/watch?v=xxxx",
    "localSrc": null,
    "title": "Vidéo de présentation",
    "autoplay": false,
    "muted": true,
    "loop": false
  }
}
```

## 10.3 Propriétés autorisées

| Propriété | Type | Obligatoire | Valeurs |
|---|---|---:|---|
| sourceType | string | Oui | youtube, vimeo, local |
| url | string | Non | URL vidéo |
| localSrc | string | Non | Chemin asset vidéo |
| title | string | Non | Titre |
| autoplay | boolean | Oui | true/false |
| muted | boolean | Oui | true/false |
| loop | boolean | Oui | true/false |

## 10.4 Règles

```text
Si sourceType = local, localSrc est obligatoire.
Si sourceType = youtube ou vimeo, url est obligatoire.
Les iframes doivent être générées par le renderer, pas saisies librement.
```

---

# 11. Bloc Button

## 11.1 Rôle

Le bloc `button` ajoute un appel à l’action indépendant.

## 11.2 Structure JSON

```json
{
  "id": "block_button_001",
  "type": "button",
  "order": 5,
  "props": {
    "text": "Demander un essai",
    "target": "#lead-form",
    "variant": "primary",
    "alignment": "center"
  }
}
```

## 11.3 Propriétés autorisées

| Propriété | Type | Obligatoire | Valeurs |
|---|---|---:|---|
| text | string | Oui | Max 50 caractères |
| target | string | Oui | URL ou ancre |
| variant | string | Oui | primary, secondary, outline |
| alignment | string | Oui | left, center, right |

## 11.4 Règles

```text
Le bouton ne doit pas exécuter de JavaScript libre.
La cible peut être une ancre interne ou une URL validée.
```

---

# 12. Bloc Form

## 12.1 Rôle

Le bloc `form` permet de collecter les leads.

C’est le bloc le plus sensible du builder.

## 12.2 Structure JSON

```json
{
  "id": "block_form_001",
  "type": "form",
  "order": 6,
  "props": {
    "formId": "lead-form",
    "title": "Contactez-nous",
    "subtitle": "Laissez vos informations, un conseiller vous rappellera.",
    "requestType": "TEST_DRIVE",
    "submitText": "Envoyer ma demande",
    "successMessage": "Votre demande a bien été envoyée.",
    "fields": [
      {
        "name": "full_name",
        "label": "Nom complet",
        "type": "text",
        "required": true
      },
      {
        "name": "phone",
        "label": "Téléphone",
        "type": "tel",
        "required": true
      },
      {
        "name": "email",
        "label": "Email",
        "type": "email",
        "required": false
      },
      {
        "name": "city",
        "label": "Ville",
        "type": "text",
        "required": false
      }
    ]
  }
}
```

## 12.3 Types de demande autorisés

```text
TEST_DRIVE
CONTACT
OFFER_REQUEST
SERVICE_REQUEST
CALLBACK
```

## 12.4 Champs formulaire autorisés

| Champ | Type | Obligatoire recommandé |
|---|---|---:|
| full_name | text | Oui |
| phone | tel | Oui |
| email | email | Non |
| city | text | Non |
| brand | text/select | Non |
| model | text/select | Non |
| message | textarea | Non |
| preferred_date | date | Non |

## 12.5 Règles non négociables

```text
Le formulaire doit envoyer les leads vers /public/leads.
Le formulaire ne doit jamais contenir de connexion SQL.
Le formulaire ne doit jamais contenir de token privé.
Le formulaire doit empêcher le double clic pendant l’envoi.
Le backend reste responsable de la validation finale.
```

---

# 13. Bloc Features

## 13.1 Rôle

Le bloc `features` présente des avantages ou arguments marketing.

## 13.2 Structure JSON

```json
{
  "id": "block_features_001",
  "type": "features",
  "order": 7,
  "props": {
    "heading": "Pourquoi choisir cette offre ?",
    "items": [
      {
        "title": "Financement avantageux",
        "description": "Des solutions adaptées à votre besoin.",
        "icon": "credit-card"
      },
      {
        "title": "Réseau national",
        "description": "Une présence dans plusieurs villes du Maroc.",
        "icon": "map-pin"
      }
    ],
    "columns": 3
  }
}
```

## 13.3 Règles

```text
Nombre maximum d’items MVP : 6.
columns doit être 2, 3 ou 4.
Les icônes doivent venir d’une liste contrôlée.
```

---

# 14. Bloc Cards

## 14.1 Rôle

Le bloc `cards` affiche plusieurs cartes : offres, modèles, services ou étapes.

## 14.2 Structure JSON

```json
{
  "id": "block_cards_001",
  "type": "cards",
  "order": 8,
  "props": {
    "heading": "Nos offres",
    "items": [
      {
        "title": "Ford Ranger",
        "description": "Offre spéciale du mois.",
        "image": "assets/images/ranger.webp",
        "buttonText": "Découvrir",
        "buttonTarget": "#lead-form"
      }
    ],
    "columns": 3
  }
}
```

## 14.3 Règles

```text
Nombre maximum d’items MVP : 6.
Chaque image doit provenir des assets.
Chaque bouton doit pointer vers une ancre ou une URL validée.
```

---

# 15. Bloc Stats

## 15.1 Rôle

Le bloc `stats` affiche des chiffres clés.

## 15.2 Structure JSON

```json
{
  "id": "block_stats_001",
  "type": "stats",
  "order": 9,
  "props": {
    "items": [
      {
        "value": "+100",
        "label": "ans d’expérience"
      },
      {
        "value": "50+",
        "label": "points de vente"
      }
    ],
    "columns": 3
  }
}
```

## 15.3 Règles

```text
Nombre maximum d’items MVP : 4.
Les valeurs doivent rester textuelles pour accepter +, %, DH.
```

---

# 16. Bloc FAQ

## 16.1 Rôle

Le bloc `faq` affiche des questions fréquentes.

## 16.2 Structure JSON

```json
{
  "id": "block_faq_001",
  "type": "faq",
  "order": 10,
  "props": {
    "heading": "Questions fréquentes",
    "items": [
      {
        "question": "Comment puis-je être contacté ?",
        "answer": "Après soumission du formulaire, un conseiller peut vous rappeler."
      }
    ]
  }
}
```

## 16.3 Règles

```text
Nombre maximum d’items MVP : 8.
Les réponses doivent être du texte simple.
Pas de HTML libre dans les réponses.
```

---

# 17. Bloc Spacer

## 17.1 Rôle

Le bloc `spacer` ajoute un espace vertical entre deux sections.

## 17.2 Structure JSON

```json
{
  "id": "block_spacer_001",
  "type": "spacer",
  "order": 11,
  "props": {
    "height": 48
  }
}
```

## 17.3 Règles

```text
height minimum : 16
height maximum : 160
```

---

# 18. Propriétés de style communes

Les propriétés de style doivent rester contrôlées.

Structure :

```json
{
  "style": {
    "backgroundColor": "#FFFFFF",
    "textColor": "#111827",
    "paddingTop": 48,
    "paddingBottom": 48,
    "borderRadius": 16
  }
}
```

Propriétés autorisées MVP :

| Propriété | Type | Limite |
|---|---|---|
| backgroundColor | string | Hex color |
| textColor | string | Hex color |
| paddingTop | number | 0 à 160 |
| paddingBottom | number | 0 à 160 |
| borderRadius | number | 0 à 40 |

Règle :

```text
Pas de CSS libre dans le JSON.
Pas de style injecté sous forme de string.
Pas de propriété dangereuse comme position fixed libre, z-index libre ou script.
```

---

# 19. Propriétés responsive

Chaque bloc peut définir sa visibilité :

```json
{
  "visibility": {
    "desktop": true,
    "tablet": true,
    "mobile": true
  }
}
```

Règles :

```text
Par défaut, un bloc est visible sur desktop, tablet et mobile.
Le renderer doit respecter ces règles.
La prévisualisation React doit permettre de voir desktop/tablet/mobile.
```

---

# 20. Modèle du panneau d’inspection

Chaque type de bloc doit posséder une configuration d’inspection.

Exemple pour `hero` :

```json
{
  "type": "hero",
  "label": "Hero",
  "fields": [
    {
      "name": "title",
      "label": "Titre",
      "input": "text",
      "required": true,
      "maxLength": 120
    },
    {
      "name": "subtitle",
      "label": "Sous-titre",
      "input": "textarea",
      "required": false,
      "maxLength": 250
    },
    {
      "name": "backgroundColor",
      "label": "Couleur de fond",
      "input": "color",
      "required": false
    }
  ]
}
```

Règle :

```text
Le panneau d’inspection ne doit pas être codé au hasard composant par composant.
Il doit être piloté par une configuration claire des champs éditables.
```

---

# 21. Validation backend du layout

Le backend doit valider `layout_json` avant sauvegarde.

Validation minimale :

```text
version obligatoire
page.title obligatoire
blocks obligatoire
blocks doit être un tableau
chaque bloc doit avoir id, type, order, props
type doit appartenir à la liste autorisée
order doit être numérique
id unique dans la page
props doit respecter le schéma du type de bloc
aucun script ne doit être accepté
aucun HTML libre non autorisé
```

Le frontend peut aider, mais il ne remplace jamais la validation backend.

---

# 22. Rendu dans le builder React

Le builder React doit suivre une logique claire :

```text
layout_json
→ BlockRenderer
→ composant React selon type
→ panneau d’inspection selon bloc sélectionné
→ modification des props
→ sauvegarde via API
```

Structure recommandée :

```text
src/
  builder/
    components/
      BuilderCanvas.jsx
      BlockRenderer.jsx
      InspectorPanel.jsx
      Toolbox.jsx
    blocks/
      HeroBlock.jsx
      TextBlock.jsx
      ImageBlock.jsx
      VideoBlock.jsx
      FormBlock.jsx
      FeaturesBlock.jsx
      CardsBlock.jsx
      StatsBlock.jsx
      FaqBlock.jsx
      SpacerBlock.jsx
    schemas/
      blockSchemas.js
    utils/
      createBlock.js
      validateBlock.js
```

Règle :

```text
Le composant BuilderCanvas ne doit pas contenir la logique complète de tous les blocs.
Sinon il deviendra ingérable.
```

---

# 23. Rendu dans l’export ZIP

L’export ZIP ne doit pas exporter l’application React.

Il doit générer des fichiers statiques :

```text
index.html
css/styles.css
js/config.js
js/lead-form.js
assets/
```

Le backend doit transformer :

```text
layout_json
→ HTML statique
→ CSS contrôlé
→ JS minimal pour formulaire
→ ZIP compatible cPanel
```

Règle :

```text
Le rendu dans le builder et le rendu dans l’export doivent utiliser le même modèle de blocs.
```

Sinon, la prévisualisation dans le builder ne correspondra pas au résultat déployé.

---

# 24. Mapping bloc → export HTML

| Bloc | HTML généré |
|---|---|
| hero | section.hero |
| text | section.text-section |
| image | section.image-section |
| video | section.video-section |
| button | section.cta-section |
| form | section.form-section + form |
| features | section.features-section |
| cards | section.cards-section |
| stats | section.stats-section |
| faq | section.faq-section |
| spacer | div.spacer |

---

# 25. Sécurité du contenu

## 25.1 Interdictions

Les blocs ne doivent jamais accepter :

```text
<script>
onclick
onerror
iframe libre
HTML non contrôlé
CSS libre
URL javascript:
form action externe non validée
token privé
connexion SQL
```

## 25.2 Nettoyage

Tout texte saisi dans le builder doit être nettoyé :

```text
title
subtitle
content
caption
label
message
question
answer
```

## 25.3 URLs

Les URLs doivent être validées.

Autorisé :

```text
https://...
http://... seulement en local
#lead-form
/assets/...
assets/...
```

Interdit :

```text
javascript:alert(1)
data:text/html
file://
```

---

# 26. Accessibilité minimale

Même pour un MVP, les règles suivantes sont nécessaires :

```text
Chaque image doit avoir un alt.
Chaque bouton doit avoir un texte clair.
Chaque input doit avoir un label.
Le formulaire doit afficher les erreurs.
Les contrastes doivent rester lisibles.
La navigation mobile doit être utilisable.
```

Ce n’est pas du luxe. Une landing page marketing inutilisable sur mobile ou inaccessible perd directement des leads.

---

# 27. Performance minimale

Les blocs doivent être pensés pour des pages rapides.

Règles :

```text
Images optimisées.
Utiliser WebP si possible.
Pas de JavaScript inutile dans l’export.
Pas de dépendances lourdes dans la landing page exportée.
CSS unique et minifiable.
Lazy loading possible pour images hors hero.
```

La landing page exportée ne doit pas dépendre de React au runtime.

---

# 28. Exemple complet de `layout_json` MVP

```json
{
  "version": "1.0",
  "page": {
    "title": "Promo Ford Mai 2026",
    "language": "fr",
    "theme": {
      "primaryColor": "#003B73",
      "secondaryColor": "#F5F7FA",
      "fontFamily": "Inter"
    },
    "seo": {
      "metaTitle": "Promo Ford Auto Hall",
      "metaDescription": "Découvrez les offres Ford disponibles chez Auto Hall."
    }
  },
  "blocks": [
    {
      "id": "block_hero_001",
      "type": "hero",
      "order": 1,
      "props": {
        "title": "Des offres exclusives Auto Hall",
        "subtitle": "Profitez des offres disponibles pendant une durée limitée.",
        "buttonText": "Je suis intéressé",
        "buttonTarget": "#lead-form",
        "backgroundType": "color",
        "backgroundColor": "#003B73",
        "backgroundImage": null,
        "alignment": "left"
      }
    },
    {
      "id": "block_features_001",
      "type": "features",
      "order": 2,
      "props": {
        "heading": "Pourquoi choisir cette offre ?",
        "items": [
          {
            "title": "Offre limitée",
            "description": "Conditions avantageuses pendant la campagne.",
            "icon": "tag"
          },
          {
            "title": "Accompagnement",
            "description": "Un conseiller peut vous rappeler rapidement.",
            "icon": "phone"
          }
        ],
        "columns": 2
      }
    },
    {
      "id": "block_form_001",
      "type": "form",
      "order": 3,
      "props": {
        "formId": "lead-form",
        "title": "Contactez-nous",
        "subtitle": "Laissez vos informations, un conseiller vous rappellera.",
        "requestType": "OFFER_REQUEST",
        "submitText": "Envoyer ma demande",
        "successMessage": "Votre demande a bien été envoyée.",
        "fields": [
          {
            "name": "full_name",
            "label": "Nom complet",
            "type": "text",
            "required": true
          },
          {
            "name": "phone",
            "label": "Téléphone",
            "type": "tel",
            "required": true
          },
          {
            "name": "email",
            "label": "Email",
            "type": "email",
            "required": false
          },
          {
            "name": "city",
            "label": "Ville",
            "type": "text",
            "required": false
          }
        ]
      }
    }
  ],
  "form": {
    "enabled": true,
    "requestType": "OFFER_REQUEST",
    "fields": ["full_name", "phone", "email", "city"]
  }
}
```

---

# 29. Critères d’acceptation

Le modèle des blocs est validé si :

```text
Tous les blocs MVP sont définis.
Chaque bloc possède un schéma clair.
Le JSON permet de reconstruire la page.
Le même JSON sert au builder React et à l’export statique.
Le formulaire est compatible avec /public/leads.
Aucun HTML libre dangereux n’est accepté.
Aucun secret n’est stocké dans les blocs.
Les assets sont référencés par chemins relatifs exportables.
Le responsive est prévu.
La validation backend est possible.
```

---

# 30. Risques à éviter

| Risque | Conséquence |
|---|---|
| Stocker du HTML libre | Faille XSS et export instable |
| Laisser chaque bloc avoir sa logique isolée | Builder difficile à maintenir |
| Ne pas valider le JSON côté backend | Pages cassées en production |
| Exporter React dans la landing page | Poids inutile et dépendance fragile |
| Ne pas contrôler les URLs | Injection ou redirection abusive |
| Ne pas imposer de modèle formulaire | Leads incohérents |
| Mélanger style libre et données | CSS ingérable |
| Ajouter trop de blocs dès le MVP | Retard et complexité inutile |

---

# 31. Conclusion

Le modèle de blocs retenu est volontairement strict.

Ce n’est pas une limitation faible. C’est une condition de qualité.

Le builder doit permettre aux utilisateurs Auto Hall de créer des landing pages rapidement, mais sans casser la structure technique, la sécurité ou l’export cPanel.

La règle d’architecture est claire :

```text
Le builder manipule un JSON contrôlé.
Le backend valide ce JSON.
L’export transforme ce JSON en HTML/CSS/JS statique.
Les leads passent uniquement par /public/leads.
```

Ce modèle est la base stable pour développer le builder sans dette technique majeure.
