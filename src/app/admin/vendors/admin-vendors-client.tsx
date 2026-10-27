'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Store,
  CheckCircle2,
  Percent,
  Search,
  AlertCircle,
  Clock,
  ShieldCheck,
  Save,
  Loader2,
  X,
  Sliders,
  DollarSign,
  Package,
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
import { toast } from 'sonner';

interface AdminVendorsClientProps {
  initialVendors: any[];
}

export function AdminVendorsClient({ initialVendors }: AdminVendorsClientProps) {
  const router = useRouter();
  const [vendors, setVendors] = React.useState<any[]>(initialVendors);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('ALL');
  const [loadingVendorId, setLoadingVendorId] = React.useState<string | null>(null);

  // Modal state for configuring commission
  const [selectedVendorForCommission, setSelectedVendorForCommission] = React.useState<any | null>(null);
  const [commissionInput, setCommissionInput] = React.useState<string>('10');
  const [isSavingCommission, setIsSavingCommission] = React.useState(false);

  React.useEffect(() => {
    setVendors(initialVendors);
  }, [initialVendors]);

  const handleOpenCommissionModal = (vendor: any) => {
    setSelectedVendorForCommission(vendor);
    const currentRate = vendor.commissionRate ?? 0.10;
    setCommissionInput((currentRate * 100).toFixed(0));
  };

  const handleSaveCommission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendorForCommission) return;

    const parsedPercent = parseFloat(commissionInput);
    if (isNaN(parsedPercent) || parsedPercent < 0 || parsedPercent > 100) {
      toast.error('Veuillez saisir un taux de commission valide entre 0% et 100%');
      return;
    }

    setIsSavingCommission(true);
    try {
      const res = await fetch(`/api/vendors/${selectedVendorForCommission.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commissionRate: parsedPercent, // API normalizes values > 1 to decimal
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la mise à jour de la commission');

      // Update local state
      const newRate = parsedPercent / 100;
      setVendors((prev) =>
        prev.map((v) =>
          v.id === selectedVendorForCommission.id
            ? { ...v, commissionRate: newRate }
            : v
        )
      );

      toast.success(
        `Taux de commission pour "${selectedVendorForCommission.store?.name || selectedVendorForCommission.businessName}" fixé à ${parsedPercent}% !`
      );
      setSelectedVendorForCommission(null);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Impossible de mettre à jour le taux de commission');
    } finally {
      setIsSavingCommission(false);
    }
  };

  const handleUpdateStatus = async (vendorId: string, newStatus: string) => {
    setLoadingVendorId(vendorId);
    try {
      const isApproved = newStatus === 'APPROVED';
      const res = await fetch(`/api/vendors/${vendorId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          isApproved,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors du changement de statut');

      setVendors((prev) =>
        prev.map((v) =>
          v.id === vendorId
            ? { ...v, status: newStatus, isApproved }
            : v
        )
      );

      toast.success(
        newStatus === 'APPROVED'
          ? 'Boutique vendeuse approuvée avec succès !'
          : newStatus === 'SUSPENDED'
          ? 'Boutique suspendue.'
          : 'Statut du vendeur mis à jour.'
      );
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Action impossible');
    } finally {
      setLoadingVendorId(null);
    }
  };

  const filteredVendors = vendors.filter((v) => {
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'APPROVED' && (v.isApproved || v.status === 'APPROVED')) ||
      (statusFilter === 'PENDING' && (v.status === 'PENDING' && !v.isApproved)) ||
      (statusFilter === 'SUSPENDED' && (v.status === 'SUSPENDED'));

    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesStatus;

    const matchesName = (v.store?.name || '').toLowerCase().includes(q);
    const matchesBusiness = (v.businessName || '').toLowerCase().includes(q);
    const matchesOwner = (v.user?.name || '').toLowerCase().includes(q) || (v.user?.email || '').toLowerCase().includes(q);

    return matchesStatus && (matchesName || matchesBusiness || matchesOwner);
  });

  const totalVendors = vendors.length;
  const approvedVendors = vendors.filter((v) => v.isApproved || v.status === 'APPROVED').length;
  const pendingVendors = vendors.filter((v) => v.status === 'PENDING' && !v.isApproved).length;
  const avgCommission = totalVendors > 0
    ? (vendors.reduce((sum, v) => sum + (v.commissionRate ?? 0.10), 0) / totalVendors * 100).toFixed(1)
    : '10.0';

  return (
    <div className="space-y-6">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="rounded-3xl p-5 border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Total Boutiques</span>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center justify-between">
            <span>{totalVendors}</span>
            <Store className="w-5 h-5 text-amber-500" />
          </div>
          <span className="text-[10px] text-slate-400">Vendeurs enregistrés</span>
        </Card>

        <Card className="rounded-3xl p-5 border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Boutiques Approuvées</span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
            <span>{approvedVendors}</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <span className="text-[10px] text-slate-400">Actives sur la marketplace</span>
        </Card>

        <Card className="rounded-3xl p-5 border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">En Attente d'Approbation</span>
          <div className="text-2xl font-black text-amber-500 flex items-center justify-between">
            <span>{pendingVendors}</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <span className="text-[10px] text-slate-400">Candidatures à réviser</span>
        </Card>

        <Card className="rounded-3xl p-5 border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Commission Moyenne</span>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center justify-between">
            <span>{avgCommission}%</span>
            <Percent className="w-5 h-5 text-amber-500" />
          </div>
          <span className="text-[10px] text-slate-400">Taux plateforme moyen</span>
        </Card>
      </div>

      {/* Search Bar & Status Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Rechercher boutique, propriétaire, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 rounded-xl text-xs"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-2xl w-full sm:w-auto overflow-x-auto text-xs font-semibold">
          {[
            { key: 'ALL', label: 'Toutes' },
            { key: 'APPROVED', label: 'Approuvées' },
            { key: 'PENDING', label: 'En Attente' },
            { key: 'SUSPENDED', label: 'Suspendues' },
          ].map((st) => (
            <button
              key={st.key}
              onClick={() => setStatusFilter(st.key)}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                statusFilter === st.key
                  ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVendors.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 text-slate-400 space-y-2">
            <Store className="w-10 h-10 text-slate-400 mx-auto" />
            <p className="font-bold">Aucune boutique vendeuse trouvée</p>
            <p className="text-xs text-slate-500">Modifiez vos critères de recherche ou filtre de statut.</p>
          </div>
        ) : (
          filteredVendors.map((v: any) => {
            const isLoading = loadingVendorId === v.id;
            const ratePercent = ((v.commissionRate ?? 0.10) * 100).toFixed(0);

            return (
              <div
                key={v.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <img
                      src={v.store?.logo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80'}
                      alt=""
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-200 dark:border-slate-800 flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1 truncate text-base">
                        <span className="truncate">{v.store?.name || v.businessName}</span>
                        {v.isApproved && <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
                      </h3>
                      <p className="text-xs text-slate-400 truncate">
                        {v.user?.name} ({v.user?.email})
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <Badge
                          variant={v.isApproved || v.status === 'APPROVED' ? 'success' : v.status === 'PENDING' ? 'warning' : 'destructive'}
                          className="uppercase font-bold text-[10px]"
                        >
                          {v.isApproved || v.status === 'APPROVED'
                            ? 'APPROUVÉ'
                            : v.status === 'PENDING'
                            ? 'EN ATTENTE'
                            : v.status === 'SUSPENDED'
                            ? 'SUSPENDU'
                            : v.status}
                        </Badge>

                        {/* Commission Rate Badge */}
                        <Badge
                          variant="outline"
                          className="text-[10px] font-black border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/5"
                        >
                          {ratePercent}% Commission
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5 font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Identifiant Fiscal :</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">{v.taxId || 'Non renseigné'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Produits Listés :</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">{v._count?.products ?? 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Commandes Passées :</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">{v._count?.orderItems ?? 0}</span>
                    </div>
                  </div>
                </div>

                {/* Actions: Configure Commission & Approve/Suspend */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenCommissionModal(v)}
                    className="w-full text-xs font-bold rounded-xl border-amber-500/30 hover:bg-amber-500/10 text-amber-600 dark:text-amber-400 gap-1.5 h-9"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    Configurer la Commission ({ratePercent}%)
                  </Button>

                  <div className="flex items-center gap-2">
                    {v.status === 'PENDING' || !v.isApproved ? (
                      <Button
                        size="sm"
                        disabled={isLoading}
                        onClick={() => handleUpdateStatus(v.id, 'APPROVED')}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs h-8 shadow-sm"
                      >
                        {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Approuver'}
                      </Button>
                    ) : v.status === 'SUSPENDED' ? (
                      <Button
                        size="sm"
                        disabled={isLoading}
                        onClick={() => handleUpdateStatus(v.id, 'APPROVED')}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs h-8"
                      >
                        {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Réactiver'}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={isLoading}
                        onClick={() => handleUpdateStatus(v.id, 'SUSPENDED')}
                        className="flex-1 text-rose-600 hover:bg-rose-500/10 font-bold rounded-xl text-xs h-8"
                      >
                        {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Suspendre'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Configure Commission Rate Dialog */}
      <Dialog
        open={Boolean(selectedVendorForCommission)}
        onOpenChange={(open) => !open && setSelectedVendorForCommission(null)}
      >
        <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Percent className="w-5 h-5 text-amber-500" />
              Configurer le Taux de Commission
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Définir la commission marketplace prélevée sur chaque vente pour la boutique{' '}
              <strong className="text-slate-900 dark:text-slate-100">
                {selectedVendorForCommission?.store?.name || selectedVendorForCommission?.businessName}
              </strong>.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveCommission} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Pourcentage de Commission Plateforme (%)
              </label>
              <div className="relative">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={commissionInput}
                  onChange={(e) => setCommissionInput(e.target.value)}
                  className="rounded-xl pr-8 font-mono text-sm font-bold"
                  placeholder="Ex: 10"
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">
                  %
                </span>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Taux Rapides prédéfinis :</span>
              <div className="flex items-center gap-2 flex-wrap">
                {['5', '8', '10', '12', '15', '20'].map((preset) => (
                  <button
                    type="button"
                    key={preset}
                    onClick={() => setCommissionInput(preset)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      commissionInput === preset
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {preset}%
                  </button>
                ))}
              </div>
            </div>

            {/* Live Calculation Simulation Box */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1">
              <span className="font-bold text-slate-900 dark:text-slate-100 block">
                Simulation pour une vente de 100 $ :
              </span>
              <div className="flex justify-between text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                <span>Commission Dashato ({commissionInput || 0}%) :</span>
                <span className="font-bold text-emerald-600">
                  +{(100 * (parseFloat(commissionInput || '0') / 100)).toFixed(2)} $
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                <span>Revenu Net Vendeur :</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {(100 - 100 * (parseFloat(commissionInput || '0') / 100)).toFixed(2)} $
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setSelectedVendorForCommission(null)}
                className="text-xs font-bold rounded-xl h-9"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isSavingCommission}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs h-9 shadow-sm shadow-amber-500/20 gap-1.5"
              >
                {isSavingCommission ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" /> Enregistrer le Taux
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
