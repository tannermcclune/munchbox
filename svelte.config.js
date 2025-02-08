import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
  preprocess: vitePreprocess({
    runes: true // Enable runes mode
  }),
  kit: {
    adapter: adapter(), 
  }
};

export default config;