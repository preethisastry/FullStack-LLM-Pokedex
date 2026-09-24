/**
 * PK's Pokedex Application Logic
 */

import POKEDEX_CONFIG, {
    API_BASE_URL,
    SPECIES_BASE_URL,
    TYPE_BASE_URL,
    MAX_POKEMON_ID,
    MIN_POKEMON_ID,
    TYPE_COLORS,
    TYPE_LIST,
    STATS
} from "./variables.js";

const CONFIG = POKEDEX_CONFIG;

// Icons for elemental types
const TYPE_ICONS = {
    water: '💧',
    fire: '🔥',
    grass: '🌿',
    electric: '⚡',
    flying: '🌪️',
    ice: '❄️',
    fighting: '🥊',
    poison: '☠️',
    ground: '🏜️',
    psychic: '🔮',
    bug: '🐛',
    rock: '🪨',
    ghost: '👻',
    dragon: '🐉',
    dark: '🌑',
    steel: '⚙️',
    fairy: '✨',
    normal: '⚪'
};

/*const TYPE_ALIASES = {
    air: 'flying'
};
*/
// Application State
const state = {
    currentPokemon: null,
    currentSpecies: null,
    currentEvolution: null,
    isShiny: false,
    currentAudio: null,
    activeFilteredType: null,
    typeCache: {}
};

//  DOM Elements
let elements = {};

function getDOMReferences() {
    elements = {
        // Search & Filter
        searchForm: document.querySelector('#searchForm'),
        searchInput: document.querySelector('#searchInput'),
        typeFilter: document.querySelector('#typeFilter'),
        quickChips: document.querySelector('.quick-chips'),

        // Nav Controls
        prevBtn: document.querySelector('#prevBtn'),
        nextBtn: document.querySelector('#nextBtn'),
        randomBtn: document.querySelector('#randomBtn'),

        // System Info
        systemId: document.querySelector('#systemId'),
        systemStatus: document.querySelector('#systemStatus'),

        // Main Display
        mainDisplay: document.querySelector('#mainDisplay'),

        // Type Filter Results Section
        typeResultsSection: document.querySelector('#typeResultsSection'),
        typeResultsTitle: document.querySelector('#typeResultsTitle'),
        typeBadgeIcon: document.querySelector('#typeBadgeIcon'),
        typeResultsCount: document.querySelector('#typeResultsCount'),
        closeTypeResultsBtn: document.querySelector('#closeTypeResultsBtn'),
        typeResultsList: document.querySelector('#typeResultsList'),

        // Status & Feedback Area
        statusArea: document.querySelector('#statusArea'),
        loadingIndicator: document.querySelector('#loadingIndicator'),
        errorMessage: document.querySelector('#errorMessage'),
        errorText: document.querySelector('#errorText'),
        welcomeState: document.querySelector('#welcomeState'),

        // Pokémon Detail Card
        pokemonCard: document.querySelector('#pokemonCard'),
        backToTypeResultsBtn: document.querySelector('#backToTypeResultsBtn'),
        backToTypeLabel: document.querySelector('#backToTypeLabel'),
        prevPokemonBtn: document.querySelector('#prevPokemonBtn'),
        nextPokemonBtn: document.querySelector('#nextPokemonBtn'),
        prevBtnLabel: document.querySelector('#prevBtnLabel'),
        nextBtnLabel: document.querySelector('#nextBtnLabel'),

        // Visual Column
        artworkContainer: document.querySelector('#artworkContainer'),
        artworkBackdrop: document.querySelector('#artworkBackdrop'),
        pokemonImage: document.querySelector('#pokemonImage'),
        shinyToggleBtn: document.querySelector('#shinyToggleBtn'),
        shinyBtnLabel: document.querySelector('#shinyBtnLabel'),
        playCryBtn: document.querySelector('#playCryBtn'),
        pokemonTypes: document.querySelector('#pokemonTypes'),

        // Data Column
        pokemonId: document.querySelector('#pokemonId'),
        pokemonName: document.querySelector('#pokemonName'),
        pokemonGenus: document.querySelector('#pokemonGenus'),
        pokemonDescription: document.querySelector('#pokemonDescription'),
        pokemonHeight: document.querySelector('#pokemonHeight'),
        pokemonWeight: document.querySelector('#pokemonWeight'),
        pokemonBaseExp: document.querySelector('#pokemonBaseExp'),
        pokemonAbilities: document.querySelector('#pokemonAbilities'),
        pokemonTotalStats: document.querySelector('#pokemonTotalStats'),
        pokemonStatsList: document.querySelector('#pokemonStatsList'),

        // Evolution
        evolutionChain: document.querySelector('#evolutionChain'),
        evolutionChainPlaceholder: document.querySelector('#evolutionChainPlaceholder'),

        // Tabs
        tabs: document.querySelectorAll('.tab-btn'),
        tabContents: document.querySelectorAll('.tab-content')
    };
}

