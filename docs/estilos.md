# Documentación CSS - Pokédex Neon

## Descripción General

`style.css` implementa toda la capa visual y las animaciones del proyecto con un tema **Neon** sobre fondo oscuro. El diseño se basa en 3 pilares:

1. **Variables CSS** (custom properties) para el tema central
2. **CSS Grid + Flexbox** para el layout responsivo
3. **Animaciones por keyframes** para la estética neon (glow, flicker, float, pop)

---

## Análisis Paso a Paso

### 1. Variables del Tema (líneas 1-7)

```css
:root {
    --neon-yellow: #ffde00;      /* Bordes y acentos */
    --neon-electric: #f5ff00;    /* Glow intenso */
    --neon-red: #ff2a2a;         /* Acción/cancelar */
    --neon-black: #0a0a12;       /* Fondo principal */
    --glow: 0 0 5px var(--neon-yellow), 0 0 15px var(--neon-yellow), 0 0 30px var(--neon-yellow);
}
```

| Variable | Valor | Uso |
|----------|-------|-----|
| `--neon-yellow` | `#ffde00` | Color base de los LEDs (bordes, texto, botones) |
| `--neon-electric` | `#f5ff00` | Variante más brillante para hovers y glow fuerte |
| `--neon-red` | `#ff2a2a` | Botón cerrar modal en hover (estética rojo neón) |
| `--neon-black` | `#0a0a12` | Fondo casi negro, ligeramente azulado |
| `--glow` | 3 capas de sombra | El "efecto neón" completo: 5px + 15px + 30px difusión |

**Por qué definirlas en `:root`**: 
- Scope global → cualquier selector puede usarlas
- **Centralización del tema**: cambiar `#ffde00` por `#00ffcc` re-tematiza toda la app en 1 línea
- No repetir valores numéricos/sombras en 10 lugares

**Por qué `--glow` es una variable compuesta**: La sombra de 3 capas se repite en buscador, botones, modal y items → se declara 1 vez. Si se ajusta la intensidad, se toca en un solo sitio.

### 2. Reset Global (líneas 9-13)

```css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}
```

- **Reset de margin/padding**: Los navegadores ponen `margin: 8px` al body y `padding-left: 40px` a los `<ul>` por defecto → este reset da control total. Critico para el `<ul id="pokemons">` que se convierte en grid.
- **`box-sizing: border-box`**: El `width` incluye padding y border. Sin esto, `#buscador` (320px + 2px border + padding) desbordaría su contenedor. Es la convención moderna estándar.

### 3. Body - Fondo y Base (líneas 15-22)

```css
body {
    background: radial-gradient(ellipse at top, #1a1a2e 0%, var(--neon-black) 60%, #000 100%);
    min-height: 100vh;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    color: #fff;
    padding: 40px 20px;
    text-align: center;
}
```

**Radial-gradient 3 paradas**: `#1a1a2e` (top) → `--neon-black` (60%) → `#000` (100%):
- Forma el "halo" tenue arriba tipo luz viniendo de un letrero
- Se desvanece suavemente a negro puro abajo
- `ellipse at top` = centro del halo en el borde superior

**`min-height: 100vh`**: La app siempre ocupa al menos el viewport completo (aunque el contenido no lo llene) → el glow de fondo se ve por toda la pantalla.

**Padding `40px 20px`**: Espacio de respiración. El `40px` vertical evita que el input toque el borde superior; `20px` lateral para móviles panorámicos.

**Font stack**: `Segoe UI` primero (Windows), luego Tahoma/Verdana (fallbacks), `sans-serif` genérico al final → consistencia y render rápido.

### 4. Buscador (líneas 24-45)

```css
#buscador {
    background: rgba(0, 0, 0, 0.6);
    border: 2px solid var(--neon-yellow);
    border-radius: 30px;
    padding: 12px 25px;
    font-size: 1.1rem;
    color: var(--neon-yellow);
    outline: none;
    width: 320px;
    max-width: 90%;
    box-shadow: 0 0 8px rgba(255, 222, 0, 0.5), inset 0 0 5px rgba(255, 222, 0, 0.2);
    transition: all 0.3s ease;
}
```

