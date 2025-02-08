import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

// Define the structure of the expected response from Google Places API
interface Place {
  name: string;
  types: string[];  // Add this to capture the types array from the API
  // Add other relevant fields based on the API response you need
}

interface PlacesApiResponse {
  results: Place[];
  // Add other relevant fields based on the API response you need
}

export async function GET({ url }: { url: URL }) {
  // Expecting query parameters: location (lat,lng) and price (1, 2, etc.)
  const location = url.searchParams.get('location');
  const price = url.searchParams.get('price');  // This will be used for both min and max price
  const radius = url.searchParams.get('radius');
  const googlePlacesKey = process.env.GOOGLE_PLACES_API_KEY;  // Access key securely on the server

  if (!location || !price || !radius) {
    return new Response(JSON.stringify({ error: 'Missing required parameters' }), { status: 400 });
  }

  // Construct the Google Places API URL with both minprice and maxprice
  const apiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=${radius}&type=restaurant&price=${price}&key=${googlePlacesKey}`;

  try {
    const res = await fetch(apiUrl);
    const data = await res.json() as PlacesApiResponse;

    if (data && Array.isArray(data.results)) {
      // Filter for places that are primarily restaurants
      const restaurantResults = data.results.filter((place: Place) => {
        // Check if 'restaurant' is the primary type (first in the array)
        // AND exclude places that have certain types we don't want
        const excludedTypes = ['lodging', 'golf_course', 'tourist_attraction', 'park'];
        return (
          place.types.includes('restaurant') &&
          !excludedTypes.some(type => place.types.includes(type))
        );
      });

      // Filter out duplicates based on place name
      const uniqueResults = restaurantResults.filter((result: Place, index: number, self: Place[]) =>
        index === self.findIndex((r: Place) => r.name === result.name)
      );

      return new Response(JSON.stringify({ ...data, results: uniqueResults }), { status: 200 });
    }

    // Optionally, add logic to store this data in Firebase Firestore

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error fetching data from Google Places API' }), { status: 500 });
  }
}