import { GOOGLE_PLACES_API_KEY } from '$env/static/private';

export async function GET({ url }) {
    const photoRef = url.searchParams.get('photo_reference');
    if (!photoRef) {
        return new Response('Photo reference required', { status: 400 });
    }

    const googleUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoRef}&key=${GOOGLE_PLACES_API_KEY}`;
    
    try {
        const response = await fetch(googleUrl);
        const blob = await response.blob();
        return new Response(blob, {
            headers: { 'Content-Type': response.headers.get('Content-Type') || 'image/jpeg' }
        });
    } catch (error) {
        return new Response('Error fetching image', { status: 500 });
    }
} 