// Formatting Utilities
function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatDisplayName(str) {
    if (!str) return '';
    return str
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function formatPokemonId(id) {
    if (!id && id !== 0) return '#0000';
    return `#${String(id).padStart(4, '0')}`;
}

function formatHeight(decimeters) {
    if (decimeters == null) return '---';
    const meters = decimeters / 10;
    const totalInches = Math.round(meters * 39.3701);
    const feet = Math.floor(totalInches / 12);
    const inches = totalInches % 12;
    return `${meters.toFixed(1)} m (${feet}'${String(inches).padStart(2, '0')}")`;
}

function formatWeight(hectograms) {
    if (hectograms == null) return '---';
    const kg = hectograms / 10;
    const lbs = (kg * 2.20462).toFixed(1);
    return `${kg.toFixed(1)} kg (${lbs} lbs)`;
}

function getStatColorClass(val) {
    if (val < 50) return 'stat-low';
    if (val < 85) return 'stat-medium';
    if (val < 120) return 'stat-high';
    return 'stat-great';
}

function getPokemonImageUrl(pokemon, isShiny = false) {
    if (!pokemon) return '';

    const officialArtwork = pokemon.sprites?.other?.['official-artwork'];
    if (isShiny && officialArtwork?.front_shiny) {
        return officialArtwork.front_shiny;
    }
    if (!isShiny && officialArtwork?.front_default) {
        return officialArtwork.front_default;
    }

    if (isShiny && pokemon.sprites?.front_shiny) {
        return pokemon.sprites.front_shiny;
    }
    if (pokemon.sprites?.front_default) {
        return pokemon.sprites.front_default;
    }

    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;
}

// UI State Helpers
function setLoading(isLoading) {
    if (elements.loadingIndicator) {
        elements.loadingIndicator.hidden = !isLoading;
    }
    if (isLoading) {
        if (elements.errorMessage) elements.errorMessage.hidden = true;
        if (elements.systemStatus) elements.systemStatus.textContent = 'Searching...';
    } else {
        if (elements.systemStatus) elements.systemStatus.textContent = 'Ready';
    }
}

function showError(message) {
    if (elements.errorMessage) {
        elements.errorMessage.hidden = false;
        if (elements.errorText) elements.errorText.textContent = message;
    }
    if (elements.pokemonCard) {
        elements.pokemonCard.hidden = true;
    }
    if (elements.welcomeState && !state.currentPokemon) {
        elements.welcomeState.hidden = false;
    }
    if (elements.systemStatus) {
        elements.systemStatus.textContent = 'Error';
    }
}

function hideError() {
    if (elements.errorMessage) {
        elements.errorMessage.hidden = true;
    }
}

function displayMessage(msg, type = 'info', duration = 2000) {
    if (elements.systemStatus) {
        const prevStatus = elements.systemStatus.textContent;
        elements.systemStatus.textContent = msg;
        setTimeout(() => {
            elements.systemStatus.textContent = prevStatus;
        }, duration);
    }
}

// Data Fetching
async function getPokemon(query) {
    if (!query) {
        throw new Error('Please enter a Pokémon name or Pokédex number.');
    }

    const cleanQuery = query.trim().toLowerCase();
    const numericId = parseInt(cleanQuery, 10);

    if (!isNaN(numericId) && /^\d+$/.test(cleanQuery)) {
        if (numericId < CONFIG.MIN_POKEMON_ID || numericId > CONFIG.MAX_POKEMON_ID) {
            throw new Error(`Pokémon #${numericId} not found. Please enter an ID between ${CONFIG.MIN_POKEMON_ID} and ${CONFIG.MAX_POKEMON_ID}.`);
        }
    }

    const response = await fetch(`${CONFIG.API_BASE_URL}/${encodeURIComponent(cleanQuery)}`);
    if (!response.ok) {
        if (response.status === 404) {
            throw new Error(`Pokémon "${query}" not found. Check the spelling or try searching by number (1 to ${CONFIG.MAX_POKEMON_ID}).`);
        }
        throw new Error(`PokéAPI request failed (Status: ${response.status}). Please try again.`);
    }

    return await response.json();
}

async function getPokemonSpecies(idOrName) {
    try {
        const response = await fetch(`${CONFIG.SPECIES_BASE_URL}/${encodeURIComponent(idOrName)}`);
        if (!response.ok) return null;
        return await response.json();
    } catch (err) {
        console.warn('Failed to load Pokémon species data:', err);
        return null;
    }
}

async function getEvolutionChain(evolutionChainUrl) {
    if (!evolutionChainUrl) return [];
    try {
        const response = await fetch(evolutionChainUrl);
        if (!response.ok) return [];
        const data = await response.json();

        const stages = [];
        function traverseChain(chainNode) {
            if (!chainNode || !chainNode.species) return;

            const speciesUrlParts = chainNode.species.url.split('/').filter(Boolean);
            const id = parseInt(speciesUrlParts[speciesUrlParts.length - 1], 10);

            stages.push({
                name: chainNode.species.name,
                id: id
            });

            if (chainNode.evolves_to && chainNode.evolves_to.length > 0) {
                // For simplicity, follow the primary branch or map first evolutionary path
                chainNode.evolves_to.forEach(nextBranch => {
                    traverseChain(nextBranch);
                });
            }
        }

        traverseChain(data.chain);
        return stages;
    } catch (err) {
        console.warn('Failed to fetch evolution chain:', err);
        return [];
    }
}

async function getPokemonByType(typeName) {
    if (!typeName) return [];
    const normalizedType = typeName.toLowerCase().trim();
    const resolvedType = TYPE_ALIASES[normalizedType] || normalizedType;

    if (resolvedType === 'all') {
        if (state.typeCache['all']) {
            return state.typeCache['all'];
        }
        const response = await fetch(`${CONFIG.API_BASE_URL}?limit=${CONFIG.MAX_POKEMON_ID}`);
        if (!response.ok) throw new Error('Could not load Pokémon list.');
        const data = await response.json();
        const list = data.results.map((entry, idx) => ({
            name: entry.name,
            id: idx + 1
        }));
        state.typeCache['all'] = list;
        return list;
    }

    if (state.typeCache[resolvedType]) {
        return state.typeCache[resolvedType];
    }

    const response = await fetch(`${CONFIG.TYPE_BASE_URL}/${encodeURIComponent(resolvedType)}`);
    if (!response.ok) {
        throw new Error(`Could not load Pokémon of type "${typeName}".`);
    }

    const data = await response.json();
    const filteredList = data.pokemon
        .map(entry => {
            const urlParts = entry.pokemon.url.split('/').filter(Boolean);
            const id = parseInt(urlParts[urlParts.length - 1], 10);
            return {
                name: entry.pokemon.name,
                id: id
            };
        })
        .filter(item => item.id >= CONFIG.MIN_POKEMON_ID && item.id <= CONFIG.MAX_POKEMON_ID)
        .sort((a, b) => a.id - b.id);

    state.typeCache[resolvedType] = filteredList;
    return filteredList;
}

// Rendering Logic
function updateTypeTheme(primaryTypeName) {
    if (!primaryTypeName) return;
    const typeKey = primaryTypeName.toLowerCase();
    const typeConfig = CONFIG.TYPE_COLORS[typeKey] || CONFIG.TYPE_COLORS.normal;
    const root = document.documentElement;

    root.style.setProperty('--type-color', typeConfig.bg);
    root.style.setProperty('--type-light-bg', typeConfig.light);
    root.style.setProperty('--type-glow', `${typeConfig.bg}40`);
}

function renderTypes(typesArray) {
    if (!elements.pokemonTypes) return;
    elements.pokemonTypes.innerHTML = '';
    if (!typesArray || !typesArray.length) return;

    typesArray.forEach(typeObj => {
        const typeName = typeObj.type.name.toLowerCase();
        const typeTheme = CONFIG.TYPE_COLORS[typeName] || { bg: '#777777', text: '#FFFFFF' };
        const icon = TYPE_ICONS[typeName] || '✨';

        const badge = document.createElement('span');
        badge.className = `type-badge type-${typeName}`;
        badge.style.backgroundColor = typeTheme.bg;
        badge.style.color = typeTheme.text;
        badge.innerHTML = `<span class="badge-icon">${icon}</span> ${formatDisplayName(typeName)}`;
        badge.title = `${formatDisplayName(typeName)} Type`;

        elements.pokemonTypes.appendChild(badge);
    });
}

function renderAbilities(abilitiesArray) {
    if (!elements.pokemonAbilities) return;
    elements.pokemonAbilities.innerHTML = '';

    if (!abilitiesArray || !abilitiesArray.length) {
        elements.pokemonAbilities.innerHTML = '<span class="metric-value">None</span>';
        return;
    }

    abilitiesArray.forEach(abilityObj => {
        const pill = document.createElement('div');
        pill.className = 'ability-pill';

        const nameSpan = document.createElement('span');
        nameSpan.className = 'ability-name';
        nameSpan.textContent = formatDisplayName(abilityObj.ability.name);
        pill.appendChild(nameSpan);

        if (abilityObj.is_hidden) {
            const hiddenTag = document.createElement('span');
            hiddenTag.className = 'hidden-tag';
            hiddenTag.textContent = 'Hidden';
            pill.appendChild(hiddenTag);
        }

        elements.pokemonAbilities.appendChild(pill);
    });
}

function renderStats(statsArray) {
    if (!elements.pokemonStatsList) return;
    elements.pokemonStatsList.innerHTML = '';
    if (!statsArray || !statsArray.length) return;

    const statMap = {};
    let totalStat = 0;

    statsArray.forEach(s => {
        statMap[s.stat.name] = s.base_stat;
        totalStat += s.base_stat;
    });

    if (elements.pokemonTotalStats) {
        elements.pokemonTotalStats.textContent = `Total: ${totalStat}`;
    }

    CONFIG.STATS.forEach(statDef => {
        const value = statMap[statDef.key] || 0;
        const percentage = Math.min(100, Math.round((value / statDef.max) * 100));
        const colorClass = getStatColorClass(value);

        const row = document.createElement('div');
        row.className = 'stat-row';

        const label = document.createElement('span');
        label.className = 'stat-label';
        label.textContent = statDef.abbr;
        label.title = statDef.label;

        const valSpan = document.createElement('span');
        valSpan.className = 'stat-value';
        valSpan.textContent = value;

        const track = document.createElement('div');
        track.className = 'stat-track';
        track.setAttribute('role', 'progressbar');
        track.setAttribute('aria-valuenow', value);
        track.setAttribute('aria-valuemin', 0);
        track.setAttribute('aria-valuemax', statDef.max);
        track.setAttribute('aria-label', `${statDef.label}: ${value}`);

        const fill = document.createElement('div');
        fill.className = `stat-fill ${colorClass}`;
        fill.style.width = '0%';

        track.appendChild(fill);
        row.appendChild(label);
        row.appendChild(valSpan);
        row.appendChild(track);

        elements.pokemonStatsList.appendChild(row);

        requestAnimationFrame(() => {
            setTimeout(() => {
                fill.style.width = `${percentage}%`;
            }, 60);
        });
    });
}

function renderEvolutionChain(evolutionStages) {
    if (!elements.evolutionChain) return;
    elements.evolutionChain.innerHTML = '';

    if (!evolutionStages || evolutionStages.length <= 1) {
        if (elements.evolutionChainPlaceholder) elements.evolutionChainPlaceholder.hidden = false;
        return;
    }

    if (elements.evolutionChainPlaceholder) elements.evolutionChainPlaceholder.hidden = true;

    // Remove duplicates if any
    const uniqueStages = [];
    const seenIds = new Set();
    evolutionStages.forEach(stage => {
        if (!seenIds.has(stage.id)) {
            seenIds.add(stage.id);
            uniqueStages.push(stage);
        }
    });

    uniqueStages.forEach((stage, idx) => {
        const isCurrent = state.currentPokemon && state.currentPokemon.id === stage.id;
        const node = document.createElement('button');
        node.type = 'button';
        node.className = `evolution-node ${isCurrent ? 'current' : ''}`;
        node.setAttribute('aria-label', `View ${formatDisplayName(stage.name)}`);

        const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${stage.id}.png`;

        node.innerHTML = `
            <div class="evolution-sprite-wrapper">
                <img src="${spriteUrl}" alt="${formatDisplayName(stage.name)}" class="evolution-sprite" loading="lazy"
                    onerror="this.src='./assets/pokeball.svg'">
            </div>
            <span class="evolution-id">${formatPokemonId(stage.id)}</span>
            <span class="evolution-name">${formatDisplayName(stage.name)}</span>
        `;

        node.addEventListener('click', () => {
            if (!isCurrent) {
                executeSearch(String(stage.id));
            }
        });

        elements.evolutionChain.appendChild(node);

        if (idx < uniqueStages.length - 1) {
            const arrow = document.createElement('span');
            arrow.className = 'evolution-arrow';
            arrow.innerHTML = '➔';
            arrow.setAttribute('aria-hidden', 'true');
            elements.evolutionChain.appendChild(arrow);
        }
    });
}

function updateNavigationButtons(currentId) {
    if (elements.prevBtn) {
        elements.prevBtn.disabled = currentId <= CONFIG.MIN_POKEMON_ID;
    }
    if (elements.nextBtn) {
        elements.nextBtn.disabled = currentId >= CONFIG.MAX_POKEMON_ID;
    }
    if (elements.prevPokemonBtn) {
        elements.prevPokemonBtn.disabled = currentId <= CONFIG.MIN_POKEMON_ID;
    }
    if (elements.nextPokemonBtn) {
        elements.nextPokemonBtn.disabled = currentId >= CONFIG.MAX_POKEMON_ID;
    }
}

function renderPokemon(pokemon, speciesData, evolutionStages) {
    // Hide loading, welcome, error, and type drawer
    if (elements.loadingIndicator) elements.loadingIndicator.hidden = true;
    if (elements.welcomeState) elements.welcomeState.hidden = true;
    if (elements.errorMessage) elements.errorMessage.hidden = true;
    if (elements.typeResultsSection) elements.typeResultsSection.hidden = true;
    if (elements.pokemonCard) elements.pokemonCard.hidden = false;

    // Show "Back to Type List" button if arriving from an active type filter
    if (elements.backToTypeResultsBtn) {
        if (state.activeFilteredType) {
            elements.backToTypeResultsBtn.hidden = false;
            if (elements.backToTypeLabel) {
                elements.backToTypeLabel.textContent = `${formatDisplayName(state.activeFilteredType)} List`;
            }
        } else {
            elements.backToTypeResultsBtn.hidden = true;
        }
    }

    // Identity
    if (elements.pokemonName) {
        elements.pokemonName.textContent = formatDisplayName(pokemon.name);
    }
    if (elements.pokemonId) {
        elements.pokemonId.textContent = formatPokemonId(pokemon.id);
    }
    if (elements.systemId) {
        elements.systemId.textContent = String(pokemon.id).padStart(3, '0');
    }

    // Genus & Flavor Text from Species
    let genusText = 'Pokémon';
    let flavorText = 'No Pokédex description available for this Pokémon.';

    if (speciesData) {
        const genusEntry = speciesData.genera?.find(g => g.language.name === 'en');
        if (genusEntry) genusText = genusEntry.genus;

        const flavorEntry = speciesData.flavor_text_entries?.find(f => f.language.name === 'en');
        if (flavorEntry) {
            flavorText = flavorEntry.flavor_text
                .replace(/[\n\f\r]/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
        }
    }

    if (elements.pokemonGenus) {
        elements.pokemonGenus.textContent = genusText;
    }
    if (elements.pokemonDescription) {
        elements.pokemonDescription.textContent = flavorText;
    }

    // Image & Shiny Reset
    state.isShiny = false;
    if (elements.shinyToggleBtn) {
        elements.shinyToggleBtn.classList.remove('active');
        elements.shinyToggleBtn.setAttribute('aria-pressed', 'false');
    }
    if (elements.shinyBtnLabel) {
        elements.shinyBtnLabel.textContent = 'Shiny';
    }
    if (elements.pokemonImage) {
        elements.pokemonImage.src = getPokemonImageUrl(pokemon, false);
        elements.pokemonImage.alt = `${formatDisplayName(pokemon.name)} Official Artwork`;
    }

    // Primary type styling
    const primaryType = pokemon.types?.[0]?.type?.name || 'normal';
    updateTypeTheme(primaryType);

    // Bio Metrics
    if (elements.pokemonHeight) {
        elements.pokemonHeight.textContent = formatHeight(pokemon.height);
    }
    if (elements.pokemonWeight) {
        elements.pokemonWeight.textContent = formatWeight(pokemon.weight);
    }
    if (elements.pokemonBaseExp) {
        elements.pokemonBaseExp.textContent = pokemon.base_experience != null ? pokemon.base_experience : '---';
    }

    // Types & Abilities
    renderTypes(pokemon.types);
    renderAbilities(pokemon.abilities);

    // Stats
    renderStats(pokemon.stats);

    // Evolution
    renderEvolutionChain(evolutionStages);

    // Prev / Next Navigation buttons
    updateNavigationButtons(pokemon.id);

    // Scroll card into view
    elements.pokemonCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderTypeResults(typeName, pokemonList) {
    const normalized = typeName.toLowerCase().trim();
    const resolvedType = TYPE_ALIASES[normalized] || normalized;
    const isAll = resolvedType === 'all';
    const icon = isAll ? '🌐' : (TYPE_ICONS[resolvedType] || '✨');
    const typeConfig = CONFIG.TYPE_COLORS[resolvedType] || { bg: '#2980EF', text: '#FFFFFF' };

    if (!isAll) {
        updateTypeTheme(resolvedType);
    }

    if (elements.typeBadgeIcon) elements.typeBadgeIcon.textContent = icon;
    if (elements.typeResultsTitle) {
        elements.typeResultsTitle.textContent = isAll ? 'All Pokémon' : `${formatDisplayName(typeName)} Pokémon`;
    }
    if (elements.typeResultsCount) {
        elements.typeResultsCount.textContent = `(${pokemonList.length} Pokémon)`;
    }
    if (!elements.typeResultsList) return;
    elements.typeResultsList.innerHTML = '';

    if (pokemonList.length === 0) {
        elements.typeResultsList.innerHTML = `<p class="error-hint">No Pokémon found for "${typeName}".</p>`;
        elements.typeResultsSection.hidden = false;
        return;
    }

    const fragment = document.createDocumentFragment();

    pokemonList.forEach(item => {
        const card = document.createElement('article');
        card.className = 'type-pokemon-card';
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', `View details for ${formatDisplayName(item.name)}`);

        const imgUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${item.id}.png`;
        const fallbackImgUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${item.id}.png`;

        const badgeLabel = isAll ? 'Pokémon' : formatDisplayName(resolvedType);
        const badgeColor = isAll ? '#1E293B' : typeConfig.bg;
        const badgeText = '#FFFFFF';

        card.innerHTML = `
            <div class="type-card-thumb-wrapper">
                <img 
                    src="${imgUrl}" 
                    alt="${formatDisplayName(item.name)}" 
                    class="type-card-thumb" 
                    loading="lazy"
                    onerror="this.src='${fallbackImgUrl}'; this.onerror=function(){this.src='./assets/pokeball.svg'}"
                >
            </div>
            <span class="type-card-number">${formatPokemonId(item.id)}</span>
            <h3 class="type-card-name">${formatDisplayName(item.name)}</h3>
            <span class="type-card-badge" style="background-color: ${badgeColor}; color: ${badgeText};">
                ${badgeLabel}
            </span>
        `;

        const selectThis = () => {
            if (elements.searchInput) elements.searchInput.value = item.name;
            executeSearch(item.name);
        };

        card.addEventListener('click', selectThis);
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectThis();
            }
        });

        fragment.appendChild(card);
    });

    elements.typeResultsList.appendChild(fragment);
    elements.typeResultsSection.hidden = false;
}

// Controller Actions
export async function executeSearch(query) {
    if (!query) return;

    hideError();
    setLoading(true);

    try {
        const pokemon = await getPokemon(query);
        state.currentPokemon = pokemon;

        // Concurrently fetch species and evolution chain
        const speciesData = await getPokemonSpecies(pokemon.id);
        state.currentSpecies = speciesData;

        let evolutionStages = [];
        if (speciesData?.evolution_chain?.url) {
            evolutionStages = await getEvolutionChain(speciesData.evolution_chain.url);
        }
        state.currentEvolution = evolutionStages;

        renderPokemon(pokemon, speciesData, evolutionStages);
    } catch (err) {
        console.error('Search error:', err);
        showError(err.message || 'An error occurred while fetching Pokémon data.');
    } finally {
        setLoading(false);
    }
}

export const handleSearch = executeSearch;

export async function handleTypeFilterChange(selectedType) {
    hideError();

    if (!selectedType) {
        state.activeFilteredType = null;
        if (elements.typeResultsSection) elements.typeResultsSection.hidden = true;
        if (!state.currentPokemon) {
            if (elements.welcomeState) elements.welcomeState.hidden = false;
        } else {
            if (elements.pokemonCard) elements.pokemonCard.hidden = false;
        }
        return;
    }

    state.activeFilteredType = selectedType;

    if (elements.welcomeState) elements.welcomeState.hidden = true;
    if (elements.pokemonCard) elements.pokemonCard.hidden = true;
    setLoading(true);

    try {
        const pokemonList = await getPokemonByType(selectedType);
        renderTypeResults(selectedType, pokemonList);

        if (elements.typeResultsSection) {
            elements.typeResultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    } catch (err) {
        console.error('Type filter error:', err);
        showError(err.message || `Failed to load Pokémon of type ${selectedType}.`);
    } finally {
        setLoading(false);
    }
}

function handlePrevPokemon() {
    if (state.currentPokemon) {
        const prevId = state.currentPokemon.id - 1;
        if (prevId < CONFIG.MIN_POKEMON_ID) {
            displayMessage('Reached the beginning of the Pokédex.', 'info', 1500);
            return;
        }
        executeSearch(String(prevId));
    }
}

function handleNextPokemon() {
    if (state.currentPokemon) {
        const nextId = state.currentPokemon.id + 1;
        if (nextId > CONFIG.MAX_POKEMON_ID) {
            displayMessage(`Reached the end of the Pokédex (${CONFIG.MAX_POKEMON_ID}).`, 'info', 1500);
            return;
        }
        executeSearch(String(nextId));
    }
}

function handleRandomPokemon() {
    const randomId = Math.floor(Math.random() * CONFIG.MAX_POKEMON_ID) + CONFIG.MIN_POKEMON_ID;
    executeSearch(String(randomId));
}

function toggleShinySprite() {
    if (!state.currentPokemon || !elements.pokemonImage) return;

    state.isShiny = !state.isShiny;
    elements.pokemonImage.src = getPokemonImageUrl(state.currentPokemon, state.isShiny);

    if (elements.shinyToggleBtn) {
        if (state.isShiny) {
            elements.shinyToggleBtn.classList.add('active');
            elements.shinyToggleBtn.setAttribute('aria-pressed', 'true');
            if (elements.shinyBtnLabel) elements.shinyBtnLabel.textContent = 'Normal';
        } else {
            elements.shinyToggleBtn.classList.remove('active');
            elements.shinyToggleBtn.setAttribute('aria-pressed', 'false');
            if (elements.shinyBtnLabel) elements.shinyBtnLabel.textContent = 'Shiny';
        }
    }

    elements.pokemonImage.classList.add('sparkle');
    setTimeout(() => {
        elements.pokemonImage.classList.remove('sparkle');
    }, 400);
}

function playCry() {
    if (!state.currentPokemon) return;

    const cryUrl = state.currentPokemon.cries?.latest || state.currentPokemon.cries?.legacy;
    if (!cryUrl) {
        displayMessage('No cry available.', 'info', 1500);
        return;
    }

    if (state.currentAudio) {
        state.currentAudio.pause();
        state.currentAudio.currentTime = 0;
    }

    state.currentAudio = new Audio(cryUrl);

    if (elements.playCryBtn) {
        elements.playCryBtn.classList.add('playing');
    }

    state.currentAudio.play().catch(err => {
        console.warn('Audio play failed:', err);
    });

    state.currentAudio.onended = () => {
        if (elements.playCryBtn) {
            elements.playCryBtn.classList.remove('playing');
        }
    };
}

function setupEventListeners() {
    // Search Form Submit
    if (elements.searchForm) {
        elements.searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = elements.searchInput?.value?.trim();
            if (query) {
                executeSearch(query);
            }
        });
    }

    // Type Filter Select
    if (elements.typeFilter) {
        elements.typeFilter.addEventListener('change', (e) => {
            handleTypeFilterChange(e.target.value);
        });
    }

    // Close Type Results Button
    if (elements.closeTypeResultsBtn) {
        elements.closeTypeResultsBtn.addEventListener('click', () => {
            if (elements.typeFilter) elements.typeFilter.value = '';
            handleTypeFilterChange('');
        });
    }

    // Back to Type Results Button in detail card
    if (elements.backToTypeResultsBtn) {
        elements.backToTypeResultsBtn.addEventListener('click', () => {
            if (state.activeFilteredType && elements.typeResultsSection) {
                elements.pokemonCard.hidden = true;
                elements.typeResultsSection.hidden = false;
                elements.typeResultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }

    // Quick Chips
    if (elements.quickChips) {
        elements.quickChips.addEventListener('click', (e) => {
            const chip = e.target.closest('.chip-btn');
            if (chip && chip.dataset.pokemon) {
                if (elements.searchInput) elements.searchInput.value = chip.dataset.pokemon;
                executeSearch(chip.dataset.pokemon);
            }
        });
    }

    // Nav Controls
    if (elements.prevBtn) elements.prevBtn.addEventListener('click', handlePrevPokemon);
    if (elements.nextBtn) elements.nextBtn.addEventListener('click', handleNextPokemon);
    if (elements.randomBtn) elements.randomBtn.addEventListener('click', handleRandomPokemon);

    if (elements.prevPokemonBtn) elements.prevPokemonBtn.addEventListener('click', handlePrevPokemon);
    if (elements.nextPokemonBtn) elements.nextPokemonBtn.addEventListener('click', handleNextPokemon);

    // Sprite Controls
    if (elements.shinyToggleBtn) elements.shinyToggleBtn.addEventListener('click', toggleShinySprite);
    if (elements.playCryBtn) elements.playCryBtn.addEventListener('click', playCry);

    // Tabs
    if (elements.tabs) {
        elements.tabs.forEach(tabBtn => {
            tabBtn.addEventListener('click', () => {
                const targetTab = tabBtn.dataset.tab;
                if (!targetTab) return;

                elements.tabs.forEach(btn => {
                    btn.classList.remove('active');
                    btn.setAttribute('aria-selected', 'false');
                });
                elements.tabContents.forEach(panel => {
                    panel.classList.remove('active');
                });

                tabBtn.classList.add('active');
                tabBtn.setAttribute('aria-selected', 'true');

                const panelId = `tab${capitalize(targetTab)}`;
                const activePanel = document.getElementById(panelId);
                if (activePanel) {
                    activePanel.classList.add('active');
                }
            });
        });
    }

    // Keyboard Shortcuts (ArrowLeft = Prev, ArrowRight = Next)
    window.addEventListener('keydown', (e) => {
        // Only if not focused in search input
        if (document.activeElement === elements.searchInput) return;

        if (e.key === 'ArrowLeft') {
            handlePrevPokemon();
        } else if (e.key === 'ArrowRight') {
            handleNextPokemon();
        }
    });
}

// App Initialization
export function init() {
    getDOMReferences();
    setupEventListeners();

    // Check URL parameters for ?pokemon=name_or_id
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('pokemon');
    if (initialQuery) {
        if (elements.searchInput) elements.searchInput.value = initialQuery;
        executeSearch(initialQuery);
    }
}

// Auto-boot on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
