import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

export async function GET({ url }: { url: URL }) {
  const location = url.searchParams.get('location');
  const price = url.searchParams.get('price'); 
  const radius = url.searchParams.get('radius');
  const googlePlacesKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!location || !price) {
    return new Response(JSON.stringify({ error: 'Missing required parameters' }), { status: 400 });
  }

  // Construct the Google Places API URL
  const apiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=${radius}&type=restaurant&minprice=${price}&key=${googlePlacesKey}`;


  try {
    const res = await fetch(apiUrl);
    const data = await res.json();

    // Optionally, add logic to store this data in Firebase Firestore

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error fetching data from Google Places API' }), { status: 500 });
  }
}