import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

// Define the structure of the expected response from Google Places API
interface Photo {
  photo_reference: string;
  html_attributions?: string[];
  height?: number;
  width?: number;
  // Add other relevant fields based on the API response you need
}

interface Place {
  name: string;
  types: string[];  // Add this to capture the types array from the API
  rating?: number;
  vicinity?: string;  // address
  photos?: Photo[];  // Add this to capture the photos array from the API
  photo_reference?: string;  // Add this to capture the photo reference
  // Add other fields you want to display
}

interface PlacesApiResponse {
  results: Place[];
  next_page_token?: string; // Include next_page_token if it exists
  // Add other relevant fields based on the API response you need
}

function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

async function getAllPlaces(initialUrl: string): Promise<Place[]> {
  let allResults: Place[] = [];
  let nextPageToken: string | undefined;
  
  // Get first page
  const firstResponse = await fetch(initialUrl);
  const firstData = await firstResponse.json() as PlacesApiResponse;
  allResults = firstData.results || [];
  nextPageToken = firstData.next_page_token;
  
  // If there's a next page, wait 2 seconds (required by Google) and fetch next page
  if (nextPageToken) {
    // Google requires a short delay before using the next_page_token
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const nextUrl = `${initialUrl}&pagetoken=${nextPageToken}`;
    const nextResponse = await fetch(nextUrl);
    const nextData = await nextResponse.json() as PlacesApiResponse;
    
    if (nextData.results) {
      allResults.push(...nextData.results);
    }
  }
  
  return allResults;
}

export async function GET({ url }: { url: URL }) {
  const location = url.searchParams.get('location');
  const price = url.searchParams.get('price');
  const googlePlacesKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!location || !price) {
    return new Response(JSON.stringify({ error: 'Missing required parameters' }), { status: 400 });
  }

  const initialUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&rankby=distance&type=restaurant|cafe|bar&minprice=${price}&maxprice=${price}&key=${googlePlacesKey}`;

  try {
    const allResults = await getAllPlaces(initialUrl);
    const excludedTypes = ['lodging', 'golf_course', 'tourist_attraction', 'park', 'hotel', 'resort'];
    
    const seenNames = new Set<string>();
    const filteredResults = allResults.reduce((acc: Place[], place: Place) => {
      if (
        (place.types.includes('restaurant') || 
         place.types.includes('cafe') || 
         place.types.includes('food')) &&
        !excludedTypes.some(type => place.types.includes(type)) &&
        !seenNames.has(place.name)
      ) {
        seenNames.add(place.name);
        // Try to find a food-related photo
        const foodPhoto = place.photos?.find(photo => 
          photo.html_attributions?.some(attr => 
            attr.toLowerCase().includes('food') || 
            attr.toLowerCase().includes('dish') || 
            attr.toLowerCase().includes('meal')
          )
        );
        
        acc.push({
          ...place,
          photo_reference: foodPhoto?.photo_reference || place.photos?.[0]?.photo_reference
        });
      }
      return acc;
    }, []);

    return new Response(JSON.stringify({ 
      results: filteredResults,
      totalFetched: allResults.length,
      totalFiltered: filteredResults.length 
    }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error fetching data from Google Places API' }), { status: 500 });
  }
}