// Game state management
export const gameState = {
    bonusCurrency: 1000, // Starting bonus currency
    currentLevel: null,
    difficulty: 'normal',
    gameTime: 60,
    score: 0,
    collectedItems: [],
    health: 100, // Maximum health
    currentHealth: 100, // Current health
    isInvulnerable: false, // For damage cooldown
    invulnerabilityTime: 1000, // 1 second of invulnerability after taking damage
}

// Difficulty settings
export const difficulties = {
    easy: {
        cost: 100,
        monsterSpeed: 100,
        monsterSpawnRate: 2,
        rewardMultiplier: 1
    },
    hard: {
        cost: 300,
        monsterSpeed: 200,
        monsterSpawnRate: 3,
        rewardMultiplier: 2
    }
}

// Reset game state for new game
export function resetGameState() {
    gameState.score = 0
    gameState.collectedItems = []
    gameState.gameTime = 60
} 