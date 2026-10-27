'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  UserCheck,
  UserX,
  Shield,
  Store,
  UserPlus,
  Search,
  Trash2,
  Sliders,
  Loader2,
  Save,
  CheckCircle2,
  ShoppingBag,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

interface AdminUsersClientProps {
  initialUsers: any[];
  currentUserId?: string;
}

export function AdminUsersClient({ initialUsers, currentUserId }: AdminUsersClientProps) {
  const router = useRouter();
  const [users, setUsers] = React.useState<any[]>(initialUsers);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState('ALL');
  const [statusFilter, setStatusFilter] = React.useState('ALL');
  const [loadingUserId, setLoadingUserId] = React.useState<string | null>(null);

  // Create User Modal state
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [isCreating, setIsCreating] = React.useState(false);
  const [createFormData, setCreateFormData] = React.useState({
    name: '',
    email: '',
    password: '',
    role: 'CUSTOMER',
    status: 'ACTIVE',
  });

  // Edit Role Modal state
  const [editingUserForRole, setEditingUserForRole] = React.useState<any | null>(null);
  const [selectedRole, setSelectedRole] = React.useState<string>('CUSTOMER');
  const [isUpdatingRole, setIsUpdatingRole] = React.useState(false);

  // Delete User Confirmation state
  const [deletingUser, setDeletingUser] = React.useState<any | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  React.useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  // Create User Handler
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createFormData.name || !createFormData.email || !createFormData.password) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsCreating(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createFormData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la création de l\'utilisateur');

      setUsers((prev) => [data.data, ...prev]);
      toast.success(`Utilisateur "${data.data.name}" créé avec succès (${data.data.role}) !`);
      setIsCreateOpen(false);
      setCreateFormData({
        name: '',
        email: '',
        password: '',
        role: 'CUSTOMER',
        status: 'ACTIVE',
      });
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Impossible de créer l\'utilisateur');
    } finally {
      setIsCreating(false);
    }
  };

  // Update Role Handler
  const handleOpenRoleModal = (user: any) => {
    setEditingUserForRole(user);
    setSelectedRole(user.role);
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUserForRole) return;

    setIsUpdatingRole(true);
    try {
      const res = await fetch(`/api/users/${editingUserForRole.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors du changement de rôle');

      setUsers((prev) =>
        prev.map((u) => (u.id === editingUserForRole.id ? { ...u, role: selectedRole } : u))
      );

      toast.success(`Rôle de ${editingUserForRole.name} mis à jour : ${selectedRole}`);
      setEditingUserForRole(null);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Impossible de changer le rôle');
    } finally {
      setIsUpdatingRole(false);
    }
  };

  // Toggle Status Handler
  const handleToggleStatus = async (user: any) => {
    const newStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    setLoadingUserId(user.id);

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors du changement de statut');

      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u))
      );

      toast.success(
        newStatus === 'ACTIVE'
          ? `Compte de ${user.name} réactivé !`
          : `Compte de ${user.name} suspendu.`
      );
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Impossible de modifier le statut');
    } finally {
      setLoadingUserId(null);
    }
  };

  // Delete User Handler
  const handleDeleteUser = async () => {
    if (!deletingUser) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/users/${deletingUser.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la suppression');

      setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
      toast.success(`Utilisateur "${deletingUser.name}" supprimé définitivement.`);
      setDeletingUser(null);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Impossible de supprimer cet utilisateur');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filters
  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;

    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesRole && matchesStatus;

    const matchesName = (u.name || '').toLowerCase().includes(q);
    const matchesEmail = (u.email || '').toLowerCase().includes(q);

    return matchesRole && matchesStatus && (matchesName || matchesEmail);
  });

  // Overview Counts
  const totalUsers = users.length;
  const totalCustomers = users.filter((u) => u.role === 'CUSTOMER').length;
  const totalVendors = users.filter((u) => u.role === 'VENDOR').length;
  const totalAdmins = users.filter((u) => u.role === 'ADMIN').length;

  return (
    <div className="space-y-6">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="rounded-3xl p-5 border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Utilisateurs Totaux</span>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center justify-between">
            <span>{totalUsers}</span>
            <Users className="w-5 h-5 text-amber-500" />
          </div>
          <span className="text-[10px] text-slate-400">Tous profils confondus</span>
        </Card>

        <Card className="rounded-3xl p-5 border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Clients Actifs</span>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 flex items-center justify-between">
            <span>{totalCustomers}</span>
            <UserCheck className="w-5 h-5 text-blue-500" />
          </div>
          <span className="text-[10px] text-slate-400">Comptes acheteurs</span>
        </Card>

        <Card className="rounded-3xl p-5 border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Boutiques Vendeuses</span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
            <span>{totalVendors}</span>
            <Store className="w-5 h-5 text-emerald-500" />
          </div>
          <span className="text-[10px] text-slate-400">Vendeurs avec boutique</span>
        </Card>

        <Card className="rounded-3xl p-5 border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Administrateurs</span>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 flex items-center justify-between">
            <span>{totalAdmins}</span>
            <Shield className="w-5 h-5 text-rose-500" />
          </div>
          <span className="text-[10px] text-slate-400">Accès plateforme complet</span>
        </Card>
      </div>

      {/* Search, Filters, and Add User Button */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Rechercher nom, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rounded-xl text-xs"
            />
          </div>

          {/* Role Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-2xl w-full sm:w-auto overflow-x-auto text-xs font-semibold">
            {[
              { key: 'ALL', label: 'Tous' },
              { key: 'CUSTOMER', label: 'Clients' },
              { key: 'VENDOR', label: 'Vendeurs' },
              { key: 'ADMIN', label: 'Admins' },
            ].map((rf) => (
              <button
                key={rf.key}
                onClick={() => setRoleFilter(rf.key)}
                className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                  roleFilter === rf.key
                    ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm font-bold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {rf.label}
              </button>
            ))}
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-2xl w-full sm:w-auto overflow-x-auto text-xs font-semibold">
            {[
              { key: 'ALL', label: 'Tous Statuts' },
              { key: 'ACTIVE', label: 'Actifs' },
              { key: 'SUSPENDED', label: 'Suspendus' },
            ].map((sf) => (
              <button
                key={sf.key}
                onClick={() => setStatusFilter(sf.key)}
                className={`px-2.5 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                  statusFilter === sf.key
                    ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm font-bold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {sf.label}
              </button>
            ))}
          </div>
        </div>

        {/* Create User Button */}
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs h-10 px-4 shadow-sm shadow-amber-500/10 gap-1.5 w-full sm:w-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Nouvel Utilisateur</span>
        </Button>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm max-w-full">
        <div className="overflow-x-auto smooth-scroll-x rounded-2xl w-full">
          <table className="w-full min-w-[750px] text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
                <th className="py-3 px-4">Utilisateur</th>
                <th className="py-3 px-4">Rôle</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4">Commandes</th>
                <th className="py-3 px-4">Date d'inscription</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Aucun utilisateur ne correspond à vos filtres de recherche.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u: any) => {
                  const isLoading = loadingUserId === u.id;
                  const isCurrentLoggedIn = currentUserId === u.id;

                  return (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              u.image ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
                            }
                            alt=""
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-800 flex-shrink-0"
                          />
                          <div>
                            <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {isCurrentLoggedIn && (
                                <Badge variant="outline" className="text-[9px] font-bold py-0 px-1 border-amber-500/40 text-amber-600">
                                  Vous
                                </Badge>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            u.role === 'ADMIN'
                              ? 'destructive'
                              : u.role === 'VENDOR'
                              ? 'default'
                              : 'secondary'
                          }
                          className="uppercase font-bold text-[10px]"
                        >
                          {u.role === 'CUSTOMER' ? 'CLIENT' : u.role === 'VENDOR' ? 'VENDEUR' : u.role}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge
                          variant={u.status === 'ACTIVE' ? 'success' : 'destructive'}
                          className="uppercase font-bold text-[10px]"
                        >
                          {u.status === 'ACTIVE' ? 'ACTIF' : 'SUSPENDU'}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                        {u._count?.orders ?? 0}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500">{formatDate(u.createdAt)}</td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Role Management Button */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenRoleModal(u)}
                            className="h-7 text-xs font-semibold rounded-lg border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-amber-600 hover:border-amber-500/40 gap-1"
                          >
                            <Sliders className="w-3 h-3 text-amber-500" />
                            Rôle
                          </Button>

                          {/* Toggle Status (Suspend / Reactivate) */}
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={isLoading || isCurrentLoggedIn}
                            onClick={() => handleToggleStatus(u)}
                            className={`h-7 text-xs font-bold rounded-lg ${
                              u.status === 'ACTIVE'
                                ? 'text-amber-600 hover:bg-amber-500/10'
                                : 'text-emerald-600 hover:bg-emerald-500/10'
                            }`}
                            title={isCurrentLoggedIn ? 'Vous ne pouvez pas suspendre votre propre compte' : undefined}
                          >
                            {isLoading ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : u.status === 'ACTIVE' ? (
                              'Suspendre'
                            ) : (
                              'Réactiver'
                            )}
                          </Button>

                          {/* Delete User Button */}
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={isCurrentLoggedIn}
                            onClick={() => setDeletingUser(u)}
                            className="h-7 px-2 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-lg"
                            title={isCurrentLoggedIn ? 'Impossible de supprimer votre propre compte' : 'Supprimer'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-amber-500" />
              Créer un Nouvel Utilisateur
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Renseignez les coordonnées de l'utilisateur et assignez-lui un rôle sur la marketplace.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateUser} className="space-y-4 pt-2 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Nom Complet *</label>
              <Input
                type="text"
                required
                placeholder="Ex: Jean Dupont"
                value={createFormData.name}
                onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                className="rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Adresse Email *</label>
              <Input
                type="email"
                required
                placeholder="Ex: jean.dupont@example.com"
                value={createFormData.email}
                onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                className="rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Mot de Passe *</label>
              <Input
                type="password"
                required
                placeholder="Au moins 6 caractères"
                value={createFormData.password}
                onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
                className="rounded-xl text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Rôle Attribué</label>
                <select
                  value={createFormData.role}
                  onChange={(e) => setCreateFormData({ ...createFormData, role: e.target.value })}
                  className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-2.5 font-bold"
                >
                  <option value="CUSTOMER">Client (Acheteur)</option>
                  <option value="VENDOR">Vendeur (Boutique)</option>
                  <option value="ADMIN">Administrateur</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Statut Initial</label>
                <select
                  value={createFormData.status}
                  onChange={(e) => setCreateFormData({ ...createFormData, status: e.target.value })}
                  className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-2.5 font-bold"
                >
                  <option value="ACTIVE">Actif</option>
                  <option value="SUSPENDED">Suspendu</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsCreateOpen(false)}
                className="text-xs font-bold rounded-xl h-9"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isCreating}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs h-9 shadow-sm shadow-amber-500/20"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> Création...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5 mr-1.5" /> Créer le Compte
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Role Modal Dialog */}
      <Dialog
        open={Boolean(editingUserForRole)}
        onOpenChange={(open) => !open && setEditingUserForRole(null)}
      >
        <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-amber-500" />
              Modifier le Rôle Utilisateur
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Attribuer un nouveau rôle RBAC pour{' '}
              <strong className="text-slate-900 dark:text-slate-100">{editingUserForRole?.name}</strong> (
              {editingUserForRole?.email}).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveRole} className="space-y-4 pt-2 text-xs">
            <div className="space-y-2">
              <label className="font-bold text-slate-700 dark:text-slate-300">Nouveau Rôle :</label>
              <div className="space-y-2">
                {[
                  {
                    key: 'CUSTOMER',
                    title: 'Client (Acheteur)',
                    desc: 'Peut acheter des produits, laisser des avis et suivre ses commandes.',
                  },
                  {
                    key: 'VENDOR',
                    title: 'Vendeur (Boutique)',
                    desc: 'Peut créer une boutique, lister des produits et gérer ses expéditions.',
                  },
                  {
                    key: 'ADMIN',
                    title: 'Administrateur Plateforme',
                    desc: 'Accès complet au tableau de bord d\'administration et contrôle des accès.',
                  },
                ].map((roleOpt) => (
                  <label
                    key={roleOpt.key}
                    onClick={() => setSelectedRole(roleOpt.key)}
                    className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                      selectedRole === roleOpt.key
                        ? 'border-amber-500 bg-amber-500/5 ring-1 ring-amber-500/30'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      checked={selectedRole === roleOpt.key}
                      onChange={() => setSelectedRole(roleOpt.key)}
                      className="mt-0.5 accent-amber-500"
                    />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-100 block">
                        {roleOpt.title}
                      </span>
                      <p className="text-[11px] text-slate-400 mt-0.5">{roleOpt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setEditingUserForRole(null)}
                className="text-xs font-bold rounded-xl h-9"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isUpdatingRole}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs h-9 shadow-sm shadow-amber-500/20 gap-1.5"
              >
                {isUpdatingRole ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" /> Valider le Rôle
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <Dialog
        open={Boolean(deletingUser)}
        onOpenChange={(open) => !open && setDeletingUser(null)}
      >
        <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-rose-600 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-rose-500" />
              Confirmer la Suppression
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Êtes-vous sûr de vouloir supprimer définitivement le compte de{' '}
              <strong className="text-slate-900 dark:text-slate-100">{deletingUser?.name}</strong> (
              {deletingUser?.email}) ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setDeletingUser(null)}
              className="text-xs font-bold rounded-xl h-9"
            >
              Annuler
            </Button>
            <Button
              type="button"
              disabled={isDeleting}
              onClick={handleDeleteUser}
              className="bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs h-9 shadow-sm"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> Suppression...
                </>
              ) : (
                'Supprimer Définitivement'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
