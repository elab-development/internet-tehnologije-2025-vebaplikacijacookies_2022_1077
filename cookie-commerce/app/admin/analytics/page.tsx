// app/admin/analytics/page.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface AnalyticsData {
    conversion: {
        rate: number;
        totalCarts: number;
        completedOrders: number;
        totalUsers: number;
        usersWithOrders: number;
    };
    cartAbandonment: {
        activeCarts: number;
        cartsWithItems: number;
        abandonedCarts: number;
    };
    traffic: Array<{ date: string; pageViews: number; events: number }>;
    eventBreakdown: Array<{ type: string; count: number }>;
    revenue: Array<{ date: string; revenue: number }>;
}

export default function AdminAnalyticsPage() {
    const { user, isLoading: authLoading } = useAuth();
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const isAdm = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

    useEffect(() => {
        if (!isAdm) { setIsLoading(false); return; }
        fetch('/api/admin/analytics', { credentials: 'include' })
            .then(r => r.json())
            .then(d => { if (d.success) setData(d.data); })
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, [isAdm]);

    const formatPrice = (n: number) =>
        new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD', minimumFractionDigits: 0 }).format(n);

    if (!authLoading && !isAdm) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Pristup odbijen.</p>
            </div>
        );
    }

    if (isLoading || !data) {
        return (
            <div className="p-8 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
        );
    }

    const maxTraffic = Math.max(...data.traffic.map(t => t.pageViews), 1);
    const maxRevenue = Math.max(...data.revenue.map(r => r.revenue), 1);

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-2">Analitika</h1>
            <p className="text-gray-500 mb-8">Detaljni uvid u performanse prodavnice</p>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-xl border p-4">
                    <p className="text-sm text-gray-500">Konverzija</p>
                    <p className="text-3xl font-bold text-blue-600">{data.conversion.rate}%</p>
                    <p className="text-xs text-gray-400">korpe → narudžbine</p>
                </div>
                <div className="bg-white rounded-xl border p-4">
                    <p className="text-sm text-gray-500">Napuštene korpe</p>
                    <p className="text-3xl font-bold text-orange-600">{data.cartAbandonment.abandonedCarts}</p>
                    <p className="text-xs text-gray-400">od {data.cartAbandonment.activeCarts} korpi</p>
                </div>
                <div className="bg-white rounded-xl border p-4">
                    <p className="text-sm text-gray-500">Narudžbina (30d)</p>
                    <p className="text-3xl font-bold text-green-600">{data.conversion.completedOrders}</p>
                    <p className="text-xs text-gray-400">{data.conversion.usersWithOrders} kupaca</p>
                </div>
                <div className="bg-white rounded-xl border p-4">
                    <p className="text-sm text-gray-500">Ukupno korisnika</p>
                    <p className="text-3xl font-bold text-purple-600">{data.conversion.totalUsers}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Saobraćaj grafikon */}
                <div className="bg-white rounded-xl border p-6">
                    <h3 className="font-semibold mb-4">Saobraćaj (7 dana)</h3>
                    <div className="space-y-2">
                        {data.traffic.map((day) => (
                            <div key={day.date} className="flex items-center gap-3">
                                <span className="text-xs text-gray-500 w-20">{new Date(day.date).toLocaleDateString('sr-RS', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                                <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                                    <div
                                        className="bg-blue-500 h-full rounded-full transition-all"
                                        style={{ width: `${(day.pageViews / maxTraffic) * 100}%` }}
                                    />
                                </div>
                                <span className="text-xs font-medium w-12 text-right">{day.pageViews}</span>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Pregledi stranica</p>
                </div>

                {/* Prihod grafikon */}
                <div className="bg-white rounded-xl border p-6">
                    <h3 className="font-semibold mb-4">Prihod (30 dana)</h3>
                    {data.revenue.length === 0 ? (
                        <p className="text-gray-400 text-sm">Nema podataka o prihodima</p>
                    ) : (
                        <div className="space-y-2">
                            {data.revenue.slice(-7).map((day) => (
                                <div key={day.date} className="flex items-center gap-3">
                                    <span className="text-xs text-gray-500 w-20">{new Date(day.date).toLocaleDateString('sr-RS', { day: 'numeric', month: 'short' })}</span>
                                    <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                                        <div
                                            className="bg-green-500 h-full rounded-full transition-all"
                                            style={{ width: `${(day.revenue / maxRevenue) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-medium w-24 text-right">{formatPrice(day.revenue)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Event Breakdown */}
            <div className="bg-white rounded-xl border p-6">
                <h3 className="font-semibold mb-4">Događaji po tipu (30 dana)</h3>
                {data.eventBreakdown.length === 0 ? (
                    <p className="text-gray-400 text-sm">Nema zabeleženih događaja</p>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {data.eventBreakdown.map((ev) => (
                            <div key={ev.type} className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs text-gray-500 font-mono">{ev.type}</p>
                                <p className="text-xl font-bold text-gray-900">{ev.count}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
