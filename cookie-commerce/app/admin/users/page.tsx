// app/admin/users/page.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';

interface AdminUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    phoneNumber: string | null;
    createdAt: string;
    _count: { orders: number; reviews: number; sessions: number };
}

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
    CUSTOMER: { label: 'Customer', color: 'bg-blue-100 text-blue-800' },
    MODERATOR: { label: 'Moderator', color: 'bg-purple-100 text-purple-800' },
    ADMIN: { label: 'Admin', color: 'bg-orange-100 text-orange-800' },
    SUPER_ADMIN: { label: 'Super Admin', color: 'bg-red-100 text-red-800' },
};

export default function AdminUsersPage() {
    const { user, isLoading: authLoading } = useAuth();
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [roleCounts, setRoleCounts] = useState<Record<string, number>>({});
    const [isLoading, setIsLoading] = useState(true);

    const isAdm = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/users', { credentials: 'include' });
            const data = await res.json();
            if (data.success) {
                setUsers(data.data.users);
                setRoleCounts(data.data.roleCounts);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isAdm) fetchUsers();
        else if (!authLoading) setIsLoading(false);
    }, [user, authLoading]);

    const handleRoleChange = async (userId: string, newRole: string) => {
        if (!confirm(`Promeniti ulogu korisnika u ${newRole}?`)) return;
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ userId, role: newRole }),
            });
            const data = await res.json();
            if (data.success) {
                fetchUsers();
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (userId: string, email: string) => {
        if (!confirm(`Da li ste sigurni da želite da obrišete korisnika ${email}? Ova akcija je nepovratna.`)) return;
        try {
            const res = await fetch(`/api/admin/users?userId=${userId}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            const data = await res.json();
            if (data.success) {
                fetchUsers();
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (!authLoading && !isAdm) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold mb-4">Pristup odbijen</h2>
                <p className="text-gray-500">Ova stranica je dostupna samo administratorima.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Upravljanje korisnicima</h1>
                <p className="text-gray-500 mb-8">
                    Ukupno: {roleCounts.total || 0} korisnika •
                    {' '}{roleCounts.customers || 0} kupaca •
                    {' '}{roleCounts.moderators || 0} moderatora •
                    {' '}{roleCounts.admins || 0} admina
                </p>

                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="text-left px-4 py-3 font-medium text-gray-600">Korisnik</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-600">Uloga</th>
                                    <th className="text-center px-4 py-3 font-medium text-gray-600">Narudžbine</th>
                                    <th className="text-center px-4 py-3 font-medium text-gray-600">Recenzije</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-600">Registrovan</th>
                                    <th className="text-right px-4 py-3 font-medium text-gray-600">Akcije</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {users.map((u) => {
                                    const roleInfo = ROLE_LABELS[u.role] || { label: u.role, color: 'bg-gray-100 text-gray-800' };
                                    const isCurrentUser = u.id === user?.id;

                                    return (
                                        <tr key={u.id} className={`hover:bg-gray-50 ${isCurrentUser ? 'bg-blue-50' : ''}`}>
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-gray-900">{u.firstName} {u.lastName}</p>
                                                <p className="text-xs text-gray-500">{u.email}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                {isCurrentUser ? (
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleInfo.color}`}>
                                                        {roleInfo.label} (Vi)
                                                    </span>
                                                ) : (
                                                    <select
                                                        value={u.role}
                                                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                                        className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${roleInfo.color}`}
                                                    >
                                                        <option value="CUSTOMER">Customer</option>
                                                        <option value="MODERATOR">Moderator</option>
                                                        {user?.role === 'SUPER_ADMIN' && <option value="ADMIN">Admin</option>}
                                                        {user?.role === 'SUPER_ADMIN' && <option value="SUPER_ADMIN">Super Admin</option>}
                                                    </select>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-center text-gray-600">{u._count.orders}</td>
                                            <td className="px-4 py-3 text-center text-gray-600">{u._count.reviews}</td>
                                            <td className="px-4 py-3 text-gray-500 text-xs">
                                                {new Date(u.createdAt).toLocaleDateString('sr-RS')}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {!isCurrentUser && (
                                                    <Button size="sm" variant="ghost" onClick={() => handleDelete(u.id, u.email)}>
                                                        🗑
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
