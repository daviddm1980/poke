# Documentación HTML - Pokédex Neon

## Estructura General

El archivo `index.html` es el punto de entrada de la aplicación. Contiene la estructura semántica mínima necesaria para la Pokédex, delegando toda la lógica a `app.js` y los estilos a `style.css`.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pokédex Neon</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <!-- Contenido principal -->
    <script src="app.js"></script>
</body>
</html>
```

---

## Análisis Paso a Paso

### 1. Declaración DOCTYPE y html
```html
<!DOCTYPE html>
<html lang="en">
```
- **Por qué**: `DOCTYPE html` activa el modo estándares en todos los navegadores modernos. `lang="en"` mejora accesibilidad (lectores de pantalla) y SEO.

### 2. Head - Metadatos esenciales
```html
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pokédex Neon</title>
    <link rel="stylesheet" href="style.css">
</head>
```

| Etiqueta | Propósito | Justificación |
|----------|-----------|---------------|
| `charset="UTF-8"` | Codificación de caracteres | Soporte completo de Unicode (emojis, acentos, caracteres especiales Pokémon) |
| `viewport` | Responsive design | Sin esto, móviles renderizan a 980px y escalan, rompiendo el layout grid |
| `title` | Título de pestaña/SEO | Identifica la app en pestañas, historial, favoritos |
| `link rel="stylesheet"` | Carga CSS externo | Separación de responsabilidades; cacheable por navegador |

### 3. Body - Estructura de componentes

#### 3.1 Buscador (Input principal)
```html
<input type="text" id="buscador" placeholder="Nombre Pokemón...">
```
- **`id="buscador"`**: Selector único para JS (`document.getElementById`)
- **`placeholder`**: UX - guía al usuario sin necesidad de label visible (diseño minimalista)
- **Tipo `text`**: Permite cualquier carácter; el filtrado se hace en JS lado cliente

#### 3.2 Lista de Pokémon (Contenedor grid)
```html
<div>
    <ul id="pokemons"></ul>
</div>
```
- **`<ul>` + `<li>` generados por JS**: Semántica de lista; cada Pokémon es un item
- **`id="pokemons"`**: Target para `pokemons.innerHTML = ''` y `appendChild`
- **Wrapper `<div>`**: Permite centrado y max-width via CSS (`max-width: 900px; margin: 35px auto`)

#### 3.3 Paginación (4 botones)
```html
<div class="paginacion">
    <button id="first">First</button>
    <button id="previous">Previous</button>
    <button id="next">Next</button>
    <button id="last">Last</button>
</div>
```
- **Clase `.paginacion`**: Flexbox container (ver CSS) - distribuye botones responsive
- **IDs únicos**: Cada botón tiene handler `onclick` asignado en `getAllPokemon()` (líneas 48-51 app.js)
- **Por qué 4 botones**: UX completa - ir al inicio/fin salta páginas; prev/next navega secuencial

#### 3.4 Modal (Detalle Pokémon)
```html
<div id="modal" class="modal oculto">
    <div class="modal-card">
        <button id="cerrar-modal" class="cerrar-modal">&times;</button>
        <div id="modal-contenido"></div>
    </div>
</div>
```

| Elemento | Rol | Por qué esta estructura |
|----------|-----|------------------------|
| `#modal` | Overlay full-screen | `position: fixed; inset: 0` cubre viewport; `z-index: 100` encima de todo |
| `.oculto` | Estado inicial oculto | `display: none` via CSS; JS alterna clase (no inline styles) |
| `.modal-card` | Tarjeta centrada | Contenedor visual con padding, border neon, shadow glow |
| `#cerrar-modal` | Botón cerrar | `&times;` (×) carácter Unicode; handler en JS línea 117 |
| `#modal-contenido` | Contenido dinámico | JS inyecta HTML completo via `innerHTML` (línea 100) |

#### 3.5 Script al final
```html
<script src="app.js"></script>
```
- **Posición**: Antes de `</body>` - DOM listo cuando se ejecuta
- **Por qué no `defer`/`async`**: Archivo único, sin dependencias; ejecución inmediata tras parseo HTML

---

## Decisiones de Diseño HTML

1. **Sin framework**: Vanilla HTML/JS/CSS - cero dependencias, carga instantánea, fácil mantenimiento
2. **IDs semánticos**: `buscador`, `pokemons`, `modal`, `modal-contenido` - claros, únicos, escalables
3. **Clases para estados**: `.oculto` en modal - permite transiciones CSS (fadeIn/popIn)
4. **Accesibilidad básica**:
   - `lang="en"` en html
   - Placeholder descriptivo
   - Botones con texto legible (no solo iconos)
   - Modal trap focus implícito (click fuera cierra)
5. **Responsive nativo**: Viewport meta + CSS Grid/Flexbox + media queries

---

## Flujo de Renderizado

```
1. Navegador parsea HTML
2. Descarga style.css (bloqueante render)
3. Ejecuta app.js
   → cargarTodosLosPokemons() → fetch 10k Pokémon → todosLosPokemons[]
   → getAllPokemon() → fetch página 1 (20) → mostrarPokemons() → crea <li> en #pokemons
4. Usuario interactúa:
   - Input → buscarPokemon() → filtra todosLosPokemons[] → mostrarPokemons()
   - Click <li> → mostrarModal(url) → fetch detalle → inyecta #modal-contenido
   - Paginación → getAllPokemon(url) → repite paso 3
```