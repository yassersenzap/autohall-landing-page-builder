import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import LeadActivityHistory from '../components/leads/LeadActivityHistory';
import LeadFollowUpForm from '../components/leads/LeadFollowUpForm';
import LeadStatusForm from '../components/leads/LeadStatusForm';
import { ApiError, logoutClient, meRequest } from '../lib/api';
import {
  canViewLeads,
  formatLeadDate,
  getAssignableUsers,
  getLeadEvent,
  getLeadEventHistory,
  PRIORITY_LABELS,
  updateLeadFollowUp,
  updateLeadEventStatus,
  type AssignableUser,
  type LeadEventDetail,
  type LeadStatusHistoryItem,
} from '../lib/leads';

function formatDate(value: string): string {
  return new Date(value).toLocaleString('fr-FR');
}

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [role, setRole] = useState<string | null>(null);
  const [lead, setLead] = useState<LeadEventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [followUpSubmitting, setFollowUpSubmitting] = useState(false);
  const [assignableUsers, setAssignableUsers] = useState<AssignableUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [followUpSuccess, setFollowUpSuccess] = useState<string | null>(null);
  const [history, setHistory] = useState<LeadStatusHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const loadHistory = useCallback(async (leadId: string) => {
    setHistoryError(null);
    setHistoryLoading(true);

    try {
      const response = await getLeadEventHistory(leadId);
      setHistory(response.data);
    } catch (err) {
      setHistory([]);
      setHistoryError(
        err instanceof ApiError
          ? err.message
          : 'Impossible de charger l’historique.',
      );
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const loadLead = useCallback(async () => {
    if (!id) {
      return;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const profile = await meRequest();
      setRole(profile.data.role);

      if (!canViewLeads(profile.data.role)) {
        return;
      }

      const [response, usersResponse] = await Promise.all([
        getLeadEvent(id),
        getAssignableUsers(),
      ]);
      setLead(response.data);
      setAssignableUsers(usersResponse.data);
      await loadHistory(id);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        logoutClient();
        navigate('/login', { replace: true });
        return;
      }
      if (err instanceof ApiError && err.status === 403) {
        setError('Vous n’avez pas accès à ce lead.');
        return;
      }
      if (err instanceof ApiError && err.status === 404) {
        setLead(null);
        setError('Lead introuvable.');
        return;
      }
      setError(
        err instanceof ApiError
          ? err.message
          : 'Impossible de charger le détail du lead.',
      );
    } finally {
      setLoading(false);
    }
  }, [id, loadHistory, navigate]);

  useEffect(() => {
    void loadLead();
  }, [loadLead]);

  async function handleStatusUpdate(status: string, internalComment: string) {
    if (!id) {
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await updateLeadEventStatus(id, {
        status,
        internalComment: internalComment.trim() || undefined,
      });
      setLead(response.data);
      setSuccess('Lead mis à jour avec succès.');
      await loadHistory(id);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        logoutClient();
        navigate('/login', { replace: true });
        return;
      }
      setError(
        err instanceof ApiError
          ? err.message
          : 'Impossible de mettre à jour le lead.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleFollowUpUpdate(payload: {
    assignedToUserId: string | null;
    priority: string;
    nextFollowUpAt: string | null;
  }) {
    if (!id) {
      return;
    }

    setFollowUpSubmitting(true);
    setError(null);
    setFollowUpSuccess(null);

    try {
      const response = await updateLeadFollowUp(id, payload);
      setLead(response.data);
      setFollowUpSuccess('Suivi interne enregistré.');
      await loadHistory(id);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        logoutClient();
        navigate('/login', { replace: true });
        return;
      }
      setError(
        err instanceof ApiError
          ? err.message
          : 'Impossible de mettre à jour le suivi interne.',
      );
    } finally {
      setFollowUpSubmitting(false);
    }
  }

  if (!id) {
    return (
      <main className="dashboard">
        <p className="dashboard__error">Identifiant de lead manquant.</p>
        <Link to="/leads">Retour à la liste</Link>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="dashboard">
        <p>Chargement du lead…</p>
      </main>
    );
  }

  if (role && !canViewLeads(role)) {
    return (
      <main className="dashboard">
        <p className="dashboard__error">
          Accès refusé : votre rôle ne permet pas de gérer les leads.
        </p>
        <Link to="/dashboard">Retour au tableau de bord</Link>
      </main>
    );
  }

  if (!lead) {
    return (
      <main className="dashboard">
        <header className="dashboard__header">
          <h1>Détail du lead</h1>
          <Link to="/leads" className="dashboard__link">
            Retour à la liste
          </Link>
        </header>
        {error ? <p className="dashboard__error">{error}</p> : null}
        {!error ? <p>Lead introuvable.</p> : null}
      </main>
    );
  }

  return (
    <main className="dashboard lead-detail-page">
      <header className="dashboard__header">
        <div>
          <h1>{lead.fullName}</h1>
          <p className="dashboard__subtitle">
            Lead reçu le {formatDate(lead.createdAt)}
          </p>
        </div>
        <Link to="/leads" className="dashboard__link">
          Retour à la liste
        </Link>
      </header>

      {error ? <p className="dashboard__error">{error}</p> : null}
      {success ? <p className="lead-detail__success">{success}</p> : null}
      {followUpSuccess ? (
        <p className="lead-detail__success">{followUpSuccess}</p>
      ) : null}

      <section className="dashboard__card">
        <h2>Informations</h2>
        <ul className="dashboard__meta lead-detail__meta">
          <li>
            <strong>Téléphone :</strong> {lead.phone}
          </li>
          <li>
            <strong>Email :</strong> {lead.email ?? '—'}
          </li>
          <li>
            <strong>Marque :</strong> {lead.brand ?? '—'}
          </li>
          <li>
            <strong>Modèle :</strong> {lead.model ?? '—'}
          </li>
          <li>
            <strong>Campagne :</strong> {lead.campaignName}
          </li>
          <li>
            <strong>Landing page :</strong> {lead.landingPageTitle} (
            /{lead.landingPageSlug})
          </li>
          <li>
            <strong>Source URL :</strong>{' '}
            <a href={lead.sourceUrl} target="_blank" rel="noreferrer">
              {lead.sourceUrl}
            </a>
          </li>
          <li>
            <strong>Priorité :</strong>{' '}
            <span
              className={`campaigns-list__status priority-${lead.priority.toLowerCase()}`}
            >
              {PRIORITY_LABELS[lead.priority] ?? lead.priority}
            </span>
          </li>
          <li>
            <strong>Assigné à :</strong>{' '}
            {lead.assignedTo?.fullName ?? 'Non assigné'}
          </li>
          <li>
            <strong>Prochaine relance :</strong>{' '}
            <span
              className={
                lead.isFollowUpOverdue ? 'leads-table__overdue' : undefined
              }
            >
              {formatLeadDate(lead.nextFollowUpAt)}
              {lead.isFollowUpOverdue ? ' (en retard)' : ''}
            </span>
          </li>
          <li>
            <strong>Statut :</strong>{' '}
            <span
              className={`campaigns-list__status status-${lead.status.toLowerCase()}`}
            >
              {lead.status}
            </span>
          </li>
          <li>
            <strong>Type de demande :</strong> {lead.requestType}
          </li>
          <li>
            <strong>Dernière mise à jour :</strong>{' '}
            {formatDate(lead.updatedAt)}
          </li>
        </ul>
      </section>

      <section className="dashboard__card">
        <h2>Message client</h2>
        <p className="lead-detail__text">
          {lead.message?.trim() ? lead.message : 'Aucun message laissé.'}
        </p>
      </section>

      <section className="dashboard__card">
        <h2>Commentaire interne</h2>
        <p className="lead-detail__text">
          {lead.internalComment?.trim()
            ? lead.internalComment
            : 'Aucun commentaire interne.'}
        </p>
      </section>

      <section className="dashboard__card">
        <h2>Suivi interne</h2>
        <LeadFollowUpForm
          key={`${lead.id}-${lead.priority}-${lead.assignedToUserId ?? ''}-${lead.nextFollowUpAt ?? ''}`}
          lead={lead}
          assignableUsers={assignableUsers}
          submitting={followUpSubmitting}
          onSubmit={handleFollowUpUpdate}
        />
      </section>

      <section className="dashboard__card">
        <h2>Statut et commentaire</h2>
        <LeadStatusForm
          key={`${lead.id}-${lead.status}-${lead.internalComment ?? ''}`}
          currentStatus={lead.status}
          currentInternalComment={lead.internalComment}
          submitting={submitting}
          onSubmit={handleStatusUpdate}
        />
      </section>

      <section className="dashboard__card">
        <h2>Historique d&apos;activité</h2>
        <LeadActivityHistory
          items={history}
          loading={historyLoading}
          error={historyError}
        />
      </section>
    </main>
  );
}
