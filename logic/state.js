// Game state management
export const gameState = {
    bonusCurrency: 1000, // Starting bonus currency
    currentLevel: null,
    difficulty: null,
    gameTime: 60,
    score: 0,
    collectedItems: []
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