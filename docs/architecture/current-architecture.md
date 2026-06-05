# Architecture actuelle

Ce document resume l'etat technique courant du projet Auto Hall Landing Studio.

## Vue generale

Auto Hall Landing Studio est une application interne composee de deux parties :

- un frontend React/Vite pour les utilisateurs internes ;
- un backend NestJS connecte a PostgreSQL via Prisma.

Le frontend permet de gerer les campagnes, les landing pages, les versions, le Studio, les previews et les leads. Le backend concentre l'authentification, les regles metier, la persistance, les assets, le rendu preview/export et la collecte des leads.

## Studio officiel

Le Studio officiel est accessible via :

```text
/page-versions/:pageVersionId/studio
```

La preview Studio est accessible via :

```text
/page-versions/:pageVersionId/studio/preview
```

Le document Studio est stocke separement des anciens blocs V1. Le rendu preview/export passe par le renderer Studio V2 cote backend afin de produire du HTML/CSS statique coherent.

## Builder V1

Le Builder V1 n'est plus l'editeur officiel. Il est conserve comme archive historique sur la branche :

```text
archive/builder-v1-block-editor
```

Cette branche sert de reference PFE et ne doit pas etre mergee dans `main`.

Certains modules `page_blocks`, preview/export V1 et helpers de compatibilite restent presents dans le code pour ne pas casser les donnees ou liens historiques. Les routes frontend legacy redirigent vers le Studio officiel.

## Preview et export

La preview Studio et l'export ZIP sont separes de l'application React :

- la preview affiche le rendu public genere par le backend ;
- l'export ZIP contient des fichiers statiques deployables ;
- l'export ne contient ni bundle React, ni secret, ni acces direct a la base.

Les formulaires exportes envoient les leads vers l'API publique du backend.

## Donnees et services principaux

- PostgreSQL stocke utilisateurs, campagnes, landings, versions, documents Studio, assets et leads.
- Prisma gere l'acces aux donnees et les migrations.
- NestJS expose les modules auth, campaigns, landing-pages, page-versions, studio-v2, studio-v2-renderer, page-assets, leads et health.
- React/Vite expose l'application privee, protegee par authentification.

## Regles de maintenance

- Toute evolution UI du Studio doit rester sur le Studio officiel.
- Les anciennes routes doivent rester des redirections tant qu'elles peuvent etre partagees dans des rapports ou anciens liens.
- Les artefacts locaux (`dist`, `output`, caches, exports ZIP, logs, `.env`) ne doivent pas etre versionnes.
- Les modules backend lies aux assets, preview/export et leads ne doivent pas etre supprimes sans tests ciblant explicitement ces flux.
