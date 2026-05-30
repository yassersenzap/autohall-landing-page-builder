# Checklist — validation avant démo MVP

Cocher chaque point le jour de la démo. Durée indicative : 45–60 min pour un parcours complet.

---

## Environnement

- [ ] `.env` configuré (`DATABASE_URL`, `JWT_SECRET`, `VITE_API_BASE_URL`)
- [ ] `docker compose up -d` — PostgreSQL healthy
- [ ] `cd backend && npx prisma migrate deploy && npm run db:seed`
- [ ] Backend : `npm run start:dev` — `GET /health` et `/health/db` OK
- [ ] Frontend : `npm run dev` — http://localhost:5173 accessible
- [ ] `cd backend && npm run build` OK
- [ ] `cd frontend && npm run build` OK

---

## Connexion

- [ ] Login `admin@autohall.local` / `Autohall_Dev_2026!`
- [ ] Tableau de bord : section **Indicateurs leads** visible
- [ ] Liens : Campagnes · Consulter les leads

---

## Builder (parcours court)

- [ ] Campagne démo visible
- [ ] Landing `demo-offre-printemps` → versions
- [ ] Bloc **lead_form** présent (sinon : en créer un via l’UI blocs)
- [ ] Preview : formulaire affiché
- [ ] **Publier** la version (obligatoire avant export)
- [ ] **Exporter ZIP** téléchargé

---

## Lead public

- [ ] ZIP extrait, servi en HTTP (`npx serve . -p 8080`)
- [ ] Soumission formulaire → succès
- [ ] Nouveau lead visible dans `/leads`

---

## CRM interne

- [ ] Détail lead : infos + suivi interne
- [ ] Changement statut → `CONTACTED`
- [ ] Assignation + priorité + date de relance
- [ ] Historique d’activité mis à jour
- [ ] KPI dashboard : totaux cohérents

---

## Limites à mentionner en démo (si question)

- [ ] Pas de drag-and-drop / éditeur visuel
- [ ] Pas de sync Auto Hall réelle
- [ ] Export ZIP : URL API via `PUBLIC_API_BASE_URL` en prod
- [ ] Seed : version non publiée par défaut — publication manuelle requise

---

## Rollback si incident

- [ ] Redémarrer backend + vérifier `/health/db`
- [ ] Re-seed uniquement si base locale jetable : `npm run db:seed`
- [ ] Vider token frontend : déconnexion ou localStorage
