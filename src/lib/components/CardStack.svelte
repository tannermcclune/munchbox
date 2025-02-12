<script lang="ts">
    import type { Card } from '$lib/types';
    
    export let cards: Card[];
    export let currentIndex: number;
    export let currentX: number;
    export let windowWidth: number;
    export let direction: string;
    export let fadeIn: boolean;
    export let handleTouchStart: (e: MouseEvent | TouchEvent) => void;
    export let handleTouchMove: (e: MouseEvent | TouchEvent) => void;
    export let handleTouchEnd: () => void;
</script>

<div class="direction-indicator" style="opacity: {Math.abs(currentX) / 100}">
    {direction}
</div>

<div class="card-stack" class:fade-in={fadeIn}>
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
                {#if card.imageUrl}
                    <img src={card.imageUrl} alt={card.title} class="card-image" />
                {/if}
                <h2>{card.title}</h2>
            </div>
        {/each}
    {:else}
        <div class="no-more">No more!</div>
    {/if}
</div>

<style>
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

    .fade-in {
        opacity: 0;
        animation: fadeIn 0.5s ease-out forwards;
    }

    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }

    .card-image {
        width: 100%;
        height: 200px;
        object-fit: cover;
        border-top-left-radius: 10px;
        border-top-right-radius: 10px;
    }
</style> 