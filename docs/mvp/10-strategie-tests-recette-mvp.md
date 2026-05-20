# 10 — Stratégie de tests et recette MVP v1
## Plateforme interne de génération de landing pages — Auto Hall

**Version :** 1.0  
**Statut :** Document de préparation avant code  
**Projet :** Builder interne de landing pages Auto Hall  
**Stack cible :** React, NestJS, PostgreSQL, Docker, Export ZIP compatible cPanel

---

# 1. Objectif du document

Ce document définit la stratégie de tests du MVP.

Il sert à garantir que le projet ne se limite pas à une interface fonctionnelle en apparence, mais qu’il valide réellement le workflow métier complet :

```text
Créer une campagne
→ construire une landing page
→ exporter un ZIP compatible cPanel
→ déployer la page
→ collecter un lead
→ stocker le lead
→ synchroniser vers une table simulée
→ consulter le lead dans un dashboard
```

Règle critique :

```text
Une fonctionnalité non testée est une fonctionnalité non maîtrisée.
```

---

# 2. Principe général

La stratégie de tests est organisée en plusieurs niveaux :

```text
Tests unitaires
Tests d’intégration backend
Tests frontend
Tests d’export ZIP
Tests API publique leads
Tests sécurité
Tests end-to-end manuels
Recette fonctionnelle MVP
```

Chaque niveau vérifie une partie différente du système.

Le MVP ne doit pas être validé uniquement parce que l’interface semble fonctionner. Il doit être validé par des scénarios concrets de bout en bout.

---

# 3. Périmètre testé

Le périmètre de test couvre :

```text
Authentification
Gestion des rôles
Campagnes
Landing pages
Modèle de blocs
Assets
Export ZIP
Déploiement cPanel ou simulation équivalente
Soumission formulaire
API publique /public/leads
Stockage lead_events
Synchronisation simulated_testdrive / simulated_contacts
Dashboard leads
Sécurité minimale
```

Hors périmètre MVP :

```text
A/B testing
Analytics avancé
Publication automatique vers cPanel
SSO entreprise
Synchronisation réelle vers les tables Auto Hall
Éditeur visuel avancé type Framer complet
```

---

# 4. Environnements de test

Trois environnements sont recommandés.

## 4.1 Local

Utilisé pour le développement quotidien.

```text
Frontend React local
Backend NestJS local
PostgreSQL Docker
Assets locaux
Exports locaux
```

## 4.2 Staging / recette

Utilisé pour simuler une livraison propre.

```text
Docker Compose complet
Base PostgreSQL séparée
Compte admin de test
Données de test
Export ZIP réel
Test de formulaire réel
```

## 4.3 cPanel test ou équivalent

Utilisé pour valider la compatibilité réelle de l’export.

```text
Upload ZIP
Extraction
Ouverture index.html
Chargement CSS/JS/assets
Soumission formulaire
```

Si cPanel réel n’est pas disponible au début, une simulation locale peut être utilisée, mais elle ne remplace pas la validation finale sur cPanel.

---

# 5. Données de test

Le projet doit prévoir des données de test réalistes.

## 5.1 Utilisateurs

```text
admin@autohall.test        → ADMIN
si.digital@autohall.test   → SI_DIGITAL
marketing@autohall.test    → MARKETER
viewer@autohall.test       → VIEWER
```

## 5.2 Campagnes

```text
Campagne Ford Ranger
Campagne Chery Tiggo
Campagne Service Après-Vente
```

## 5.3 Landing pages

```text
Landing avec Hero + Formulaire
Landing avec Image + Features + Formulaire
Landing avec FAQ + CTA + Formulaire
```

## 5.4 Leads

```text
Lead testdrive
Lead contact
Lead callback
Lead offre commerciale
Lead invalide
Lead doublon
Lead avec UTM
```

---

# 6. Tests unitaires backend

Les tests unitaires backend vérifient les services critiques sans dépendre de l’interface.

## 6.1 AuthService

Cas à tester :

```text
Connexion avec identifiants valides.
Refus avec mot de passe invalide.
Refus utilisateur inexistant.
Hash du mot de passe.
Génération token.
```

Résultat attendu :

```text
Aucun mot de passe brut n’est retourné.
Les erreurs sont contrôlées.
```

## 6.2 CampaignService