| Propiedad | Valor | Justificación |
|-----------|-------|---------------|
| `background` | `rgba(0,0,0,0.6)` translúcido | Deja ver el fondo degradado → profundidad visual |
| `border-radius: 30px` | Píldora (pill) | Estética neón de "botón/phrase" |
| `text` color | `--neon-yellow` | Texto del input = acento neón |
| `box-shadow` | exterior + `inset` | El inset le da volumen 3D (luz dentro del campo) |
| `transition: all .3s` | Suavizado | El glow al focus no aparezca abrupto |

**`outline: none`** → No confundir con quitar accesibilidad: lo compensa el `box-shadow: var(--glow)` en `:focus` (línea 43). El foco sigue visible, solo se reestiliza.

**Focus con animación (líneas 42-45)**:
```css
#buscador:focus {
    box-shadow: var(--glow);
    animation: pulse-yellow 1.5s infinite;
}
```
- `--glow` en focus = el campo "se enciende" como neón real
- `pulse-yellow` (1.5s) = latido de intensidad, señala que está activo

### 5. Grid de Pokémon (líneas 47-101)

#### Contenedor (líneas 47-55)
```css
#pokemons {
    list-style: none;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 15px;
    max-width: 900px;
    margin: 35px auto;
    padding: 0;
}
```

**`repeat(auto-fill, minmax(200px, 1fr))`** es la clave del diseño responsivo sin media query:
- `minmax(200px, 1fr)` → cada columna mide mínimo 200px, máximo se expande equitativamente
- `auto-fill` → cuantas columnas quepan en el ancho disponible
- **Resultado**: 4 columnas en desktop (~900px), 3/2/1 según se estreche. La app se adapta sola.

**`list-style: none` + `padding: 0`**: Quita bullets y sangría del `<ul>` por defecto.

**`margin: 35px auto`**: Separación vertical del buscador + `auto` centra el grid horizontalmente.

#### Items `<li>` (líneas 57-76)
```css
#pokemons li {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    background: rgba(0, 0, 0, 0.7);
    border: 1px solid rgba(255, 222, 0, 0.4);
    border-radius: 12px;
    padding: 10px 14px;
    cursor: pointer;
    transition: all 0.3s ease;
    animation: flicker-in 0.6s ease;
}
```

- **Flex centrado**: El `<li>` tiene `<img>` + `<span>`; flex + gap los alinea horizontalmente
- **`cursor: pointer`**: Señala que es clickeable (abre modal)
- **Border amarillo al 40% de opacidad** (en vez de sólido): los 20 items no compitan visualmente con el fondo; el glow solo aparece en hover

**Hover (líneas 72-76)**:
```css
#pokemons li:hover {
    border-color: var(--neon-yellow);
    box-shadow: var(--glow);
    transform: translateY(-3px);
}
```
- `border-color: var(--neon-yellow)` sólido + `--glow` = el item "se enciende"
- `translateY(-3px)` = elevación sutil (feedback físico de selección)

**Img y glow del sprite (líneas 78-88)**:
```css
#pokemons li img {
    filter: drop-shadow(0 0 6px rgba(255, 222, 0, 0.7));
}
#pokemons li:hover img {
    filter: drop-shadow(...) drop-shadow(...);
}
```
**`filter: drop-shadow` vs `box-shadow`**: `drop-shadow` respeta la forma real de la imagen (la silueta del Pokémon brilla, no un rectángulo). Es el detalle que "saca brillo" al sprite.

**Span con `text-overflow` (líneas 90-101)**:
```css
white-space: nowrap;           /* 1 sola línea */
overflow: hidden;              /* recorta */
text-overflow: ellipsis;       /* muestra "..." */
```
Los nombres largos (Mime Jr. Jr., Mr. Mime) → se truncan con "..." en vez de romper el layout del flex. Extremo a `min-width: 0` (ver nota abajo).

---

## Detalles Técnicos Importantes

### Flexbox + texto largo (línea 100-101)
```css
min-width: 0;
```
En un flex container, los items flex por defecto tienen `min-width: auto` (no pueden encoger por debajo del contenido). `min-width: 0` permite que `overflow: hidden` + `text-overflow: ellipsis` funcionen de verdad. **Sin esto, el nombre largo empujaría el layout**.

