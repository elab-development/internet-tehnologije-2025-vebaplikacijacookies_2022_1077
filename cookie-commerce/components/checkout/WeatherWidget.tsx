'use client';

import React, { useEffect, useState } from 'react';
import { getWeatherByCity } from '@/lib/external/weather';

interface WeatherWidgetProps {
  city: string;
}

export function WeatherWidget({ city }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Debounce za smanjenje broja API poziva dok korisnik kuca
    const timer = setTimeout(async () => {
      if (city.length >= 3) {
        setIsLoading(true);
        const data = await getWeatherByCity(city);
        setWeather(data);
        setIsLoading(false);
      } else {
        setWeather(null);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [city]);

  if (!city || city.length < 3) return null;

  return (
    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100 flex items-center justify-between">
      <div>
        <p className="text-sm font-semibold text-blue-900">
          Vreme na destinaciji za dostavu ({city})
        </p>
        {isLoading ? (
          <p className="text-xs text-blue-600 mt-1">Učitavanje vremenske prognoze...</p>
        ) : weather ? (
          <p className="text-xs text-blue-700 mt-1 capitalize">
            {weather.weather[0].description} • Vlažnost: {weather.main.humidity}%
          </p>
        ) : (
          <p className="text-xs text-blue-600 mt-1">Prognoza trenutno nije dostupna.</p>
        )}
      </div>

      {weather && !isLoading && (
        <div className="flex items-center gap-2">
          <img
            src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}.png`}
            alt="Weather icon"
            className="w-10 h-10"
          />
          <span className="text-xl font-bold text-blue-900">
            {Math.round(weather.main.temp)}°C
          </span>
        </div>
      )}
    </div>
  );
}
