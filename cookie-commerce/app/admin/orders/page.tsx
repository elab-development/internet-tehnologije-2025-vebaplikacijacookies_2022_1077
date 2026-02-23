// app/admin/orders/page.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';

interface OrderItem {
  id: string;
  quantity: number;
  priceAtOrder: number;
  productName: string;
  product: { id: string; name: string; imageUrl: string | null };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  currency: string;
  shippingCity: string;
  shippingStreet: string;
  createdAt: string;
  user: { id: string; email: string; firstName: string; lastName: string };
  items: OrderItem[];
  payment: { paymentMethod: string; status: string } | null;
}

interface StatusCounts {
  total: number;
  PENDING: number;
  PAID: number;
  PROCESSING: number;
  SHIPPED: number;
  DELIVERED: number;
  CANCELLED: number;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Na čekanju', color: 'bg-yellow-100 text-yellow-800' },
  PAID: { label: 'Plaćeno', color: 'bg-blue-100 text-blue-800' },
  PROCESSING: { label: 'Obrađuje se', color: 'bg-indigo-100 text-indigo-800' },
  SHIPPED: { label: 'Poslato', color: 'bg-purple-100 text-purple-800' },
  DELIVERED: { label: 'Isporučeno', color: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Otkazano', color: 'bg-red-100 text-red-800' },
};

export default function AdminOrdersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({
    total: 0, PENDING: 0, PAID: 0, PROCESSING: 0, SHIPPED: 0, DELIVERED: 0, CANCELLED: 0,
  });
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const isAdm = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  const fetchOrders = async (status: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/orders?status=${status}`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setOrders(data.data.orders);
        setStatusCounts(data.data.statusCounts);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdm) fetchOrders(filter);
    else if (!authLoading) setIsLoading(false);
  }, [user, authLoading, filter]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    if (!confirm(`Promeniti status narudžbine u "${STATUS_CONFIG[newStatus]?.label || newStatus}"?`)) return;

    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        fetchOrders(filter);
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD', minimumFractionDigits: 0 }).format(price);

  if (!authLoading && !isAdm) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Pristup odbijen</h2>
        <p className="text-gray-500">Ova stranica je dostupna samo administratorima.</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-2">Upravljanje narudžbinama</h1>
      <p className="text-gray-500 mb-6">Ukupno {statusCounts.total} narudžbina</p>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: 'all', label: 'Sve', count: statusCounts.total },
          { key: 'PENDING', label: 'Na čekanju', count: statusCounts.PENDING },
          { key: 'PAID', label: 'Plaćeno', count: statusCounts.PAID },
          { key: 'PROCESSING', label: 'Obrađuje se', count: statusCounts.PROCESSING },
          { key: 'SHIPPED', label: 'Poslato', count: statusCounts.SHIPPED },
          { key: 'DELIVERED', label: 'Isporučeno', count: statusCounts.DELIVERED },
          { key: 'CANCELLED', label: 'Otkazano', count: statusCounts.CANCELLED },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${filter === tab.key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border">
          <p className="text-4xl mb-4">📦</p>
          <p className="text-gray-600">Nema narudžbina u ovoj kategoriji</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl border overflow-hidden">
              {/* Order header */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-mono font-semibold text-gray-900">{order.orderNumber}</p>
                    <p className="text-xs text-gray-500">
                      {order.user.firstName} {order.user.lastName} ({order.user.email})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-bold text-gray-900">{formatPrice(order.totalAmount)}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${STATUS_CONFIG[order.status]?.color || 'bg-gray-100'}`}>
                    {STATUS_CONFIG[order.status]?.label || order.status}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString('sr-RS')}
                  </span>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${expandedOrder === order.id ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Expanded details */}
              {expandedOrder === order.id && (
                <div className="border-t p-4 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Items */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Stavke</h4>
                      <div className="space-y-1">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span>{item.productName} × {item.quantity}</span>
                            <span className="text-gray-600">{formatPrice(item.priceAtOrder * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Details */}
                    <div className="text-sm space-y-1">
                      <h4 className="font-semibold text-gray-700 mb-2">Detalji</h4>
                      <p><span className="text-gray-500">Dostava:</span> {order.shippingStreet}, {order.shippingCity}</p>
                      {order.payment && (
                        <p><span className="text-gray-500">Plaćanje:</span> {order.payment.paymentMethod === 'card' ? 'Kartica' : 'Pouzeće'}</p>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 pt-3 border-t">
                    {order.status === 'PENDING' && (
                      <>
                        <Button size="sm" variant="primary" onClick={() => updateStatus(order.id, 'PROCESSING')}>
                          ✓ Obradi
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => updateStatus(order.id, 'CANCELLED')}>
                          ✕ Otkaži
                        </Button>
                      </>
                    )}
                    {order.status === 'PROCESSING' && (
                      <Button size="sm" variant="primary" onClick={() => updateStatus(order.id, 'SHIPPED')}>
                        📦 Pošalji
                      </Button>
                    )}
                    {order.status === 'SHIPPED' && (
                      <Button size="sm" variant="primary" onClick={() => updateStatus(order.id, 'DELIVERED')}>
                        ✓ Isporučeno
                      </Button>
                    )}
                    {['PENDING', 'PROCESSING', 'SHIPPED'].includes(order.status) && (
                      <Button size="sm" variant="ghost" onClick={() => updateStatus(order.id, 'CANCELLED')}>
                        Otkaži narudžbinu
                      </Button>
                    )}
                    {order.status === 'CANCELLED' && (
                      <span className="text-sm text-gray-400 italic">Narudžbina je otkazana</span>
                    )}
                    {order.status === 'DELIVERED' && (
                      <span className="text-sm text-green-600 italic">✓ Uspešno isporučeno</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
