# Documentación JavaScript - Pokédex Neon

## Descripción General

`app.js` contiene toda la lógica de la aplicación. Consume la API pública de Pokémon ([PokeAPI](https://pokeapi.co)) sin dependencias externas, usando soluciones modernas de JavaScript.

---

## Análisis Paso a Paso

### 1. Constantes y Configuración

```js
const URL_API = 'https://pokeapi.co/api/v2';
const LIMIT = 20;
```

| Constante | Valor | Por qué |
|-----------|-------|---------|
| `URL_API` | Base oficial de PokeAPI | Centraliza la URL para no repetirla; fácil de cambiar si migra la API |
| `LIMIT = 20` | Pokémon por página | Balance rendimiento/UX: 20 items caben bien en el grid de 900px |

### 2. Captura de Elementos del DOM

```js
const buscador = document.getElementById('buscador');
const pokemons = document.getElementById('pokemons');
const first = document.getElementById('first');
const previous = document.getElementById('previous');
const next = document.getElementById('next');
const last = document.getElementById('last');
const modal = document.getElementById('modal');
const modalContenido = document.getElementById('modal-contenido');
const cerrarModalBtn = document.getElementById('cerrar-modal');
```

- **Referencias cacheadas al inicio**: Cada `getElementById` se ejecuta 1 sola vez al cargar, en lugar de buscar en el DOM cada vez. Mejora rendimiento en interacciones frecuentes (paginación, filtrado).
- **Por qué `const`**: Ninguna referencia cambia jamás; inmutable = menos bugs.

### 3. Mapas de Configuración (Datos de Presentación)

#### Colores por tipo (líneas 15-21)
```js
const TYPE_COLORS = {
    normal: '#A8A77A', fire: '#EE8130', water: '#6390F0',
    ...
};
```

**Por qué un `Map`/objeto, no condicionales**: 
- Traduce el nombre del tipo a su color oficial de Pokémon **en O(1)**
- Evita un `switch` de 18 casos (más verboso y frágil)
- Centraliza los colores: editar un color toca solo 1 línea

**Por qué estas claves en minúsculas**: PokeAPI devuelve `t.type.name` en minúsculas (`fire`, `water`...) - coincidencia exacta con las claves del objeto.

#### Colores por estadística (líneas 23-26)
```js
const STAT_COLORS = {
    hp: '#FF5555', attack: '#F5AC78', defense: '#7EC36A',
    'special-attack': '#9DB7F5', 'special-defense': '#A7DB8D', speed: '#FA92B2'
};
```
- Paleta basada en los colores de stats de los videojuegos (HP rojo, Speed rosa...)
- Nota: las claves con guion van entre comillas (no son identificadores válidos)

### 4. Estado Global de la Aplicación

```js
let todosLosPokemons = [];
let totalPokemons = 0;
```

| Variable | Rol | Por qué `let` (mutable) |
|----------|-----|------------------------|
| `todosLosPokemons` | Caché de 10000+ Pokémon para búsqueda inmediata | Se reasigna en `cargarTodosLosPokemons()` |
| `totalPokemons` | Número total (para paginación "Last") | Se reasigna en cada `getAllPokemon()` |

**Por qué cachear los 10000**: El filtrado por nombre en cada tecla requiere comparar contra toda la lista. Cachear una vez (solo 1 fetch) lo vuelve instantáneo; sin caché haríamos 1 fetch por pulsación de tecla.

---

## Funciones Principales

### 5. `mostrarCargando()` - Feedback de UI (líneas 31-33)

```js
function mostrarCargando() {
    pokemons.innerHTML = '<li>Cargando...</li>';
}
```

**Por qué**: Principio UX de percepción de respuesta. Sin esto, al cambiar página el grid queda vacío y parece que la app colgó.

### 6. `getAllPokemon(url)` - Paginación (líneas 34-52)

```js
async function getAllPokemon(url) {
    mostrarCargando();
    const response = await fetch(url);
    const data = await response.json();

    totalPokemons = data.count;

    mostrarPokemons(data.results);

    first.disabled = data.previous === null;
    previous.disabled = data.previous === null;
    next.disabled = data.next === null;
    last.disabled = data.next === null;

    first.onclick = () => getAllPokemon(`${URL_API}/pokemon?limit=${LIMIT}`);
    previous.onclick = () => getAllPokemon(data.previous);
    next.onclick = () => getAllPokemon(data.next);
    last.onclick = () => getAllPokemon(`${URL_API}/pokemon?limit=${LIMIT}&offset=${Math.floor((totalPokemons - 1) / LIMIT) * LIMIT}`);
}
```

**`async/await` por qué**: La API PokeAPI es asíncrona por red; `async/await` lee como código síncrono (sin anidar `.then()`).

**Lógica de habilitar/deshabilitar**:
- `data.previous === null` → estamos en la página 1 → deshabilitar First/Previous
- `data.next === null` → estamos en la última → deshabilitar Next/Last
- La API devuelve `previous`/`next` como URLs completas listas para usar

**Detalle del botón "Last"** (línea 51):
```js
Math.floor((totalPokemons - 1) / LIMIT) * LIMIT
```
Calcula el offset de la última página:
- Ej: `totalPokemons = 1302`, `LIMIT = 20`
- `floor(1301 / 20) = floor(65.05) = 65`
- `65 * 20 = 1300` → última página empieza en el Pokémon 1301
- Se resta 1 a `totalPokemons` porque el índice empieza en 0

**Por qué re-asignar `onclick` en cada llamada (y no asignarlos una vez)**: Cada página trae URLs nuevas (`data.previous`, `data.next`); el closure captura los datos correctos de esa llamada.

### 7. `mostrarPokemons(lista)` - Renderizado del Grid (líneas 54-71)

```js
function mostrarPokemons(lista) {
    pokemons.innerHTML = '';

    lista.forEach(pokemon => {
        const id = pokemon.url.split('/').filter(Boolean).pop();

        const li = document.createElement('li');

        li.innerHTML = `
            <img width="25" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png">
            <span>${pokemon.name}</span>
        `;

        li.onclick = () => mostrarModal(pokemon.url);

        pokemons.appendChild(li);
    });
}
```

**Extracción del ID** (línea 58):
```js
pokemon.url.split('/').filter(Boolean).pop()
```
El endpoint `/pokemon?limit=10000` devuelve URLs como `https://pokeapi.co/api/v2/pokemon/25/`:
1. `split('/')` → `['https:', '', '...', 'pokemon', '25', '']`
2. `filter(Boolean)` → elimina strings vacíos (array final)
3. `.pop()` → toma el último elemento → `'25'`

**Por qué extraer el ID de la URL**: La lista paginada de `/pokemon` **no incluye** el ID en el objeto Pokémon; solo tiene `name` y `url`. El ID es necesario para construir la URL del sprite oficial.

**Construcción de `<li>` con template literal (líneas 62-65)**:
- Backticks + `${}` → interpolación limpia y legible
- `img` con `width="25"` = fallback antes de que el CSS (40px) lo escale
- Sprites de **official-artwork** de alta resolución (calidad visual, alineado al estilo "Neon")

**Uso de `innerHTML` vs `createElement`**: 
- `innerHTML` para el contenido del `li` → más corto y legible para estructura fija
- `createElement`/`appendChild` para el `li` en sí → cada click necesita su propio closure en `li.onclick`

**`li.onclick` por closure (línea 67)**: Captura `pokemon.url` de esa iteración específica → cada item abre SU detalle. (`let` en `forEach` garantiza binding por iteración).

### 8. `mostrarModal(url)` - Detalle del Pokémon (líneas 73-111)

```js
async function mostrarModal(url) {
    modal.classList.remove('oculto');
    modalContenido.innerHTML = '<p class="modal-cargando">Cargando...</p>';

    const response = await fetch(url);
    const p = await response.json();
    ...
}
```

**Manipulación de clases, no estilos inline** (línea 74): Quitar `.oculto` dispara la animación CSS `fadeIn`. Alternativa `display = 'block'` saltaría la transición.

**Placeholder de carga (línea 75)**: Si el modal ya tenía contenido (de un clic anterior), se limpia y muestra "Cargando..." hasta que regrese el fetch.

**Renderizado del detalle**:

| Bloque | Código | Lógica/Datos |
|--------|--------|--------------|
| Imagen | `p.sprites.other['official-artwork'].front_default` | Sprites de alta calidad específicos para la vista detalle |
| Header | `${p.name} #${String(p.id).padStart(3, '0')}` | `padStart` → formato `#025` (cero-izquierda, estilo videojuego) |
| Tipos | `p.types.map(...)` con `TYPE_COLORS` | Cada tipo = chip de color del mapa global |
| Medidas | `p.height / 10`, `p.weight / 10` | PokeAPI entrega en **decímetros** y **hectogramos** → dividir por 10 = metros y kg |
| Habilidades | `p.abilities.map(a => a.ability.name).join(', ')` | Lista plana separada por comas |
| Stats | `map` con barra de progreso | Ver detalle abajo |

**Stats - cálculo de la barra (líneas 85-98)**:
```js
const pct = Math.min((s.base_stat / 255) * 100, 100);
```
- `255` es el máximo histórico de base_stat (para normalizar proporciones reales)
- `Math.min(..., 100)` limita a 100% (no romper el layout si algún stat lo excede)
- `STAT_COLORS[s.stat.name] || '#B7B7CE'` → gris por defecto si falta la key
- `nombre.replace('-', ' ')` → `special-attack` → `special attack`

### 9. Cierre del Modal (líneas 113-123)

```js
function cerrarModal() {
    modal.classList.add('oculto');
}

cerrarModalBtn.onclick = cerrarModal;
modal.onclick = e => {
    if (e.target === modal) cerrarModal();
};
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') cerrarModal();
});
```

**Tres formas de cerrar**, cada una con su justificación:
1. **Botón "×"** → accesible, descubrible
2. **Click fuera de la tarjeta** → `e.target === modal` verifica que el clic fue en el overlay, no en `.modal-card` (prevenir cierre accidental al interactuar con el contenido)
3. **Tecla Escape** → estándar de accesibilidad desktop

### 10. `cargarTodosLosPokemons()` - Caché de búsqueda (líneas 125-130)

```js
async function cargarTodosLosPokemons() {
    const response = await fetch(URL_API + '/pokemon?limit=10000');
    const data = await response.json();
    todosLosPokemons = data.results;
}
```

- `limit=10000` excede el total real (1302) → PokeAPI devuelve todos
- Se ejecuta **1 vez al cargar la página** (línea 159), independiente de la paginación
- Provee el dataset para el filtrado instantáneo por nombre

### 11. `buscarPokemon()` - Filtrado en vivo (líneas 132-155)

```js
function buscarPokemon() {
    const nombre = buscador.value.toLowerCase().trim();

    if (nombre === '') {
        getAllPokemon(URL_API + '/pokemon');
        return;
    }
    ...
    const resultados = todosLosPokemons.filter(pokemon =>
        pokemon.name.includes(nombre)
    );
    ...
}
```

**Normalización (línea 133)**: `.toLowerCase().trim()` = 
- `trim()` elimina espacios accidentales → "pika " es útil
- `toLowerCase()` hace el match case-insensitive → "PIKA" funciona aunque PokeAPI solo tiene "pikachu"

**Vacío de input (líneas 135-138)**: Restaura la paginación normal (resetea a página 1). Por qué: al borrar el texto, el usuario espera ver la lista paginada de nuevo.

**Deshabilitar paginación durante búsqueda (líneas 140-143)**: Evita mezclar estados (lista filtrada + offset paginado sería incoherente).

**Filtrado por `name.includes(nombre)`**: Búsqueda por **substring** → "char" encuentra "charizard" y "charmander". Es substring, no prefijo exacto.

**¿Por qué no un endpoint tipo `?name=`?** PokeAPI no ofrece filtro por nombre en `/pokemon` → se resuelve en cliente con el caché.

---

## Eventos y Arranque (líneas 157-160)

```js
buscador.addEventListener('input', buscarPokemon);

cargarTodosLosPokemons();
getAllPokemon(URL_API + '/pokemon');
```

- **`'input'`, no `'change'`**: Se dispara por cada tecla (búsqueda en vivo). `'change'` solo al desenfocar.
- **Arranque doble**: La app carga la lista paginada (par) y el caché completo (impar) al mismo tiempo. Independientes = ambas funciones `fetch`en paralelo.

---

## Decisiones de Arquitectura Clave

1. **Vanilla JS, cero dependencias** → sin build, sin node_modules, sin coste de framework → ideal para app pequeña
2. **DOM mínimo** (HTML solo define 7 elementos) → todo el render sale de JS → single source of truth
3. **Caché de búsqueda + paginación por fetch** → el equilibrio entre carga inicial ligera (20 items) y búsqueda instantánea (caché 1302)
4. **Referencias cacheadas** → máximo rendimiento en interacciones de alta frecuencia
5. **Configuración como datos** (`TYPE_COLORS`, `STAT_COLORS`) → en lugar de condicionales, separa datos de lógica
6. **Clases para estados de UI** (`oculto`) → las transiciones/anims viven en CSS, no en JS

## Posibles Mejoras
- Centralizar el fetch en un módulo/servicio (`async fetchPokemon(url)`) para reutilizar y manejar errores con `try/catch`
- Añadir `defer` y convertir a módulo ES (`type="module"`)
- Debounce el filtrado de búsqueda con `setTimeout` para suavizar a >1 tecla/seg
- Manejo de errores global (`fetch` fallido → mostrar mensaje, no romper silenciosamente)