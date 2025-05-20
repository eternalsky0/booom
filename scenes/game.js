import { gameState, resetGameState, difficulties } from '../logic/state.js'
import { spawnMonster, spawnChest } from '../logic/spawner.js'
import { createPlayer } from '../entities/player.js'

export function createGameScene() {
    scene('game', () => {
        // Reset game state
        resetGameState()

        // Background
        add([
            sprite('background-0'),
            fixed(),
            scale(4)
        ])

        // Game UI
        const scoreText = add([
            text(`Score: ${gameState.score}`, { size: 32 }),
            pos(20, 20),
            fixed()
        ])

        const timeText = add([
            text(`Time: ${gameState.gameTime}`, { size: 32 }),
            pos(width() - 150, 20),
            fixed()
        ])

        // Game map
        const map = addLevel([
            '5                                                     5',
            '5                                                     5',
            '5   012                  012                  012     5',
            '5        012                  012                     5',
            '5                                   012               5',
            '5   012              012                              5',
            '5             012                                     5',
            ' 333333                      012           012        5',
            ' 444444                                               5',
            ' 444444   012                                         5',
            ' 33333333333333333333333333333333333333333333333333333 ',
            ' 44444444444444444444444444444444444444444444444444444 '
        ], {
            tileWidth: 16,
            tileHeight: 16,
            tiles: {
                0: () => [
                    sprite('platform-left'),
                    area(),
                    body({isStatic: true})
                ],
                1: () => [
                    sprite('platform-middle'),
                    area(),
                    body({isStatic: true})
                ],
                2: () => [
                    sprite('platform-right'),
                    area(),
                    body({isStatic: true})
                ],
                3: () => [
                    sprite('ground'),
                    area(),
                    body({isStatic: true})
                ],
                4: () => [
                    sprite('ground-deep'),
                    area(),
                    body({isStatic: true})
                ],
                5: () => [
                    rect(16, 16),
                    opacity(0),
                    area(),
                    body({isStatic: true})
                ]
            }
        })

        map.use(scale(4))

        // Create player
        const player = createPlayer()

        // Game timer
        let timeLeft = gameState.gameTime
        const gameTimer = setInterval(() => {
            timeLeft--
            timeText.text = `Time: ${timeLeft}`
            
            if (timeLeft <= 0) {
                clearInterval(gameTimer)
                go('results')
            }
        }, 1000)

        // Monster spawn timer
        const monsterSpawnInterval = setInterval(() => {
            spawnMonster()
        }, 1000 / difficulties[gameState.difficulty].monsterSpawnRate)

        // Chest spawn timer
        const chestSpawnInterval = setInterval(() => {
            spawnChest()
        }, 10000) // Every 10 seconds

        // Collision handling
        player.onCollide('monster', (monster) => {
            // Player takes damage
            gameState.score -= 10
            scoreText.text = `Score: ${gameState.score}`
            monster.destroy()
        })

        player.onCollide('chest', (chest) => {
            // Random reward
            const rewards = [
                { type: 'currency', amount: 10 },
                { type: 'currency', amount: 20 },
                { type: 'currency', amount: 50 },
                { type: 'ticket', amount: 1 }
            ]
            
            const reward = rewards[Math.floor(Math.random() * rewards.length)]
            gameState.collectedItems.push(reward)
            
            if (reward.type === 'currency') {
                gameState.score += reward.amount * difficulties[gameState.difficulty].rewardMultiplier
                scoreText.text = `Score: ${gameState.score}`
            }
            
            chest.destroy()
        })

        // Camera follow player
        onUpdate(() => {
            if (player.previousHeight) {
                player.heightDelta = player.previousHeight - player.pos.y
            }
            player.previousHeight = player.pos.y

            const cameraLeftBound = 550
            const cameraRightBound = 3000
            const cameraVerticalOffset = player.pos.y - 100

            if (cameraLeftBound > player.pos.x) {
                camPos(cameraLeftBound, cameraVerticalOffset)
            } else if (cameraRightBound < player.pos.x) {
                camPos(cameraRightBound, cameraVerticalOffset)
            } else {
                camPos(player.pos.x, cameraVerticalOffset)
            }
        })

        // Cleanup on scene exit
        onSceneLeave(() => {
            clearInterval(gameTimer)
            clearInterval(monsterSpawnInterval)
            clearInterval(chestSpawnInterval)
        })
    })
} 