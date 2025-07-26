const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

if (!key) {
  throw new Error('Google Maps API key is missing. Check NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your .env file.');
}

export const MAPS_API_KEY = key;

