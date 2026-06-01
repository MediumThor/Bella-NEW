const MAPS_SCRIPT_ID = 'google-maps-places';

let mapsLoadPromise: Promise<void> | null = null;

export function loadGoogleMaps(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.resolve();
  }

  if ((window as Window & { google?: { maps?: unknown } }).google?.maps) {
    return Promise.resolve();
  }

  if (mapsLoadPromise) return mapsLoadPromise;

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.warn('Google Maps API key missing (VITE_GOOGLE_MAPS_API_KEY)');
    return Promise.resolve();
  }

  mapsLoadPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById(MAPS_SCRIPT_ID);
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Google Maps failed to load')), {
        once: true,
      });
      return;
    }

    const script = document.createElement('script');
    script.id = MAPS_SCRIPT_ID;
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Google Maps failed to load'));
    document.head.appendChild(script);
  });

  return mapsLoadPromise;
}