Cas à tester :

```text
Créer une campagne valide.
Refuser une campagne sans nom.
Modifier une campagne.
Changer le statut.
Lister les campagnes.
```

## 6.3 LandingPageService

Cas à tester :

```text
Créer une landing page.
Sauvegarder layout_json valide.
Refuser layout_json invalide.
Lister les landing pages par campagne.
Modifier les métadonnées SEO.
```

## 6.4 BlockValidationService

Cas à tester :

```text
Bloc hero valide.
Bloc form valide.
Bloc image avec asset valide.
Bloc inconnu refusé.
Propriété interdite refusée.
ID de bloc manquant refusé.
ID de bloc dupliqué refusé.
```

## 6.5 ExportService

Cas à tester :

```text
Générer HTML depuis layout_json.
Générer CSS.
Générer config.js.
Générer lead-form.js.
Copier les assets utilisés.
Générer README_DEPLOYMENT.txt.
Créer un ZIP.
Calculer checksum.
```

## 6.6 LeadService

Cas à tester :

```text
Accepter payload valide.
Refuser payload sans téléphone.
Refuser requestType inconnu.
Nettoyer les champs texte.
Stocker dans lead_events.
Retourner une réponse propre.
```

## 6.7 SyncService

Cas à tester :

```text
Router TEST_DRIVE vers simulated_testdrive.
Router CONTACT vers simulated_contacts.
Gérer erreur de synchronisation.
Marquer statut SYNCED.
Marquer statut FAILED.
Relancer synchronisation.
```

---

# 7. Tests d’intégration backend

Les tests d’intégration valident le fonctionnement avec la base PostgreSQL.

## 7.1 Authentification

Scénario :

```text
POST /auth/login avec utilisateur valide.
Utiliser le token sur une route protégée.
```

Résultat attendu :

```text
Connexion réussie.
Route protégée accessible avec token.
Route refusée sans token.
```

## 7.2 RBAC

Scénario :

```text
Utilisateur MARKETER tente d’accéder à /api/users.
```

Résultat attendu :

```text
403 Forbidden.
```

## 7.3 Campagne + landing page

Scénario :

```text
Créer une campagne.
Créer une landing page liée.
Sauvegarder layout_json.
Relire la landing page.
```

Résultat attendu :

```text
Les relations sont correctes.
Le JSON est conservé.
```

## 7.4 Export ZIP

Scénario :

```text
Créer une landing page complète.
Lancer l’export.
Télécharger le ZIP.
```

Résultat attendu :

```text
Export historisé.
ZIP présent.
Checksum calculé.
Fichiers obligatoires présents.
```

## 7.5 Lead public

Scénario :

```text
POST /public/leads avec payload valide.
```

Résultat attendu :

```text
lead_events créé.
Synchronisation simulée réussie.
Statut SYNCED.
```

---

# 8. Tests frontend

Les tests frontend valident l’expérience utilisateur et la stabilité de l’interface.

## 8.1 Authentification

Cas à tester :

```text
Afficher page login.
Soumettre identifiants valides.
Rediriger vers dashboard.
Afficher erreur si identifiants invalides.
Déconnecter utilisateur.
```

## 8.2 Routes privées

Cas à tester :

```text
Accès dashboard sans session.
Accès builder sans session.
Accès leads sans session.
```

Résultat attendu :

```text
Redirection vers login.
```

## 8.3 Campagnes

Cas à tester :

```text
Lister les campagnes.
Créer une campagne.
Modifier une campagne.
Changer statut.
```

## 8.4 Builder

Cas à tester :

```text
Ajouter un bloc hero.
Ajouter un bloc text.
Ajouter un bloc image.
Ajouter un bloc form.
Sélectionner un bloc.
Modifier les propriétés.
Réordonner les blocs.
Supprimer un bloc.
Sauvegarder.
Recharger la page.
```

Résultat attendu :

```text
La structure sauvegardée est conservée après rechargement.
```

## 8.5 Preview responsive

Cas à tester :

```text
Basculer desktop.
Basculer tablet.
Basculer mobile.
```

Résultat attendu :

```text
Le canvas s’adapte visuellement.
Aucun bloc ne casse le rendu.
```

## 8.6 Dashboard leads

Cas à tester :

