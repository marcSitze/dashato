import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

export default async function AdminUsersPage() {
  const users = await db.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { orders: true, reviews: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Répertoire des Utilisateurs & Contrôle des Accès (RBAC)
          </h1>
          <p className="text-sm text-slate-500">Gérer les comptes utilisateurs, attribuer les rôles (Client, Vendeur, Admin) et contrôler les accès</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm max-w-full">
        <div className="overflow-x-auto smooth-scroll-x rounded-2xl w-full">
          <table className="w-full min-w-[650px] text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
                <th className="py-3 px-4">Utilisateur</th>
                <th className="py-3 px-4">Rôle</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4">Commandes</th>
                <th className="py-3 px-4">Date d’inscription</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.map((u: any) => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={u.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                        alt=""
                        className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-800"
                      />
                      <div>
                        <div className="font-bold text-slate-900 dark:text-slate-100">{u.name}</div>
                        <div className="text-[10px] text-slate-400">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge variant={u.role === 'ADMIN' ? 'destructive' : u.role === 'VENDOR' ? 'default' : 'secondary'} className="uppercase font-bold text-[10px]">
                      {u.role === 'CUSTOMER' ? 'CLIENT' : u.role === 'VENDOR' ? 'VENDEUR' : u.role}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge variant={u.status === 'ACTIVE' ? 'success' : 'destructive'} className="uppercase font-bold text-[10px]">
                      {u.status === 'ACTIVE' ? 'ACTIF' : u.status === 'SUSPENDED' ? 'SUSPENDU' : u.status}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">{u._count.orders}</td>
                  <td className="py-3.5 px-4 text-slate-500">{formatDate(u.createdAt)}</td>
                  <td className="py-3.5 px-4 text-right space-x-1">
                    <Button size="sm" variant="ghost" className="h-7 text-xs font-bold text-amber-600 hover:bg-amber-500/10">
                      Gérer le Rôle
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

