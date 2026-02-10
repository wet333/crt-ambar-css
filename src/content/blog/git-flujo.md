---
title: "Git y flujo de trabajo"
date: 2026-01-20
category: "Software"
description: "Ramas, commits atómicos y un flujo reproducible. Conventional commits y buenas prácticas."
---

Git es el sistema de control de versiones distribuido más usado. Dominarlo implica
entender ramas, fusiones y un flujo de trabajo reproducible.

### > Ramas y commits atómicos

Cada commit debe representar un cambio lógico único. Ramas cortas: feature, fix, refactor.
Main o master como referencia estable; trabajo diario en ramas secundarias.

### > Flujo recomendado

Crear rama desde main → hacer commits pequeños y descriptivos → push → pull request o merge.
Nunca hacer commit directamente a main en proyectos compartidos sin revisión.

### > Comandos esenciales

```bash
git checkout -b feature/nueva-funcion
git add .
git commit -m "feat: descripción clara del cambio"
git push origin feature/nueva-funcion
```

Convenciones como conventional commits (feat, fix, docs) mejoran el historial y la automatización.
