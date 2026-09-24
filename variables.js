/**
 * Pokedex App - UI scale variables & configuration
 */

function createTypeColor(bg, text, light) {
    return {
        bg,
        text,
        light,
        toString() {
            return this.bg;
        }
    };
}

export const POKEDEX_CONFIG = {
    API_BASE_URL: 'https://pokeapi.co/api/v2/pokemon',
    SPECIES_BASE_URL: 'https://pokeapi.co/api/v2/pokemon-species',
    TYPE_BASE_URL: 'https://pokeapi.co/api/v2/type',
    BASE_UNIT: 20, // Base unit in pixels
    CONTAINER_WIDTH: 1200, // Container width in pixels
    CONTAINER_HEIGHT: 1200, // Container height in pixels
    POKE_CARD_WIDTH: 300, // Card width in pixels
    POKE_CARD_HEIGHT: 350, // Card height in pixels
    POKEMON_DISPLAY_LIMIT: 1025,
    POKEMON_IMAGE_SIZE: 100,
    POKEMON_IMAGE_SIZE_LARGE: 150,
    MAX_POKEMON_ID: 1025,
    MIN_POKEMON_ID: 1,

    // Pokémon Type Colors (with contrast text and light tint)
    TYPE_COLORS: {
        normal: createTypeColor('#A8A778', '#FFFFFF', '#F4F4EC'),
        fire: createTypeColor('#EE8130', '#FFFFFF', '#FDF2E9'),
        water: createTypeColor('#6390F0', '#FFFFFF', '#EFF4FD'),
        electric: createTypeColor('#F7D02C', '#1E293B', '#FEFCE8'),
        grass: createTypeColor('#7AC74C', '#FFFFFF', '#F2F9ED'),
        ice: createTypeColor('#96D9D6', '#1E293B', '#F3FBFA'),
        fighting: createTypeColor('#C22E28', '#FFFFFF', '#FBEAE9'),
        poison: createTypeColor('#A33EA1', '#FFFFFF', '#F8ECF8'),
        ground: createTypeColor('#E2BF65', '#1E293B', '#FCF8EE'),
        flying: createTypeColor('#A98FF3', '#FFFFFF', '#F6F3FD'),
        psychic: createTypeColor('#F95587', '#FFFFFF', '#FEF0F4'),
        bug: createTypeColor('#A6B91A', '#FFFFFF', '#F7F9E8'),
        rock: createTypeColor('#B6A136', '#FFFFFF', '#F8F6EB'),
        ghost: createTypeColor('#735797', '#FFFFFF', '#F3EFF7'),
        dragon: createTypeColor('#6F35FC', '#FFFFFF', '#F3EEFF'),
        dark: createTypeColor('#705746', '#FFFFFF', '#F2EFEB'),
        steel: createTypeColor('#B7B7CE', '#1E293B', '#F7F7F9'),
        fairy: createTypeColor('#D685AD', '#FFFFFF', '#FCF3F7')
    },

    // Pokémon Types
    TYPE_LIST: [
        'normal',
        'fire',
        'water',
        'electric',
        'grass',
        'ice',
        'fighting',
        'poison',
        'ground',
        'flying',
        'psychic',
        'bug',
        'rock',
        'ghost',
        'dragon',
        'dark',
        'steel',
        'fairy'
    ],

    // Stat Definitions
    STATS: [
        { key: 'hp', label: 'HP', abbr: 'HP', max: 255 },
        { key: 'attack', label: 'Attack', abbr: 'ATK', max: 255 },
        { key: 'defense', label: 'Defense', abbr: 'DEF', max: 255 },
        { key: 'special-attack', label: 'Sp. Atk', abbr: 'SPA', max: 255 },
        { key: 'special-defense', label: 'Sp. Def', abbr: 'SPD', max: 255 },
        { key: 'speed', label: 'Speed', abbr: 'SPD', max: 255 }
    ],

    // Stat keys list
    POKEMON_STATS: [
        'hp',
        'attack',
        'defense',
        'special-attack',
        'special-defense',
        'speed'
    ],

    // Pokémon Categories
    POKEMON_CATEGORIES: [
        'seed',
        'lizard',
        'flame',
        'tiny turtle',
        'turtle',
        'worm',
        'cocoon',
        'butterfly',
        'mouse',
        'fairy',
        'dragon',
        'legendary'
    ]
};

// Named exports
export const {
    API_BASE_URL,
    SPECIES_BASE_URL,
    TYPE_BASE_URL,
    BASE_UNIT,
    CONTAINER_WIDTH,
    CONTAINER_HEIGHT,
    POKE_CARD_WIDTH,
    POKE_CARD_HEIGHT,
    POKEMON_DISPLAY_LIMIT,
    POKEMON_IMAGE_SIZE,
    POKEMON_IMAGE_SIZE_LARGE,
    MAX_POKEMON_ID,
    MIN_POKEMON_ID,
    TYPE_COLORS,
    TYPE_LIST,
    STATS,
    POKEMON_STATS,
    POKEMON_CATEGORIES
} = POKEDEX_CONFIG;

// Default export
export default POKEDEX_CONFIG;
