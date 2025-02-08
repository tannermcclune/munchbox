import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

export async function GET({ url }: { url: URL }) {
  const zipcode = url.searchParams.get('zipcode');
  const googleMapsKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!zipcode) {
    return new Response(JSON.stringify({ error: 'Missing zipcode parameter' }), { status: 400 });
  }

  // Construct the Google Geocoding API URL
  const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${zipcode}&key=${googleMapsKey}`;

  try {
    const res = await fetch(apiUrl);
    const data = await res.json() as {
        status: string;
        results?: Array<{
            geometry: {
                location: {
                    lat: number;
                    lng: number;
                }
            }
        }>
    };

    // Debug: Log the response
    console.log('Geocoding response:', data);

    if (data.status === 'OK' && data.results && data.results[0]) {
      const { lat, lng } = data.results[0].geometry.location;
      return new Response(JSON.stringify({ lat, lng }), { status: 200 });
    } else {
      return new Response(JSON.stringify({ 
        error: 'Invalid zipcode or no results found',
        status: data.status 
      }), { status: 400 });
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Error fetching data from Google Geocoding API' }), { status: 500 });
  }
}