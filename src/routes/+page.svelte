<script lang="ts">
    import { onMount } from 'svelte';
    
    interface Card {
        id: number;
        title: string;
        color: string;
    }
    
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

    async function convertZipToCoords(zip: string): Promise<[number, number] | null> {
        try {
            const response = await fetch(`/api/geo?zipcode=${zip}`);
            const data = await response.json();
            
            if (data.lat && data.lng) {
                return [data.lat, data.lng];
            }
            return null;
        } catch (error) {
            console.error('Error converting zipcode:', error);
            return null;
        }
    }

    async function handleZipcodeSubmit() {
        if (!/^\d{5}$/.test(zipcode)) {
            errorMessage = 'Please enter a valid 5-digit zipcode';
            return;
        }

        const coords = await convertZipToCoords(zipcode);
        if (coords) {
            const [lat, lng] = coords;
            const params = new URLSearchParams({
                location: `${lat},${lng}`,
                price: '2',
                radius: '8000'
            });
            
            // Reset any previous error
            errorMessage = '';
            
            try {
                const response = await fetch(`/api/places?${params}`);
                const data = await response.json();
                
                if (data.results && Array.isArray(data.results)) {
                    const restaurants = data.results.slice(0, 10);
                    cards = restaurants.map((restaurant: any, index: number) => ({
                        id: index + 1,
                        title: restaurant.name,
                        color: ['#FF6B6B', '#4ECDC4', '#45B7D1'][index % 3]
                    }));
                    showCards = true;
                }
            } catch (error) {
                errorMessage = 'Error fetching restaurants. Please try again.';
                console.error('Error:', error);
            }
        } else {
            errorMessage = 'Invalid zipcode. Please try again.';
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
        <div class="zipcode-container">
            <h1>Find Restaurants Near You</h1>
            <div class="input-group">
                <input
                    type="text"
                    bind:value={zipcode}
                    placeholder="Enter your zipcode"
                    maxlength="5"
                    on:keydown={(e) => e.key === 'Enter' && handleZipcodeSubmit()}
                />
                <button on:click={handleZipcodeSubmit}>Find Restaurants</button>
            </div>
            {#if errorMessage}
                <p class="error">{errorMessage}</p>
            {/if}
        </div>
    {:else}
        <div class="direction-indicator" style="opacity: {Math.abs(currentX) / 100}">
            {direction}
        </div>
        <div class="card-stack">
            {#if currentIndex < cards.length}
                {#each cards.slice(currentIndex) as card, i (card.id)}
                    <div
                        role="button"
                        tabindex="0"
                        class="card"
                        style="
                            background-color: {card.color};
                            transform: translate(
                                {i === 0 ? currentX : 0}px,
                                {-i * 4}px
                            ) rotate({i === 0 ? currentX * 0.1 : 0}deg);
                            z-index: {cards.length - i};
                            opacity: {i === 0 ? (Math.abs(currentX) > (windowWidth - 50) ? 0 : 1) : (1 - i * 0.2)};
                        "
                        on:mousedown={handleTouchStart}
                        on:mousemove={handleTouchMove}
                        on:mouseup={handleTouchEnd}
                        on:mouseleave={handleTouchEnd}
                        on:touchstart={handleTouchStart}
                        on:touchmove={handleTouchMove}
                        on:touchend={handleTouchEnd}
                    >
                        <h2>{card.title}</h2>
                    </div>
                {/each}
            {:else}
                <div class="no-more">No more!</div>
            {/if}
        </div>
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

    .card-stack {
        position: relative;
        width: 300px;
        height: 400px;
    }

    .card {
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 10px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        cursor: grab;
        transition: all 0.3s ease-out;
        user-select: none;
        touch-action: none;
        will-change: transform, opacity;
    }

    .card h2 {
        position: absolute;
        bottom: 20px;
        left: 20px;
        color: white;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        margin: 0;
    }

    .no-more {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 24px;
        color: #666;
    }

    .direction-indicator {
        position: fixed;
        top: 50px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 32px;
        font-weight: bold;
        color: #333;
        pointer-events: none;
    }

    .zipcode-container {
        text-align: center;
        padding: 20px;
    }

    .input-group {
        display: flex;
        gap: 10px;
        justify-content: center;
        margin: 20px 0;
    }

    input {
        padding: 10px;
        font-size: 16px;
        border: 2px solid #ddd;
        border-radius: 5px;
        width: 150px;
    }

    button {
        padding: 10px 20px;
        font-size: 16px;
        background-color: #4ECDC4;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    button:hover {
        background-color: #45B7D1;
    }

    .error {
        color: #FF6B6B;
        margin-top: 10px;
    }
</style>
