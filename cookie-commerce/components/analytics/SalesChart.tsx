// components/analytics/SalesChart.tsx

'use client';

import React from 'react';

interface SalesChartProps {
  data: Array<{ date: string | Date; count: number; revenue: number }>;
}

export function SalesChart({ data }: SalesChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg">
        Nema dovoljno podataka za grafikon
      </div>
    );
  }

  const maxCount = Math.max(...data.map(d => d.count), 1);
  const maxRevenue = Math.max(...data.map(d => d.revenue), 1);

  const formatDate = (date: string | Date) =>
    new Date(date).toLocaleDateString('sr-RS', { day: '2-digit', month: '2-digit' });

  const formatPrice = (n: number) =>
    new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD', minimumFractionDigits: 0 }).format(n);

  return (
    <div className="w-full">
      {/* Legend */}
      <div className="flex gap-6 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-500" />
          <span className="text-gray-600">Broj narudžbina</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-500" />
          <span className="text-gray-600">Prihod (RSD)</span>
        </div>
      </div>

      {/* Chart */}
      <div className="space-y-3">
        {data.map((item, i) => (
          <div key={i} className="grid grid-cols-[80px_1fr_120px] items-center gap-3">
            {/* Datum */}
            <span className="text-xs text-gray-500 text-right font-mono">
              {formatDate(item.date)}
            </span>

            {/* Bars */}
            <div className="space-y-1">
              {/* Narudžbine bar */}
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(item.count / maxCount) * 100}%`, minWidth: item.count > 0 ? '8px' : '0' }}
                  />
                </div>
                <span className="text-xs font-semibold text-blue-700 w-8">{item.count}</span>
              </div>
              {/* Prihod bar */}
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-green-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(item.revenue / maxRevenue) * 100}%`, minWidth: item.revenue > 0 ? '8px' : '0' }}
                  />
                </div>
              </div>
            </div>

            {/* Prihod text */}
            <span className="text-xs text-green-700 font-medium text-right">
              {formatPrice(item.revenue)}
            </span>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t grid grid-cols-2 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold text-blue-600">{data.reduce((s, d) => s + d.count, 0)}</p>
          <p className="text-xs text-gray-500">Ukupno narudžbina</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-green-600">{formatPrice(data.reduce((s, d) => s + d.revenue, 0))}</p>
          <p className="text-xs text-gray-500">Ukupan prihod</p>
        </div>
      </div>
    </div>
  );
}