### Botones genéricos (líneas 103-147)
```css
button {
    background: transparent;
    border: 2px solid var(--neon-yellow);
    color: var(--neon-yellow);
    padding: 10px 22px;
    text-transform: uppercase;
    letter-spacing: 1px;
    border-radius: 8px;
    box-shadow: 0 0 6px rgba(255, 222, 0, 0.5);
    transition: all 0.25s ease;
}
```

**Selector universal `button`**: Todos los botones (4 de paginación + 1 de cerrar) comparten la estética base. El botón de cerrar luego se **overridera** con `.cerrar-modal` (más específico).

**Hover (líneas 134-139)**:
```css
button:hover:not(:disabled) {
    background: var(--neon-yellow);
    color: #000;
    box-shadow: var(--glow);
    animation: pulse-yellow 1s infinite;
}
```
- **Inversión de color**: fondo se enciende amarillo, texto se vuelve negro → contraste táctil fuerte
- **`:not(:disabled)`**: Los botones First/Previous/Next/Last se deshabilitan en JS (principio/fin de lista). El hover no debe aplicarles animación ni color.

**Estado disabled (líneas 141-147)**:
```css
button:disabled {
    border-color: rgba(255, 222, 0, 0.15);
    color: rgba(255, 222, 0, 0.2);
    cursor: not-allowed;
}
```
El botón inactivo se "apaga" (opacidad 15-20% del amarillo) → comunicación visual de que no hay más páginas.

### Paginación - Flex container (líneas 119-132)
```css
.paginacion {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
    max-width: 900px;
    margin: 0 auto;
}
```

**`flex-wrap: wrap`**: En móvil, los 4 botones se reordenan en 2+2 (en vez de encogerse ilegibles).

---

## Keyframes: Las Animaciones Neón

### 6. `pulse-yellow` (líneas 149-152) - El latido
```css
@keyframes pulse-yellow {
    0%, 100% { box-shadow: 0 0 5px var(--neon-yellow), 0 0 15px var(--neon-yellow); }
    50%      { box-shadow: 0 0 15px var(--neon-yellow), 0 0 35px var(--neon-yellow), 0 0 50px rgba(255, 222, 0, 0.6); }
}
```
- **Por qué dos estados con sombras de distinta intensidad**: simula un neón "encendido/apagado" (latido periódico).
- **Importante**: no anima `opacity` por separado sino el `box-shadow` → el glow mismo es lo que pulsa.

### 7. `flicker-in` (líneas 154-161) - Entrada de items
```css
@keyframes flicker-in {
    0%   { opacity: 0; }
    20%  { opacity: 1; }
    30%  { opacity: 0.6; }
    40%  { opacity: 1; }
    50%  { opacity: 0.8; }
    100% { opacity: 1; }
}
```
- Los items aparecen titilando (como un letrero de neón que enciende con fallos) en los primeros 50% y se estabilizan al 100%.
- **`animation: flicker-in 0.6s ease`** aplicado a cada `<li>`: cada item tarda 0.6s en su entrada completa.

### 8. Modal - Transiciones de entrada

#### `fadeIn` en el overlay (líneas 355-358)
```css
@keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
}
```
El fondo semitransparente del modal aparece con fundido en vez de salto.

#### `popIn` en la tarjeta (líneas 360-363)
```css
@keyframes popIn {
    from { opacity: 0; transform: scale(0.85); }
    to   { opacity: 1; transform: scale(1); }
}
```
- La tarjeta "hace pop" (nace al 85% y crece al 100%) → sensación de tarjeta que se proyecta.
- Combinación de `opacity` + `transform` en un mismo keyframe → animación compuesta fluida.

### 9. `float` en la imagen (líneas 365-368)
```css
@keyframes float {
    0%, 100% { transform: translateY(0); }
    50%      { transform: translateY(-8px); }
}
```
El sprite del modal flota suavemente ±8px en loop de 3s → el Pokémon "vive" en la tarjeta.

