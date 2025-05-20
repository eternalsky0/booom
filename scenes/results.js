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
            { origin: 'center' }
        ])

        // Score
        add([
            text(`Final Score: ${gameState.score}`, { size: 32 }),
            pos(width() / 2, 200),
            { origin: 'center' }
        ])

        // Collected items
        add([
            text('Collected Items:', { size: 32 }),
            pos(width() / 2, 300),
            { origin: 'center' }
        ])

        // Display collected items
        let yOffset = 350
        gameState.collectedItems.forEach((item, index) => {
            add([
                text(`${item.type}: ${item.amount}`, { size: 24 }),
                pos(width() / 2, yOffset + (index * 30)),
                { origin: 'center' }
            ])
        })

        // Menu button
        add([
            rect(200, 50),
            pos(width() / 2, height() - 100),
            { origin: 'center' },
            area(),
            text('Back to Menu', { size: 32 }),
            color(0.2, 0.6, 0.8)
        ]).onClick(() => {
            go('menu')
        })
    })
} 