```text
Afficher la liste des leads.
Filtrer par campagne.
Filtrer par type.
Ouvrir détail.
Voir statut sync.
```

---

# 9. Tests d’export ZIP

L’export ZIP est un composant critique. Il doit être testé séparément.

## 9.1 Structure du ZIP

Vérifier que le ZIP contient :

```text
index.html
css/styles.css
js/config.js
js/lead-form.js
assets/
README_DEPLOYMENT.txt
```

## 9.2 Absence de fichiers interdits

Vérifier que le ZIP ne contient jamais :

```text
.env
node_modules
package.json
src/
Dockerfile
docker-compose.yml
fichiers backend
fichiers React builder
tokens
mots de passe
.php non validé
.sql
```

## 9.3 Chemins relatifs

Vérifier que :

```text
Les images utilisent des chemins relatifs.
Le CSS est chargé depuis css/styles.css.
Le JS est chargé depuis js/.
Les assets existent réellement.
```

## 9.4 Test local

Scénario :

```text
Extraire le ZIP.
Ouvrir index.html dans un navigateur.
```

Résultat attendu :

```text
Page visible.
CSS chargé.
Images chargées.
Aucune erreur console critique.
```

## 9.5 Test formulaire

Scénario :

```text
Soumettre un formulaire depuis la page exportée.
```

Résultat attendu :

```text
POST vers /public/leads.
Message de succès affiché.
Lead visible dans la base.
```

---

# 10. Tests de compatibilité cPanel

La compatibilité cPanel doit être prouvée, pas supposée.

## 10.1 Déploiement

Scénario :

```text
Uploader le ZIP sur cPanel.
Extraire dans le dossier racine du sous-domaine.
Ouvrir le sous-domaine.
```

Résultat attendu :

```text
index.html est servi.
CSS chargé.
JS chargé.
Assets chargés.
```

## 10.2 Formulaire depuis cPanel

Scénario :

```text
Soumettre un lead depuis le sous-domaine cPanel.
```

Résultat attendu :

```text
L’API publique reçoit le lead.
CORS accepte le domaine autorisé.
Lead stocké dans lead_events.
```

## 10.3 Erreurs à détecter

```text
Chemin asset cassé.
index.html pas à la racine.
CORS refusé.
Mauvaise URL API.
JS non chargé.
Formulaire silencieusement cassé.
```

---

# 11. Tests de l’API publique `/public/leads`

## 11.1 Payload valide

Entrée :

```text
Lead complet avec campaignId, landingPageId, fullName, phone, requestType, sourceUrl.
```

Résultat attendu :

```text
201 Created.
lead_events créé.
Statut SYNCED ou RECEIVED selon stratégie.
```

## 11.2 Payload invalide

Cas :

```text
Téléphone absent.
requestType inconnu.
campaignId inexistant.
sourceUrl invalide.
Payload trop volumineux.
```

Résultat attendu :

```text
400 Bad Request.
Aucune synchronisation destination.
Erreur propre.
```

## 11.3 Rate limiting

Scénario :

```text
Envoyer plusieurs requêtes rapidement depuis la même IP.
```

Résultat attendu :

```text
429 Too Many Requests.
```

## 11.4 CORS

Scénario :

```text
Envoyer depuis domaine autorisé.
Envoyer depuis domaine non autorisé.
```

Résultat attendu :

```text
Domaine autorisé accepté.
Domaine non autorisé refusé en production.
```

## 11.5 Erreur de synchronisation

Scénario :

```text
Forcer l’échec de l’adaptateur simulated_testdrive.
```

Résultat attendu :

```text
Lead conservé dans lead_events.
Statut FAILED.
sync_error renseigné.
Aucune perte de données.
```

---

# 12. Tests sécurité

## 12.1 Auth obligatoire

Test :

```text
Appeler /api/campaigns sans token.
```

Résultat attendu :

```text
401 Unauthorized.
```

## 12.2 Rôle insuffisant

Test :

```text
VIEWER tente de créer une campagne.
```

Résultat attendu :

```text
403 Forbidden.
```

## 12.3 XSS dans bloc

Test :

```text
Saisir <script>alert(1)</script> dans un titre.
Exporter la landing page.
Ouvrir index.html.
```

Résultat attendu :

```text
Le script ne s’exécute pas.
Le contenu est refusé ou échappé.
```

