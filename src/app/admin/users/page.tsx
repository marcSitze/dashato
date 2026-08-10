import { db } from '@/lib/db';
import { Users, Shield, CheckCircle2, UserX } from 'lucide-react';
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
            User Directory & Access Control (RBAC)
          </h1>
          <p className="text-sm text-slate-500">Manage user accounts, assign roles (Customer, Vendor, Admin), and suspend access</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Orders</th>
                <th className="py-3 px-4">Joined Date</th>
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
                      {u.role}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge variant={u.status === 'ACTIVE' ? 'success' : 'destructive'} className="uppercase font-bold text-[10px]">
                      {u.status}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">{u._count.orders}</td>
                  <td className="py-3.5 px-4 text-slate-500">{formatDate(u.createdAt)}</td>
                  <td className="py-3.5 px-4 text-right space-x-1">
                    <Button size="sm" variant="ghost" className="h-7 text-xs font-bold text-slate-600">
                      Manage Role
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