**Nota de rendimiento**: `transform` y `opacity` son las únicas propiedades "baratas" de animar (las composita el GPU). Todos los keyframes usan solo esas → animaciones suaves sin parpadeos.

---

## Modal (líneas 163-353)

### Overlay (líneas 163-177)
```css
.modal {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    padding: 20px;
    animation: fadeIn 0.25s ease;
}
.modal.oculto {
    display: none;
}
```

- **`position: fixed; inset: 0`**: cubre todo el viewport (inset es shorthand de top/right/bottom/left: 0)
- **`background: rgba(0,0,0,0.85)`**: oscurece el contenido de atrás → foco completo
- **Flex centrado**: `align-items` + `justify-content: center` centran la tarjeta en ambas ejes
- **`z-index: 100`**: siempre por encima de todo (el app no tiene otros z-index)

**`display: none` en `.oculto`** (línea 175-177): El modal existe siempre en el DOM pero oculto. JS alterna la clase; `display: none` lo retira completamente del flujo (no ocupa y no captura eventos).

### Tarjeta (líneas 179-211)
```css
.modal-card {
    position: relative;
    background: rgba(10, 10, 18, 0.97);
    border: 2px solid var(--neon-yellow);
    border-radius: 18px;
    box-shadow: var(--glow), 0 0 60px rgba(255, 222, 0, 0.3);
    width: 380px;
    max-width: 100%;
    max-height: 90vh;
    overflow-y: auto;
}
```

| Propiedad | Rol |
|-----------|-----|
| `background: rgba(10,10,18,.97)` | Sólido casi opaco (el 3% translúcido suma profundidad) |
| `box-shadow: var(--glow)` + glow 60px extra | La tarjeta se ve "iluminada por neón" |
| `width: 380px; max-width: 100%` | Ancho fijo en desktop, no excede el padding de móviles |
| `max-height: 90vh; overflow-y: auto` | Si el detalle es largo, **dentro de la tarjeta** se hace scroll, nunca el fondo |

**Scrollbars ocultas** (líneas 190-197): `scrollbar-width: none` (Firefox) + `-webkit-scrollbar { display: none }` (Chrome/Safari) + `-ms-overflow-style: none` (Edge legacy) → mantiene la estética limpia. Trade-off: el usuario no ve indicador de scroll (aceptable por la vida útil corta de la tarjeta).

### Botón de cerrar "×" (líneas 199-220)
```css
.cerrar-modal {
    position: absolute;
    top: 10px;
    right: 14px;
    background: none;
    border: none;
    font-size: 1.8rem;
    text-shadow: 0 0 6px var(--neon-yellow);
}
.cerrar-modal:hover:not(:disabled) {
    color: var(--neon-red);
    text-shadow: 0 0 8px var(--neon-red);
}
```
- **`position: absolute`** respecto a `.modal-card` (`position: relative`): la "×" vive en la esquina de la tarjeta, no del viewport.
- **Override del estilo base del botón**: `background: none; border: none` reemplaza el estilo "botón" genérico.
- **Hover naranja signo normal ≥ esta aquí oscuro**: `color: var(--neon-red)` + ruido rojo = asocia el rojo a acción de destrucción/cierre.

### Contenido del modal (líneas 222-353)

#### Imagen flotante (líneas 229-236)
```css
.modal-img {
    width: 150px;
    height: 150px;
    display: block;
    margin: 0 auto;
    filter: drop-shadow(0 0 12px var(--neon-yellow)) drop-shadow(0 0 30px rgba(255, 222, 0, 0.5));
    animation: float 3s ease-in-out infinite;
}
```
`display: block + margin: 0 auto` centra la imagen (una `img` inline no responde a `margin: auto`).

