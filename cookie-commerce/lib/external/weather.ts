export async function getWeatherByCity(city: string) {
  const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;

  if (!apiKey) {
    console.warn("OpenWeatherMap API ključ nije podešen.");
    return null;
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=sr`
    );

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Greška pri dohvatanju vremena:', error);
    return null;
  }
}