## 12.4 URL dangereuse

Test :

```text
Créer un bouton avec href javascript:alert(1).
```

Résultat attendu :

```text
URL refusée.
```

## 12.5 Upload dangereux

Test :

```text
Uploader shell.php.
Uploader fichier .env.
Uploader fichier .js.
```

Résultat attendu :

```text
Upload refusé.
```

## 12.6 Secret dans export

Test :

```text
Scanner le ZIP généré.
```

Résultat attendu :

```text
Aucun secret.
Aucun .env.
Aucune connexion SQL.
Aucun token privé.
```

---

# 13. Tests de performance minimale

Le MVP ne nécessite pas une optimisation extrême, mais il doit rester professionnel.

## 13.1 Landing page exportée

Critères :

```text
Pas de bundle React.
CSS unique.
JS minimal.
Images optimisées.
Chargement mobile acceptable.
```

## 13.2 Backend

Critères :

```text
Création campagne rapide.
Sauvegarde layout_json rapide.
Export ZIP sans blocage anormal.
Soumission lead rapide.
```

## 13.3 Dashboard

Critères :

```text
Pagination des leads.
Filtres backend.
Pas de chargement de milliers de leads en une seule fois.
```

---

# 14. Tests de robustesse

Cas à tester :

```text
Base indisponible.
Asset manquant.
Landing page sans blocs.
Formulaire mal configuré.
Erreur pendant création ZIP.
Erreur pendant synchronisation lead.
Token expiré.
Utilisateur supprimé.
```

Résultat attendu :

```text
Erreur propre.
Aucune corruption.
Aucun ZIP invalide proposé.
Aucun lead perdu si déjà reçu.
```

---

# 15. Recette fonctionnelle MVP

La recette fonctionnelle est la validation finale par scénario métier.

## 15.1 Scénario principal

```text
1. L’admin se connecte.
2. Il crée un utilisateur marketeur.
3. Le marketeur se connecte.
4. Il crée une campagne Ford.
5. Il crée une landing page pour une offre.
6. Il ajoute un hero, un bloc texte, une image, des avantages et un formulaire.
7. Il sauvegarde.
8. Il prévisualise en mobile.
9. Il génère un export ZIP.
10. SI/Digital télécharge le ZIP.
11. Le ZIP est déployé sur cPanel ou environnement test.
12. Un visiteur remplit le formulaire.
13. Le backend reçoit le lead.
14. Le lead est stocké dans lead_events.
15. Le lead est synchronisé vers simulated_contacts ou simulated_testdrive.
16. Le marketeur consulte le lead dans le dashboard.
```

Critère de réussite :

```text
Le workflow complet fonctionne sans modifier manuellement le code généré.
```

---

# 16. Recette par rôle

## 16.1 ADMIN

Doit pouvoir :

```text
Créer utilisateur.
Modifier rôle.
Voir campagnes.
Voir exports.
Voir leads.
```

## 16.2 SI_DIGITAL

Doit pouvoir :

```text
Créer campagne.
Gérer landing pages.
Exporter ZIP.
Voir erreurs techniques.
Relancer sync.
```

## 16.3 MARKETER

Doit pouvoir :

```text
Créer campagne.
Créer landing page.
Modifier contenu.
Exporter ZIP si autorisé.
Voir leads liés aux campagnes.
```

## 16.4 VIEWER

Doit pouvoir :

```text
Consulter uniquement.
Ne pas créer.
Ne pas modifier.
Ne pas supprimer.
```

---

# 17. Critères d’acceptation globaux

Le MVP est accepté seulement si :

```text
L’authentification fonctionne.
Les rôles sont respectés.
Une campagne peut être créée.
Une landing page peut être construite.
Le layout_json est sauvegardé.
L’export ZIP est généré.
Le ZIP fonctionne hors builder.
La page est compatible cPanel.
Le formulaire envoie vers /public/leads.
Le lead est stocké dans lead_events.
Le lead est synchronisé vers une table simulée.
Le dashboard affiche le lead.
Aucun secret n’est exposé.
Les erreurs sont gérées proprement.
```

---

# 18. Checklist avant démonstration

Avant toute démonstration à l’encadrante ou à l’équipe SI/Digital :

