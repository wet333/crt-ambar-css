import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    markdown: {
        syntaxHighlight: false,
    },
    vite: {
        plugins: [tailwindcss()],
    },
});
