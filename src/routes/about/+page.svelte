<script>
    import { goto } from '$app/navigation';
</script>

<h1>About Page</h1>
<p>This page is dynamically loaded from the server.</p>

<button onclick={() => goto('/')}>Go to Home</button>