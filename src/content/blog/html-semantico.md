---
title: "HTML semántico"
date: 2026-01-31
category: "Software"
description: "HTML semántico usa etiquetas según el significado del contenido. header, nav, main, article, section, aside y footer describen estructura y rol. Combinado con CSS classless, permite sitios completos sin clases."
---

HTML semántico usa etiquetas según el significado del contenido, no solo su apariencia.
header, nav, main, article, section, aside y footer describen estructura y rol.

### > Beneficios

Accesibilidad: lectores de pantalla y herramientas entienden mejor la página. SEO: los
motores interpretan mejor el contenido. Mantenimiento: el código se lee como un documento.

### > Estructura típica

```
<header>...</header>
<nav>...</nav>
<main>
  <article>...</article>
  <aside>...</aside>
</main>
<footer>...</footer>
```

### > Classless CSS

Combinar HTML semántico con CSS que selecciona por etiquetas permite sitios completos
sin clases: un solo estilo global y documentos limpios. Este blog es un ejemplo.

Menos marcaje, más significado. Ideal para blogs, documentación y páginas contenido-centric.
