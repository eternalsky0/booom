import { gameState } from '../logic/state.js'

export function createResultsScene() {
    scene('results', () => {
        // Background
        add([
            sprite('background-0'),
            fixed(),
            scale(4)
        ])

        // Title
        add([
            text('Game Results', { size: 64 }),
            pos(width() / 2, 100),
            anchor('center')
        ])

        // Score
        add([
            text(`Final Score: ${gameState.score}`, { size: 32 }),
            pos(width() / 2, 200),
            anchor('center')
        ])

        // Collected items
        add([
            text('Collected Items:', { size: 32 }),
            pos(width() / 2, 300),
            anchor('center')
        ])

        // Display collected items
        let yOffset = 350
        gameState.collectedItems.forEach((item, index) => {
            add([
                text(`${item.type}: ${item.amount}`, { size: 24 }),
                pos(width() / 2, yOffset + (index * 30)),
                anchor('center')
            ])
        })

        // Menu button background
        const btnBg = add([
            rect(200, 50),
            pos(width() / 2, height() - 100),
            anchor('center'),
            area(),
            color(0.2, 0.6, 0.8)
        ])
        // Menu button text
        add([
            text('Back to Menu', { size: 32 }),
            pos(width() / 2, height() - 100),
            anchor('center')
        ])
        btnBg.onClick(() => {
            go('menu')
        })
    })
} 