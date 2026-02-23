import React from 'react';
import { Card } from '@/components/ui/Card';

interface OrderSummaryProps {
  items: any[];
  total: number;
  city?: string;
}

export function OrderSummary({ items, total }: OrderSummaryProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD' }).format(price);
  };

  return (
    <div className="space-y-6">
      <Card variant="elevated" padding="lg">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Pregled narudžbine</h3>

        <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
          {items.map((item) => (
            <div key={item.productId} className="flex justify-between text-sm">
              <div className="flex gap-3">
                <span className="font-medium text-gray-500">{item.quantity}x</span>
                <span className="text-gray-900 truncate max-w-[150px]">{item.product.name}</span>
              </div>
              <span className="text-gray-700">{formatPrice(item.product.price * item.quantity)}</span>
            </div>
          ))}
        </div>

        <div className="border-t mt-4 pt-4 space-y-2">
          <div className="flex justify-between text-gray-600">
            <span>Međuzbir</span>
            <span>{formatPrice(total)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Dostava</span>
            <span className="text-green-600">Besplatna</span>
          </div>
          <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t">
            <span>Ukupno</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
