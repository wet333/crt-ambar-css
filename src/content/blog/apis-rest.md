---
title: "APIs REST"
date: 2026-01-25
category: "Software"
description: "REST define cómo exponer recursos por HTTP. URLs como recursos, verbos HTTP como acciones."
---

REST (Representational State Transfer) define cómo exponer recursos por HTTP.
URLs representan recursos; los verbos HTTP (GET, POST, PUT, PATCH, DELETE) definen la acción.

### > Principios básicos

Recursos con identificadores únicos (URIs). Estado sin almacenar en servidor: cada petición
lleva la información necesaria. Respuestas cacheables y interfaz uniforme.

### > Códigos de estado

200 OK, 201 Created, 204 No Content, 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Server Error.
Usar los códigos correctos ayuda a clientes y herramientas a reaccionar bien.

### > Buenas prácticas

No usar verbos en la URL: /usuarios en lugar de /obtener-usuarios. Usar plural para recursos.
Versionar la API (ej. /api/v1/recurso) para evolucionar sin romper clientes.

JSON como formato estándar; documentar con OpenAPI (Swagger) para consumidores y equipos.
