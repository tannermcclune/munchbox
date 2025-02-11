<script lang="ts">
    import { fade } from 'svelte/transition';
    
    export let zipcode: string;
    export let isLoading: boolean;
    export let errorMessage: string;
    export let onSubmit: () => void;

    // Add input validation
    function handleInput(event: Event) {
        const input = event.target as HTMLInputElement;
        // Remove any non-digit characters
        input.value = input.value.replace(/\D/g, '');
        // Update the zipcode binding
        zipcode = input.value;
    }
</script>

<div class="zipcode-container" class:fade-out={isLoading}>
    <h1>Find Restaurants Near You</h1>
    <div class="input-group">
        <input
            type="text"
            bind:value={zipcode}
            placeholder="Enter your zipcode"
            maxlength="5"
            pattern="[0-9]*"
            inputmode="numeric"
            disabled={isLoading}
            on:input={handleInput}
            on:keydown={(e) => e.key === 'Enter' && onSubmit()}
        />
        <button on:click={onSubmit} disabled={isLoading}>
            Find Restaurants
        </button>
    </div>
    {#if errorMessage}
        <p class="error">{errorMessage}</p>
    {/if}
</div>

<style>
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

    .fade-out {
        opacity: 0;
        transition: opacity 0.3s ease-out;
    }
</style> 