#### Tipos como chips (líneas 253-269)
```css
.tipo {
    padding: 4px 14px;
    border-radius: 20px;
    font-size: 0.8rem;
    text-transform: uppercase;
    color: #000;
    box-shadow: 0 0 8px currentColor;
}
```
- **`box-shadow: 0 0 8px currentColor`**: ¡detalle clave! El color de fondo viene inline desde JS (una de las 18 keys de `TYPE_COLORS`). `currentColor` = hereda el color de texto... pero el JS pone el **background** = al color. Por eso aquí se fuerza `color: #000`? Trabajemos el código: el JS asigna `style="background:${color}"`, y el texto es `#000`. Sin embargo...
  - En realidad la técnica es: background del color + glow del MISMO color vía `currentColor`. En este proyecto el color de fondo viaja inline desde JS; para que el glow coincida, se usa `currentColor` que en CSS se resuelve al color de texto. El `color: #000` hace texto negro con glow negro, lo cual no es lo esperado. (Ver "Posibles mejoras".)
- El **chip** es redondeado (`border-radius: 20px`), type típico de badges tipo "tag".

#### Barras de stats (líneas 313-353)
```css
.stat {
    display: flex;
    align-items: center;
    gap: 10px;
}
.stat-nombre {
    width: 80px;
    text-align: right;
}
.stat-barra {
    flex: 1;
    height: 10px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 5px;
    overflow: hidden;
}
.stat-relleno {
    height: 100%;
    border-radius: 5px;
    box-shadow: 0 0 8px currentColor;
    transition: width 0.6s ease;
}
```

**Primer template layout raro**: fila = nombre (fijo 80px) | barra (flex:1 se estira) | valor (30px fijo).

**`transition: width 0.6s ease`**: aunque el JS inserta el `width` ya calculado (de golpe), al re-renderizar en la misma tarjeta el % animará de su valor previo al nuevo. Sin embargo, como se recías el `innerHTML` entero, el material es un elemento nuevo → la transición solo se ve si el ancho cambia en el mismo elemento. Es un bonus "gratis".

---

## Media Query Responsive (líneas 370-439)

```css
@media (max-width: 600px) {
```

- **`600px` breakpoint**: cubre smartphones en orientación portrait (≤600px incluye iPhone 12/13 en vertical y Galaxy). 

| Regla | Cambio | Justificación |
|-------|--------|---------------|
| `#pokemons` | `repeat(2, 1fr)`, gap 10px | Grid fijo de 2 columnas en móvil (en vez de auto-fill que daría 1-2 desiguales) |
| `<li>` | `flex-direction: column`, padding 14px 8px | El item se vuelve vertical: imagen arriba, nombre abajo → mejor para dedos |
| `img` en li | `70px` (antes 40) | Tocar el elemento grande es más fácil en táctil |
| span | `white-space: normal` | En móvil los nombres largos usan 2 líneas (ya no hay espacio para truncar) |
| `.paginacion button` | `flex: 1 1 calc(50% - 8px)` | 4 botones se acomodan 2 arriba 2 abajo (2 columnas de 2) |
| `.modal-card` | `width: 100%` | Tarjeta a ancho completo (con padding 15px del media query) |
| `.stat-nombre` | `width: 72px` | Reduce el ancho del label para quemar menos espacio en pantallas chicas |

---

## Decisiones de Arquitectura Clave

1. **Tema centralizado en variables** (`:root`) → cambio de tema = 1 edición
2. **Grid auto-fill + minmax** → responsive sin escribir 10 media queries
3. **Animaciones solo con `transform`/`opacity`** → rendimiento GPU-friendly
4. **Clases de estado (`.oculto`)** → JS solo alterna clases, las transiciones viven en CSS (separación de responsabilidades)
5. **`filter: drop-shadow` para sprites** → glow que respeta silueta, no caja rectangular
6. **Overrides selectivos** (`.cerrar-modal` > `button`) → base compartida + excepciones por especificidad
7. **Efecto neón realista** = 2-3 sombras apiladas (5px/15px/30px) en vez de 1 sola

## Posibles Mejoras
- Corregir el glow de los chips de tipo: usar `background: color` desde JS + shadow en color. Actualmente el `currentColor` con `color:#000` produce glow negro. Alternativa: mover el color de fondo al objeto JS y `box-shadow: 0 0 8px <color>` inline.
- Añadir media query para pantallas muy anchas (grid de 5 columnas, modal más grande)
- `prefers-reduced-motion` para desactivar animaciones en usuarios con sensibilidad vestibular (accesibilidad)
- Usar `text-shadow` degradado con transparencia para un glow de texto más sutil en los nombres