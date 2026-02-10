# CRT Ambar — Astro Blog

Blog con estética retro de terminal CRT en tonos ámbar, construido con **Astro.js**. El estilo se aplica con CSS classless sobre etiquetas HTML semánticas. Incluye efectos visuales tipo CRT: scanlines, flicker y ruido.

![Screenshot del sitio](Screenshot%202026-02-10%20202513.png)

## Estructura

```
src/
├── components/       # Nav, Header, Footer, PostCard
├── content/
│   └── blog/         # Posts en Markdown con frontmatter
├── layouts/          # BaseLayout, PageLayout, BlogPostLayout
├── pages/            # index, about, blog/[...slug]
├── scripts/          # Efectos CRT
├── styles/           # CSS classless terminal
└── content.config.ts # Schema de content collections
```

## Agregar un post

Crear un archivo `.md` en `src/content/blog/` con este frontmatter:

```markdown
---
title: "TÍTULO DEL POST"
date: 2026-02-09
category: "CATEGORÍA"
description: "Descripción corta del post."
---

Contenido del post en Markdown...
```

## Comandos

```bash
npm run dev       # Servidor de desarrollo
npm run build     # Build de producción
npm run preview   # Preview del build
```
