import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import LeadActivityHistory from '../components/leads/LeadActivityHistory';
import LeadFollowUpForm from '../components/leads/LeadFollowUpForm';
import LeadStatusForm from '../components/leads/LeadStatusForm';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { PriorityBadge } from '../components/ui/PriorityBadge';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ApiError, logoutClient, meRequest } from '../lib/api';
import {
  canViewLeads,
  formatLeadDate,
  getAssignableUsers,
  getLeadEvent,
  getLeadEventHistory,
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
      <div className="studio-stack">
        <p className="ui-alert ui-alert--error">Identifiant de lead manquant.</p>
        <Link to="/leads" className="ui-link">
          Retour à la liste
        </Link>
      </div>
    );
  }

  if (loading) {
    return <p className="ui-page-header__subtitle">Chargement du lead…</p>;
  }

  if (role && !canViewLeads(role)) {
    return (
      <div className="studio-stack">
        <p className="ui-alert ui-alert--error">
          Accès refusé : votre rôle ne permet pas de gérer les leads.
        </p>
        <Link to="/dashboard" className="ui-link">
          Retour au tableau de bord
        </Link>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="studio-stack">
        <PageHeader title="Détail du lead" backTo="/leads" backLabel="Retour à la liste" />
        {error ? <p className="ui-alert ui-alert--error">{error}</p> : null}
        {!error ? <p className="ui-page-header__subtitle">Lead introuvable.</p> : null}
      </div>
    );
  }

  return (
    <div className="studio-stack lead-detail-page">
      <PageHeader
        title={lead.fullName}
        subtitle={`Lead reçu le ${formatDate(lead.createdAt)}`}
        backTo="/leads"
        backLabel="Retour à la liste"
        actions={
          <>
            <StatusBadge status={lead.status} />
            <PriorityBadge priority={lead.priority} />
          </>
        }
      />

      {error ? <p className="ui-alert ui-alert--error">{error}</p> : null}
      {success ? <p className="ui-alert ui-alert--success">{success}</p> : null}
      {followUpSuccess ? (
        <p className="ui-alert ui-alert--success">{followUpSuccess}</p>
      ) : null}

      <Card title="Informations">
        <dl className="lead-detail-meta">
          <div className="lead-detail-meta__item">
            <dt className="lead-detail-meta__label">Téléphone</dt>
            <dd className="lead-detail-meta__value">{lead.phone}</dd>
          </div>
          <div className="lead-detail-meta__item">
            <dt className="lead-detail-meta__label">Email</dt>
            <dd className="lead-detail-meta__value">{lead.email ?? '—'}</dd>
          </div>
          <div className="lead-detail-meta__item">
            <dt className="lead-detail-meta__label">Campagne</dt>
            <dd className="lead-detail-meta__value">{lead.campaignName}</dd>
          </div>
          <div className="lead-detail-meta__item">
            <dt className="lead-detail-meta__label">Landing page</dt>
            <dd className="lead-detail-meta__value">
              {lead.landingPageTitle} (/{lead.landingPageSlug})
            </dd>
          </div>
          <div className="lead-detail-meta__item">
            <dt className="lead-detail-meta__label">Marque / modèle</dt>
            <dd className="lead-detail-meta__value">
              {[lead.brand, lead.model].filter(Boolean).join(' · ') || '—'}
            </dd>
          </div>
          <div className="lead-detail-meta__item">
            <dt className="lead-detail-meta__label">Assigné à</dt>
            <dd className="lead-detail-meta__value">
              {lead.assignedTo?.fullName ?? 'Non assigné'}
            </dd>
          </div>
          <div className="lead-detail-meta__item">
            <dt className="lead-detail-meta__label">Prochaine relance</dt>
            <dd
              className={[
                'lead-detail-meta__value',
                lead.isFollowUpOverdue ? 'leads-table__overdue' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {formatLeadDate(lead.nextFollowUpAt)}
              {lead.isFollowUpOverdue ? ' · En retard' : ''}
            </dd>
          </div>
          <div className="lead-detail-meta__item">
            <dt className="lead-detail-meta__label">Type de demande</dt>
            <dd className="lead-detail-meta__value">{lead.requestType}</dd>
          </div>
          <div className="lead-detail-meta__item">
            <dt className="lead-detail-meta__label">Source</dt>
            <dd className="lead-detail-meta__value">
              <a href={lead.sourceUrl} target="_blank" rel="noreferrer" className="ui-link">
                {lead.sourceUrl}
              </a>
            </dd>
          </div>
          <div className="lead-detail-meta__item">
            <dt className="lead-detail-meta__label">Dernière mise à jour</dt>
            <dd className="lead-detail-meta__value">{formatDate(lead.updatedAt)}</dd>
          </div>
        </dl>
      </Card>

      <Card title="Message client">
        <p className="lead-detail__text">
          {lead.message?.trim() ? lead.message : 'Aucun message laissé.'}
        </p>
      </Card>

      <Card title="Commentaire interne">
        <p className="lead-detail__text">
          {lead.internalComment?.trim()
            ? lead.internalComment
            : 'Aucun commentaire interne.'}
        </p>
      </Card>

      <Card title="Suivi interne">
        <LeadFollowUpForm
          key={`${lead.id}-${lead.priority}-${lead.assignedToUserId ?? ''}-${lead.nextFollowUpAt ?? ''}`}
          lead={lead}
          assignableUsers={assignableUsers}
          submitting={followUpSubmitting}
          onSubmit={handleFollowUpUpdate}
        />
      </Card>

      <Card title="Statut et commentaire">
        <LeadStatusForm
          key={`${lead.id}-${lead.status}-${lead.internalComment ?? ''}`}
          currentStatus={lead.status}
          currentInternalComment={lead.internalComment}
          submitting={submitting}
          onSubmit={handleStatusUpdate}
        />
      </Card>

      <Card title="Historique d'activité">
        <LeadActivityHistory
          items={history}
          loading={historyLoading}
          error={historyError}
        />
      </Card>
    </div>
  );
}
