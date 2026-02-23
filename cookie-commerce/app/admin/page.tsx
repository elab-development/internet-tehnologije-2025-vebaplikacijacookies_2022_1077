// app/admin/page.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { SalesChart } from '@/components/analytics/SalesChart';

interface DashboardStats {
  overview: {
    totalUsers: number;
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    activeUsers: number;
    pendingOrders: number;
  };
  topProducts: Array<{
    product: {
      id: string;
      name: string;
      price: number;
      imageUrl: string | null;
    } | null;
    totalSold: number;
    orderCount: number;
  }>;
  ordersByDay: Array<{
    date: Date;
    count: number;
    revenue: number;
  }>;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ==========================================
  // PROVERA PRISTUPA
  // ==========================================

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN'))) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  // ==========================================
  // UČITAVANJE STATISTIKE
  // ==========================================

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats', {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Greška pri učitavanju statistike');
        }

        const data = await response.json();
        setStats(data.data);
      } catch (err) {
        console.error('Fetch stats error:', err);
        setError((err as Error).message || 'Došlo je do greške');
      } finally {
        setIsLoading(false);
      }
    };

    if (user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN')) {
      fetchStats();
    }
  }, [user]);

  // ==========================================
  // FORMATIRANJE
  // ==========================================

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('sr-RS', {
      style: 'currency',
      currency: 'RSD',
      minimumFractionDigits: 0,
    }).format(price);
  };



  // ==========================================
  // LOADING STATE
  // ==========================================

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Učitavanje...</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // ERROR STATE
  // ==========================================

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card variant="bordered" padding="lg" className="max-w-md">
          <div className="text-center">
            <svg
              className="w-16 h-16 text-red-500 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Greška</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button variant="primary" onClick={() => window.location.reload()}>
              Pokušaj ponovo
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!stats) return null;

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-2">
                Dobrodošli, {user?.firstName} {user?.lastName}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/products')}
              >
                Vidi sajt
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Total Users */}
          <Card variant="elevated" padding="lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Ukupno korisnika</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.overview.totalUsers}
                </p>
                <p className="text-sm text-green-600 mt-1">
                  {stats.overview.activeUsers} aktivnih (7 dana)
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
            </div>
          </Card>

          {/* Total Products */}
          <Card variant="elevated" padding="lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Ukupno proizvoda</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.overview.totalProducts}
                </p>
                <p className="text-sm text-gray-500 mt-1">U katalogu</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
            </div>
          </Card>

          {/* Total Orders */}
          <Card variant="elevated" padding="lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Ukupno narudžbina</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.overview.totalOrders}
                </p>
                <p className="text-sm text-orange-600 mt-1">
                  {stats.overview.pendingOrders} na čekanju
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <svg
                  className="w-8 h-8 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
            </div>
          </Card>

          {/* Total Revenue */}
          <Card variant="elevated" padding="lg" className="md:col-span-2 lg:col-span-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Ukupan prihod</p>
                <p className="text-4xl font-bold text-gray-900">
                  {formatPrice(stats.overview.totalRevenue)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Iz {stats.overview.totalOrders} narudžbina
                </p>
              </div>
              <div className="bg-yellow-100 p-4 rounded-lg">
                <svg
                  className="w-10 h-10 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        {/* Top Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card variant="bordered" padding="lg">
            <CardHeader>
              <h2 className="text-xl font-bold text-gray-900">
                Top 5 proizvoda
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Najprodavaniji proizvodi
              </p>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {stats.topProducts.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Nema podataka o prodaji
                  </p>
                ) : (
                  stats.topProducts.map((item, index) => (
                    <div
                      key={item.product?.id || index}
                      className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                          {item.product?.name || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {item.totalSold} prodato • {item.orderCount} narudžbina
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          {item.product ? formatPrice(item.product.price) : 'N/A'}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardBody>
          </Card>

          {/* Vizualizacija - Google Charts */}
          <Card variant="bordered" padding="lg" className="lg:col-span-2">
            <CardHeader>
              <h2 className="text-xl font-bold text-gray-900">
                Grafički prikaz prodaje
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Odnos broja narudžbina i ostvarenog prihoda
              </p>
            </CardHeader>
            <CardBody>
              <SalesChart data={stats.ordersByDay} />
            </CardBody>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card variant="bordered" padding="lg">
          <CardHeader>
            <h2 className="text-xl font-bold text-gray-900">Brze akcije</h2>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                size="lg"
                fullWidth
                onClick={() => router.push('/admin/products')}
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                }
              >
                Upravljaj proizvodima
              </Button>

              <Button
                variant="outline"
                size="lg"
                fullWidth
                onClick={() => router.push('/admin/orders')}
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                }
              >
                Pregled narudžbina
              </Button>

              <Button
                variant="outline"
                size="lg"
                fullWidth
                onClick={() => router.push('/admin/users')}
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                }
              >
                Upravljaj korisnicima
              </Button>

              <Button
                variant="outline"
                size="lg"
                fullWidth
                onClick={() => router.push('/admin/analytics')}
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                }
              >
                Analitika
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}