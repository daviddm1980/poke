const URL_API = 'https://pokeapi.co/api/v2';

const buscador = document.getElementById('buscador');
const pokemons = document.getElementById('pokemons');
const first = document.getElementById('first');
const previous = document.getElementById('previous');
const next = document.getElementById('next');
const last = document.getElementById('last');
const modal = document.getElementById('modal');
const modalContenido = document.getElementById('modal-contenido');
const cerrarModalBtn = document.getElementById('cerrar-modal');

const LIMIT = 20;

const TYPE_COLORS = {
    normal: '#A8A77A', fire: '#EE8130', water: '#6390F0', electric: '#F7D02C',
    grass: '#7AC74C', ice: '#96D9D6', fighting: '#C22E28', poison: '#A33EA1',
    ground: '#E2BF65', flying: '#A98FF3', psychic: '#F95587', bug: '#A6B91A',
    rock: '#B6A136', ghost: '#735797', dragon: '#6F35FC', dark: '#705746',
    steel: '#B7B7CE', fairy: '#D685AD'
};

const STAT_COLORS = {
    hp: '#FF5555', attack: '#F5AC78', defense: '#7EC36A',
    'special-attack': '#9DB7F5', 'special-defense': '#A7DB8D', speed: '#FA92B2'
};

let todosLosPokemons = [];
let totalPokemons = 0;

function mostrarCargando() {
    pokemons.innerHTML = '<li>Cargando...</li>';
}
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

async function mostrarModal(url) {
    modal.classList.remove('oculto');
    modalContenido.innerHTML = '<p class="modal-cargando">Cargando...</p>';

    const response = await fetch(url);
    const p = await response.json();

    const img = p.sprites.other['official-artwork'].front_default;
    const tipos = p.types.map(t =>
        `<span class="tipo" style="background:${TYPE_COLORS[t.type.name]}">${t.type.name}</span>`
    ).join('');
    const habilidades = p.abilities.map(a => a.ability.name).join(', ');
    const stats = p.stats.map(s => {
        const nombre = STAT_COLORS[s.stat.name] ? s.stat.name : 'stat';
        const color = STAT_COLORS[s.stat.name] || '#B7B7CE';
        const pct = Math.min((s.base_stat / 255) * 100, 100);
        return `
            <div class="stat">
                <span class="stat-nombre">${nombre.replace('-', ' ')}</span>
                <div class="stat-barra">
                    <div class="stat-relleno" style="width:${pct}%;background:${color}"></div>
                </div>
                <span class="stat-valor">${s.base_stat}</span>
            </div>
        `;
    }).join('');

    modalContenido.innerHTML = `
        <img class="modal-img" src="${img}" alt="${p.name}">
        <h2 class="modal-nombre">${p.name} <span class="modal-id">#${String(p.id).padStart(3, '0')}</span></h2>
        <div class="modal-tipos">${tipos}</div>
        <div class="modal-datos">
            <div><span>Altura</span><strong>${p.height / 10} m</strong></div>
            <div><span>Peso</span><strong>${p.weight / 10} kg</strong></div>
        </div>
        <p class="modal-habilidades"><span>Habilidades</span> ${habilidades}</p>
        <div class="modal-stats">${stats}</div>
    `;
}

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

async function cargarTodosLosPokemons() {
    const response = await fetch(URL_API + '/pokemon?limit=10000');
    const data = await response.json();

    todosLosPokemons = data.results;
}

function buscarPokemon() {
    const nombre = buscador.value.toLowerCase().trim();

    if (nombre === '') {
        getAllPokemon(URL_API + '/pokemon');
        return;
    }

    first.disabled = true;
    previous.disabled = true;
    next.disabled = true;
    last.disabled = true;

    const resultados = todosLosPokemons.filter(pokemon =>
        pokemon.name.includes(nombre)
    );

    if (resultados.length === 0) {
        pokemons.innerHTML = '<li>Pokémon no encontrado</li>';
        return;
    }

    mostrarPokemons(resultados);
}

buscador.addEventListener('input', buscarPokemon);

cargarTodosLosPokemons();
getAllPokemon(URL_API + '/pokemon');