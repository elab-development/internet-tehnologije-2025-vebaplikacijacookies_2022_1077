export async function trackEvent(
  eventType: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  eventData?: any
) {
  try {
    // Proveri da li imamo pristanak (čita iz localStorage ili cookie-a)
    // Ovde pojednostavljeno čitamo iz cookie-a direktno
    const consentCookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('cookie_consent='));

    if (!consentCookie) return; // Nema pristanka

    const consentData = JSON.parse(decodeURIComponent(consentCookie.split('=')[1]));
    if (!consentData.preferences || !consentData.preferences.analytics) return; // Korisnik odbio analitiku

    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType,
        pageUrl: window.location.pathname,
        eventData,
        referrer: document.referrer,
      }),
      keepalive: true, // Važno da se request pošalje čak i ako korisnik napusti stranicu
    });
  } catch {
    // Silent fail
  }
}
