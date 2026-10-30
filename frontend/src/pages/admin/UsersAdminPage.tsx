import { useEffect, useState } from 'react';
import {
  IconCheck,
  IconKey,
  IconLoader2,
  IconLock,
  IconPlus,
  IconTrash,
  IconUserOff,
  IconX,
} from '@tabler/icons-react';
import {
  type AdminUser,
  createUserRequest,
  deleteUserRequest,
  listUsersRequest,
  resetUserPasswordRequest,
  toggleUserActiveRequest,
} from '@/lib/users';
import { ApiError } from '@/lib/api';
import { Button } from '@/components/ui/shadcn/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/shadcn/dialog';
import { Input } from '@/components/ui/shadcn/input';
import { Label } from '@/components/ui/shadcn/label';

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

type CreateUserForm = {
  fullName: string;
  email: string;
  password: string;
  role: string;
};

type ResetPasswordForm = {
  userId: string;
  userName: string;
  password: string;
};

export default function UsersAdminPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [form, setForm] = useState<CreateUserForm>({
    fullName: '',
    email: '',
    password: '',
    role: 'ADMIN',
  });

  const [resetForm, setResetForm] = useState<ResetPasswordForm | null>(null);
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  const [pendingActions, setPendingActions] = useState<Set<string>>(new Set());

  async function loadUsers() {
    try {
      setLoading(true);
      const res = await listUsersRequest();
      setUsers(res.data);
    } catch {
      setError('Impossible de charger les utilisateurs.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadUsers(); }, []);

  function addPending(key: string) {
    setPendingActions((prev) => new Set(prev).add(key));
  }
  function removePending(key: string) {
    setPendingActions((prev) => { const s = new Set(prev); s.delete(key); return s; });
  }

  // Role changes are disabled

  async function handleToggleActive(id: string) {
    addPending(id + '_active');
    try {
      const res = await toggleUserActiveRequest(id);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, isActive: res.data.isActive } : u)),
      );
    } finally {
      removePending(id + '_active');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Confirmer la suppression définitive de cet utilisateur ?')) return;
    addPending(id + '_del');
    try {
      await deleteUserRequest(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } finally {
      removePending(id + '_del');
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    try {
      const res = await createUserRequest({ ...form, role: 'ADMIN' });
      setUsers((prev) => [res.data, ...prev]);
      setShowCreate(false);
      setForm({ fullName: '', email: '', password: '', role: 'ADMIN' });
    } catch (err) {
      setCreateError(err instanceof ApiError ? err.message : 'Une erreur est survenue.');
    } finally {
      setCreating(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!resetForm) return;
    setResetting(true);
    setResetError(null);
    try {
      await resetUserPasswordRequest(resetForm.userId, { password: resetForm.password });
      setResetForm(null);
    } catch (err) {
      setResetError(err instanceof ApiError ? err.message : 'Une erreur est survenue.');
    } finally {
      setResetting(false);
    }
  }

  try {
    return (
      <div className="px-4 md:px-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Utilisateurs</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gestion des comptes et des rôles utilisateurs.
            </p>
          </div>
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <IconPlus className="h-4 w-4 mr-1.5" />
            Nouvel utilisateur
          </Button>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
            <IconLoader2 className="h-4 w-4 animate-spin" />
            Chargement…
          </div>
        )}

        {error && <p className="text-sm text-destructive py-4">{error}</p>}

        {!loading && !error && (
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nom</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Statut</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Derniere connexion
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-3 font-medium">{user.fullName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{user.email}</td>

                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-800 dark:text-slate-200">
                        Administrateur
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      {user.isProtected ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-muted-foreground/20 bg-muted/60 px-2 py-0.5 text-xs font-medium text-muted-foreground">
                          <IconLock className="h-3 w-3" />
                          Compte systeme
                        </span>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                            user.isActive
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                          }`}
                        >
                          {user.isActive ? (
                            <>
                              <IconCheck className="h-3 w-3" />
                              Actif
                            </>
                          ) : (
                            <>
                              <IconX className="h-3 w-3" />
                              Inactif
                            </>
                          )}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(user.lastLoginAt)}
                    </td>

                    <td className="px-4 py-3">
                      {user.isProtected ? (
                        <div className="flex justify-end">
                          <span className="text-xs italic text-muted-foreground">Protege</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            title="Reinitialiser le mot de passe"
                            onClick={() =>
                              setResetForm({
                                userId: user.id,
                                userName: user.fullName,
                                password: '',
                              })
                            }
                          >
                            <IconKey className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            title={user.isActive ? 'Desactiver' : 'Activer'}
                            disabled={pendingActions.has(user.id + '_active')}
                            onClick={() => void handleToggleActive(user.id)}
                          >
                            <IconUserOff className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            title="Supprimer"
                            disabled={pendingActions.has(user.id + '_del')}
                            onClick={() => void handleDelete(user.id)}
                          >
                            <IconTrash className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Nouvel utilisateur */}
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouvel utilisateur</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => void handleCreate(e)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="fullName">Nom complet</Label>
                <Input
                  id="fullName"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">Mot de passe temporaire</Label>
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  minLength={8}
                  required
                />
              </div>
              {/* Role select removed (defaulting to ADMIN) */}

              {createError && <p className="text-sm text-destructive">{createError}</p>}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={creating}>
                  {creating && <IconLoader2 className="h-4 w-4 mr-1.5 animate-spin" />}
                  Creer
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Reinitialiser le mot de passe */}
        <Dialog
          open={resetForm !== null}
          onOpenChange={(open) => {
            if (!open) {
              setResetForm(null);
              setResetError(null);
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reinitialiser le mot de passe</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => void handleResetPassword(e)} className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                Nouveau mot de passe pour{' '}
                <span className="font-medium text-foreground">{resetForm?.userName}</span>.
              </p>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={resetForm?.password ?? ''}
                  onChange={(e) =>
                    setResetForm((prev) =>
                      prev ? { ...prev, password: e.target.value } : prev,
                    )
                  }
                  minLength={8}
                  required
                />
              </div>

              {resetError && <p className="text-sm text-destructive">{resetError}</p>}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setResetForm(null);
                    setResetError(null);
                  }}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={resetting}>
                  {resetting && <IconLoader2 className="h-4 w-4 mr-1.5 animate-spin" />}
                  Enregistrer
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    );
  } catch (renderError) {
    console.error("UsersAdminPage rendering crash caught:", renderError);
    return (
      <div className="p-8 text-center bg-slate-900 text-slate-100 min-h-[300px] flex flex-col justify-center items-center rounded-lg border border-slate-800">
        <h2 className="text-lg font-semibold text-rose-500">Une erreur est survenue lors du rendu de la page.</h2>
        <p className="text-sm text-slate-400 mt-2">Veuillez recharger la page ou contacter le support technique.</p>
      </div>
    );
  }
}
