import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

export async function GET({ url }: { url: URL }) {
  // Expecting query parameters: location (lat,lng) and price (1, 2, etc.)
  const location = url.searchParams.get('location');
  const price = url.searchParams.get('price'); // Adapt as needed for your mapping
  const googlePlacesKey = process.env.GOOGLE_PLACES_API_KEY;  // Access key securely on the server

// // Temporary logging: log only a part of the key to verify it's loaded
//   if (googlePlacesKey) {
//     console.log('API key loaded: ' + googlePlacesKey.slice(0, 4) + '...'); 
//   } else {
//     console.log('API key is undefined');
//   }

  if (!location || !price) {
    return new Response(JSON.stringify({ error: 'Missing required parameters' }), { status: 400 });
  }

  // Construct the Google Places API URL
  const apiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=1500&type=restaurant&minprice=${price}&key=${googlePlacesKey}`;

  try {
    const res = await fetch(apiUrl);
    const data = await res.json();

    // Optionally, add logic to store this data in Firebase Firestore

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error fetching data from Google Places API' }), { status: 500 });
  }
}