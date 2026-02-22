'use client';

import React from 'react';
import { Chart } from 'react-google-charts';

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

  // Formatiranje podataka za Google Charts ComboChart
  const chartData = [
    ['Datum', 'Broj narudžbina', 'Prihod (RSD)'],
    ...data.map((item) => [
      new Date(item.date).toLocaleDateString('sr-RS', { day: '2-digit', month: '2-digit' }),
      item.count,
      item.revenue,
    ]),
  ];

  const options = {
    title: 'Analitika prodaje (poslednjih 7 dana)',
    curveType: 'function',
    legend: { position: 'bottom' },
    colors: ['#3B82F6', '#10B981'], // Plava za broj, Zelena za prihod
    vAxes: {
      0: { title: 'Broj narudžbina', format: '#' },
      1: { title: 'Prihod (RSD)', format: '#,###' }
    },
    series: {
      0: { type: 'bars', targetAxisIndex: 0 },
      1: { type: 'line', targetAxisIndex: 1, lineWidth: 3, pointSize: 5 }
    },
    chartArea: { width: '85%', height: '70%' },
    animation: { startup: true, duration: 1000, easing: 'out' },
  };

  return (
    <div className="w-full overflow-hidden rounded-lg">
      <Chart
        chartType="ComboChart"
        width="100%"
        height="400px"
        data={chartData}
        options={options}
        loader={<div className="h-[400px] flex items-center justify-center">Učitavanje grafikona...</div>}
      />
    </div>
  );
}
