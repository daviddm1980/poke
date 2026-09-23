# Pokédex Neon

Aplicación web de Pokédex con estética **neón** construida con HTML, CSS y JavaScript puro (vanilla). Consume la [PokeAPI](https://pokeapi.co) para listar, buscar y mostrar el detalle de los Pokémon.

![HTML5](https://img.shields.io/badge/HTML5-%23E34F26?style=flat&logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-%231572B6?style=flat&logo=css3&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-%23F7DF1E?style=flat&logo=javascript&logoColor=black)

---

## Características

- **Listado paginado** de Pokémon (20 por página) con navegación `First / Previous / Next / Last`.
- **Búsqueda en vivo** por nombre (substring, sin distinguir mayúsculas) sobre una caché completa de los 1302 Pokémon.
- **Modal de detalle** con sprite oficial, tipos (con su color), altura, peso, habilidades y barras de stats.
- **Diseño responsive** con CSS Grid + Flexbox, adaptado a móvil (≤600px).
- **Estética neón** con glow, animaciones de parpadeo, entrada y flotación.

---

## Estructura del Proyecto

```
poke/
├── public/                  # Frontend (deployable)
│   ├── index.html           # Estructura de la app (buscador, grid, paginación, modal)
│   ├── style.css            # Tema neón, layout y animaciones
│   ├── app.js               # Lógica: PokeAPI, paginación, búsqueda, modal
│   └── docs/                # Documentación técnica por archivo
│       ├── html.md          # Paso a paso del HTML
│       ├── estilos.md       # Paso a paso del CSS
│       └── javascript.md    # Paso a paso del JavaScript
└── README.md                # Este archivo
```

---

## Tecnologías y Stack

| Capa | Tecnología | Rol |
|------|------------|-----|
| Frontend | HTML5 + CSS3 + Vanilla JS | Sin dependencias ni build |
| API | [PokeAPI](https://pokeapi.co) (`/api/v2`) | Datos de Pokémon |
| Sprites | [PokeAPI sprites](https://raw.githubusercontent.com/PokeAPI/sprites/master) | Imágenes `official-artwork` |

**¿Por qué vanilla JS?** La app no necesita framework: un único flujo de datos, sin estado complejo ni routing. Cero dependencias = carga instantánea y mantenimiento mínimo.

---

## Cómo Ejecutar

No requiere instalación ni build. Solo abrir el archivo:

```bash
# Opción 1: abrir directamente
public/index.html

# Opción 2: servidor local (recomendado para evitar restricciones CORS del navegador)
cd public
python -m http.server 8000
# luego abrir http://localhost:8000
```

> **Nota**: Aunque `app.js` usa `fetch` a PokeAPI (que permite CORS), abrir en local con un servidor HTTP es la forma más fiable de probar.

---

## Uso

1. **Navegar** — Usa los botones de paginación en la parte inferior de la lista.
2. **Buscar** — Escribe en el campo de búsqueda; el listado se filtra al instante. Vacía el campo para volver a la paginación.
3. **Ver detalle** — Haz clic en cualquier Pokémon para abrir su tarjeta con stats.
4. **Cerrar modal** — Botón `×`, clic fuera de la tarjeta o tecla `Escape`.

---

## API (PokeAPI)

| Endpoint | Uso en la app |
|----------|---------------|
| `GET /pokemon?limit=20&offset=n` | Página de la lista paginada |
| `GET /pokemon?limit=10000` | Caché completa para búsqueda en vivo |
| `GET /pokemon/{id-or-name}` | Detalle del Pokémon (modal) |

---

## Documentación Detallada

La documentación técnica paso a paso (el *por qué* de cada decisión) se encuentra en `public/docs/`:

- [**html.md**](public/docs/html.md) — Estructura del documento, cada etiqueta y el flujo de renderizado.
- [**estilos.md**](public/docs/estilos.md) — Tema neón, grid responsivo, animaciones y detalles CSS.
- [**javascript.md**](public/docs/javascript.md) — Lógica completa: paginación, modal, búsqueda y decisiones de arquitectura.

---

## Roadmap / Mejoras Propuestas

- Separar el acceso a la API en un módulo/servicio con manejo de errores (`try/catch`).
- `debounce` en la búsqueda para suavizar la escritura rápida.
- Soporte `prefers-reduced-motion` (accesibilidad).
- Corrección del glow de los chips de tipo (`currentColor`).
- Grid de 5 columnas en pantallas muy anchas.

---

## Licencia

Proyecto personal con fines educativos. Pokémon y la API son marcas/datos de sus respectivos dueños.
