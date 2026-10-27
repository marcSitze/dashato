import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { AdminUsersClient } from './admin-users-client';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const currentUser = await getCurrentUser();
  let users: any[] = [];

  try {
    const rawUsers = await db.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        status: true,
        createdAt: true,
        _count: { select: { orders: true, reviews: true } },
      },
    });

    users = JSON.parse(JSON.stringify(rawUsers || []));
  } catch (err) {
    console.error('Error fetching admin users:', err);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Répertoire des Utilisateurs & Contrôle des Accès (RBAC)
          </h1>
          <p className="text-sm text-slate-500">
            Gérez les comptes utilisateurs, attribuez les rôles (Client, Vendeur, Admin), suspendez des accès ou créez de nouveaux comptes
          </p>
        </div>
      </div>

      <AdminUsersClient
        initialUsers={users}
        currentUserId={currentUser?.id}
      />
    </div>
  );
}


