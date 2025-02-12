<script lang="ts">
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';
    import { goto } from '$app/navigation';
    import ZipcodeInput from '$lib/components/ZipcodeInput.svelte';
    import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
    import CardStack from '$lib/components/CardStack.svelte';
    import type { Card } from '$lib/types';
    
    let cards: Card[] = [];
    let windowWidth = 0;
    let currentIndex = 0;
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    let direction = '';
    let showCards = false;
    let zipcode = '';
    let errorMessage = '';
    let isLoading = false;
    let loadingMessage = '';
    let fadeIn = false;
    let googlePlacesKey = '';

    async function convertZipToCoords(zip: string): Promise<[number, number] | null> {
        try {
            const response = await fetch(`/api/geo?zipcode=${zip}`);
            const data = await response.json();
            
            if (data.lat && data.lng) {
                return [data.lat, data.lng];
            }
            errorMessage = 'Invalid zipcode. Please try again.';
            return null;
        } catch (error) {
            console.error('Error converting zipcode:', error);
            errorMessage = 'Error processing zipcode. Please try again.';
            return null;
        }
    }

    async function handleZipcodeSubmit() {
        // Clear any previous error message
        errorMessage = '';
        
        // Basic validation
        if (!/^\d{5}$/.test(zipcode)) {
            errorMessage = 'Please enter a valid 5-digit zipcode';
            return;
        }

        isLoading = true;
        loadingMessage = 'Finding something delicious...';
        
        const coords = await convertZipToCoords(zipcode);
        if (coords) {
            const [lat, lng] = coords;
            const params = new URLSearchParams({
                location: `${lat},${lng}`,
                price: '2'
            });
            
            try {
                const response = await fetch(`/api/places?${params}`);
                const data = await response.json();
                
                if (data.results && Array.isArray(data.results)) {
                    loadingMessage = 'Preparing your meal...';
                    
                    const shuffledResults = [...data.results]
                        .sort(() => Math.random() - 0.5)
                        .slice(0, 50);
                    
                    const restaurants = shuffledResults
                        .sort(() => Math.random() - 0.5)
                        .slice(0, 20);
                    
                    cards = restaurants.map((restaurant: any, index: number) => ({
                        id: index + 1,
                        title: restaurant.name,
                        types: restaurant.types,
                        rating: restaurant.rating,
                        vicinity: restaurant.vicinity,
                        color: ['#FF6B6B', '#4ECDC4', '#45B7D1'][index % 3],
                        imageUrl: restaurant.photo_reference 
                            ? `/api/photo?photo_reference=${restaurant.photo_reference}`
                            : undefined
                    }));

                    setTimeout(() => {
                        showCards = true;
                        fadeIn = true;
                        isLoading = false;
                    }, 500);
                } else {
                    errorMessage = 'No restaurants found in this area.';
                    isLoading = false;
                }
            } catch (error) {
                errorMessage = 'Error fetching restaurants. Please try again.';
                isLoading = false;
            }
        } else {
            isLoading = false;
        }
    }

    onMount(() => {
        windowWidth = window.innerWidth;
    });

    function handleTouchStart(e: MouseEvent | TouchEvent): void {
        isDragging = true;
        startX = e.type === 'mousedown' ? (e as MouseEvent).clientX : (e as TouchEvent).touches[0].clientX;
        currentX = 0;
    }

    function handleTouchMove(e: MouseEvent | TouchEvent): void {
        if (!isDragging) return;
        const x = e.type === 'mousemove' ? (e as MouseEvent).clientX : (e as TouchEvent).touches[0].clientX;
        currentX = x - startX;
        direction = currentX > 0 ? 'YES' : 'NO';
    }

    function handleTouchEnd(): void {
        if (!isDragging) return;
        isDragging = false;
        
        if (Math.abs(currentX) > 100) {
            currentX = currentX > 0 ? windowWidth : -windowWidth;
            setTimeout(() => {
                currentIndex++;
                currentX = 0;
            }, 300);
        } else {
            currentX = 0;
        }
        direction = '';
    }
</script>

<div class="container">
    {#if !showCards}
        <ZipcodeInput
            bind:zipcode
            {isLoading}
            {errorMessage}
            onSubmit={handleZipcodeSubmit}
        />
    {/if}

    {#if isLoading}
        <LoadingSpinner message={loadingMessage} />
    {/if}

    {#if showCards}
        <CardStack
            {cards}
            {currentIndex}
            {currentX}
            {windowWidth}
            {direction}
            {fadeIn}
            {handleTouchStart}
            {handleTouchMove}
            {handleTouchEnd}
        />
    {/if}
</div>

<style>
    .container {
        width: 100%;
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>
