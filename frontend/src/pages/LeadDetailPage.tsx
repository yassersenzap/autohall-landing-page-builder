import { useCallback, useEffect, useState, type ReactNode } from 'react';
import {
  Calendar,
  Car,
  Globe,
  Mail,
  Megaphone,
  Phone,
  Tag,
  User,
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import LeadActivityHistory from '../components/leads/LeadActivityHistory';
import LeadFollowUpForm from '../components/leads/LeadFollowUpForm';
import LeadStatusForm from '../components/leads/LeadStatusForm';
import { Card } from '../components/ui/Card';
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

type MetaFieldProps = {
  icon: ReactNode;
  label: string;
  children: React.ReactNode;
  className?: string;
};

function MetaField({ icon, label, children, className }: MetaFieldProps) {
  return (
    <div className={className}>
      <dt className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-neutral-500">
        <span className="text-neutral-600" aria-hidden>
          {icon}
        </span>
        {label}
      </dt>
      <dd className="text-base font-medium text-neutral-100">{children}</dd>
    </div>
  );
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
    return <p className="text-neutral-500">Chargement du lead…</p>;
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
        <Link to="/leads" className="mb-4 inline-flex text-sm text-neutral-500 hover:text-neutral-300">
          ← Retour à la liste
        </Link>
        {error ? <p className="ui-alert ui-alert--error">{error}</p> : null}
        {!error ? <p className="text-neutral-500">Lead introuvable.</p> : null}
      </div>
    );
  }

  return (
    <div className="studio-stack lead-detail-page">
      <header className="mb-8">
        <Link
          to="/leads"
          className="mb-4 inline-flex text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-300"
        >
          ← Retour à la liste
        </Link>
        <h1 className="mb-2 text-4xl font-bold tracking-tight text-neutral-100">
          {lead.fullName}
        </h1>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <StatusBadge status={lead.status} />
          <PriorityBadge priority={lead.priority} />
        </div>
        <p className="text-sm text-neutral-500">
          Lead reçu le {formatDate(lead.createdAt)}
        </p>
      </header>

      {error ? <p className="ui-alert ui-alert--error">{error}</p> : null}
      {success ? (
        <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
          {success}
        </p>
      ) : null}
      {followUpSuccess ? (
        <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
          {followUpSuccess}
        </p>
      ) : null}

      <Card title="Informations">
        <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <MetaField icon={<Phone className="h-3.5 w-3.5" />} label="Téléphone">
            {lead.phone}
          </MetaField>
          <MetaField icon={<Mail className="h-3.5 w-3.5" />} label="Email">
            {lead.email ?? '—'}
          </MetaField>
          <MetaField icon={<Megaphone className="h-3.5 w-3.5" />} label="Campagne">
            {lead.campaignName}
          </MetaField>
          <MetaField icon={<Globe className="h-3.5 w-3.5" />} label="Landing page">
            {lead.landingPageTitle} (/{lead.landingPageSlug})
          </MetaField>
          <MetaField icon={<Car className="h-3.5 w-3.5" />} label="Marque / modèle">
            {[lead.brand, lead.model].filter(Boolean).join(' · ') || '—'}
          </MetaField>
          <MetaField icon={<User className="h-3.5 w-3.5" />} label="Assigné à">
            {lead.assignedTo?.fullName ?? 'Non assigné'}
          </MetaField>
          <MetaField icon={<Calendar className="h-3.5 w-3.5" />} label="Prochaine relance">
            <span className={lead.isFollowUpOverdue ? 'text-amber-400' : undefined}>
              {formatLeadDate(lead.nextFollowUpAt)}
              {lead.isFollowUpOverdue ? ' · En retard' : ''}
            </span>
          </MetaField>
          <MetaField icon={<Tag className="h-3.5 w-3.5" />} label="Type de demande">
            {lead.requestType}
          </MetaField>
          <MetaField icon={<Globe className="h-3.5 w-3.5" />} label="Source">
            <a
              href={lead.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="break-all text-blue-400 underline-offset-2 hover:underline"
            >
              {lead.sourceUrl}
            </a>
          </MetaField>
          <MetaField icon={<Calendar className="h-3.5 w-3.5" />} label="Dernière mise à jour">
            {formatDate(lead.updatedAt)}
          </MetaField>
        </dl>
      </Card>

      <Card title="Message client">
        <p className="text-base leading-relaxed text-neutral-300">
          {lead.message?.trim() ? lead.message : 'Aucun message laissé.'}
        </p>
      </Card>

      <Card title="Commentaire interne">
        <p className="text-base leading-relaxed text-neutral-300">
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
