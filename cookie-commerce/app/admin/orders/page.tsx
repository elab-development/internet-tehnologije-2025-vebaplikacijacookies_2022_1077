'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders'); // Ovu rutu treba kreirati ako ne postoji
      // Za sada koristimo placeholder podatke ili postojeću rutu ako je ima
      // Ako ne postoji, koristićemo dummy podatke
      setOrders([
        { id: '1', orderNumber: 'ORD-123', status: 'PENDING', totalAmount: 15000, user: { email: 'customer@example.com' }, createdAt: new Date().toISOString() },
        { id: '2', orderNumber: 'ORD-124', status: 'SHIPPED', totalAmount: 8500, user: { email: 'marko@example.com' }, createdAt: new Date().toISOString() },
      ]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    // API poziv za update statusa
    alert(`Status narudžbine ${id} promenjen u ${newStatus}`);
    // Osveži listu
  };

  if (isLoading) return <div>Učitavanje...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Upravljanje Narudžbinama</h1>

      <table className="min-w-full bg-white border">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 border-b text-left">Broj</th>
            <th className="py-2 px-4 border-b text-left">Kupac</th>
            <th className="py-2 px-4 border-b text-left">Datum</th>
            <th className="py-2 px-4 border-b text-left">Iznos</th>
            <th className="py-2 px-4 border-b text-left">Status</th>
            <th className="py-2 px-4 border-b text-right">Akcije</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50">
              <td className="py-2 px-4 border-b font-mono">{order.orderNumber}</td>
              <td className="py-2 px-4 border-b">{order.user.email}</td>
              <td className="py-2 px-4 border-b">{new Date(order.createdAt).toLocaleDateString()}</td>
              <td className="py-2 px-4 border-b">{order.totalAmount} RSD</td>
              <td className="py-2 px-4 border-b">
                <span className={`px-2 py-1 rounded text-xs font-bold
                  ${order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : ''}
                  ${order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' : ''}
                  ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' : ''}
                  ${order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : ''}
                `}>
                  {order.status}
                </span>
              </td>
              <td className="py-2 px-4 border-b text-right space-x-2">
                {order.status === 'PENDING' && (
                  <Button size="sm" onClick={() => updateStatus(order.id, 'SHIPPED')}>Pošalji</Button>
                )}
                {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                  <Button size="sm" variant="danger" onClick={() => updateStatus(order.id, 'CANCELLED')}>Otkaži</Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