```text
Docker démarre sans erreur.
Backend opérationnel.
Frontend opérationnel.
Base migrée.
Seed utilisateur prêt.
Campagne de test prête.
Landing page de test prête.
Export ZIP testé localement.
Export ZIP inspecté.
Formulaire testé.
Dashboard leads testé.
Logs vérifiés.
Aucun .env commité.
Aucune erreur console critique.
Aucune route privée accessible sans token.
```

---

# 19. Checklist avant intégration réelle Auto Hall

Avant de remplacer les tables simulées par les tables réelles :

```text
Schéma réel testdrive obtenu.
Schéma réel contacts obtenu.
Champs obligatoires identifiés.
Contraintes SQL identifiées.
Mapping validé par SI/Digital.
Environnement de test validé.
Backup prévu.
Adaptateur réel développé séparément.
Tests sur données non critiques.
Comparaison avec anciennes landing pages.
Validation écrite ou orale SI/Digital.
```

Règle :

```text
Pas d’écriture directe dans les vraies tables sans validation.
```

---

# 20. Rapport de recette

À la fin du MVP, produire un petit rapport de recette :

```text
Fonctionnalité testée.
Scénario utilisé.
Résultat obtenu.
Statut : OK / KO.
Capture éventuelle.
Commentaire.
```

Exemple :

| Fonctionnalité | Scénario | Résultat | Statut |
|---|---|---|---|
| Export ZIP | Génération landing Ford | ZIP complet généré | OK |
| Formulaire | Soumission lead test | Lead reçu dans lead_events | OK |
| Dashboard | Filtre par campagne | Leads filtrés correctement | OK |
| Sécurité | Accès sans token | 401 retourné | OK |

---

# 21. Outils recommandés

## 21.1 Backend

```text
Jest
Supertest
class-validator
Prisma ou TypeORM selon choix final
```

## 21.2 Frontend

```text
Vitest
React Testing Library
Playwright optionnel pour E2E
```

## 21.3 Qualité

```text
ESLint
Prettier
Docker Compose
Postman ou Insomnia
```

## 21.4 Tests manuels

```text
Navigateur Chrome
DevTools console/network
cPanel File Manager
phpMyAdmin seulement pour observation si nécessaire
```

---

# 22. Priorité des tests

Tous les tests n’ont pas la même priorité.

Priorité 1 :

```text
Auth/RBAC
Export ZIP
/public/leads
lead_events
sync simulée
dashboard leads
sécurité export
```

Priorité 2 :

```text
Builder UI
assets
prévisualisation responsive
filtres dashboard
logs
```

Priorité 3 :

```text
Animations
design avancé
optimisation fine
analytics
```

---

# 23. Erreurs à éviter

| Erreur | Risque |
|---|---|
| Tester uniquement le frontend | Backend fragile |
| Tester uniquement en local | Export cassé sur cPanel |
| Ne pas tester le formulaire exporté | Leads perdus |
| Ne pas tester les rôles | Accès non maîtrisé |
| Ne pas tester XSS | Faille critique |
| Ne pas tester les assets | Images cassées |
| Ne pas tester les erreurs sync | Perte silencieuse |
| Ne pas inspecter le ZIP | Secrets exposés |
| Ne pas faire de recette métier | Démo non convaincante |

---

# 24. Décision finale

La stratégie de tests retenue est :

```text
Tester le cœur métier avant le décoratif.
Tester le workflow complet avant les optimisations.
Tester l’export ZIP comme un produit livré.
Tester /public/leads comme une surface exposée.
Tester la synchronisation pour éviter la perte de leads.
Tester les rôles pour protéger le builder.
```

Cette stratégie est adaptée au projet car elle valide les vrais risques :

```text
Compatibilité cPanel.
Sécurité.
Collecte de leads.
Traçabilité.
Autonomie marketing.
Intégration future avec Auto Hall.
```

---

# 25. Conclusion

Le MVP ne doit pas être jugé uniquement sur son apparence.

Il doit être jugé sur sa capacité à exécuter un workflow réel :

```text
Builder privé
→ export ZIP propre
→ landing page publique
→ formulaire fonctionnel
→ API sécurisée
→ lead stocké
→ dashboard consultable
```

Si ce flux est testé et validé, le projet est solide.

Si ce flux n’est pas testé, le projet reste une démo fragile, même si l’interface est belle.
