import { gameState, difficulties } from '../logic/state.js'

export function createMenuScene() {
    scene('menu', () => {
        // Background
        add([
            sprite('background-0'),
            fixed(),
            scale(4)
        ])

        // Title
        add([
            text('Vertical Platformer', { size: 64 }),
            pos(width() / 2, 100),
            anchor('center')
        ])

        // Currency display
        add([
            text(`Bonus Currency: ${gameState.bonusCurrency}`, { size: 32 }),
            pos(width() / 2, 200),
            anchor('center')
        ])

        // Difficulty buttons
        const createDifficultyButton = (buttonText, y, difficulty) => {
            // Button background
            const btnBg = add([
                rect(240, 80),
                pos(width() / 2, y),
                anchor('center'),
                area(),
                color(0.2, 0.6, 0.8)
            ])
            // Button text
            add([
                text(buttonText, { size: 32 }),
                pos(width() / 2, y),
                anchor('center')
            ])
            btnBg.onClick(() => {
                if (gameState.bonusCurrency >= difficulties[difficulty].cost) {
                    gameState.difficulty = difficulty
                    gameState.bonusCurrency -= difficulties[difficulty].cost
                    go('game')
                }
            })
        }

        createDifficultyButton('Easy - 100', 300, 'easy')
        createDifficultyButton('Hard - 300', 400, 'hard')
    })
} 