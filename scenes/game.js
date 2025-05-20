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

        // Сердечки здоровья
        let heartSprites = []
        function drawHearts() {
            heartSprites.forEach(h => h.destroy())
            heartSprites = []
            let hp = gameState.currentHealth
            for (let i = 0; i < gameState.heartCount; i++) {
                let x = width() - 28 - i * 28
                let full = hp >= gameState.heartValue
                let half = !full && hp > 0
                let opacity = (hp > 0) ? (full ? 1 : 0.6) : 0.2
                let spriteObj = add([
                    sprite('heart'),
                    pos(x, 20),
                    scale(0.18),
                    { opacity: opacity },
                    fixed()
                ])
                heartSprites.push(spriteObj)
                hp -= gameState.heartValue
                if (hp < 0) hp = 0 // чтобы не было отрицательных значений
            }
        }
        drawHearts()

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

        // Массив всех монстров
        const monsters = []
        const MAX_MONSTERS = 6

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
            if (monsters.length < MAX_MONSTERS) {
                spawnMonster(player, monsters)
            }
        }, 1000 / difficulties[gameState.difficulty].monsterSpawnRate)

        // Chest spawn timer
        const chestSpawnInterval = setInterval(() => {
            spawnChest()
        }, 10000) // Every 10 seconds

        // Остановка игры при смерти
        function stopGame() {
            gameState.isGameOver = true
            clearInterval(gameTimer)
            clearInterval(monsterSpawnInterval)
            clearInterval(chestSpawnInterval)
            // Остановить всех монстров (если есть onUpdate у монстров, они должны проверять gameState.isGameOver)
            monsters.forEach(m => { if (m.paused !== undefined) m.paused = true })
        }

        // Update health display
        onUpdate(() => {
            if (gameState.isGameOver) return
            drawHearts()
        })

        // Collision handling
        player.onCollide('monster', (monster) => {
            if (gameState.isGameOver) return
            player.takeDamage(20)
            gameState.score -= 10
            scoreText.text = `Score: ${gameState.score}`
            monster.destroy()
            if (player.isDead) {
                stopGame()
                drawHearts()
            }
        })

        player.onCollide('monsterProjectile', (proj) => {
            if (gameState.isGameOver) return
            player.takeDamage(15)
            gameState.score -= 15
            scoreText.text = `Score: ${gameState.score}`
            proj.destroy()
            if (player.isDead) {
                stopGame()
                drawHearts()
            }
        })

        player.onCollide('chest', (chest) => {
            if (gameState.isGameOver) return
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
            if (gameState.isGameOver) return
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
            gameState.isGameOver = false
            // Удаляем всех монстров
            monsters.forEach(m => m.destroy())
            monsters.length = 0
            heartSprites.forEach(h => h.destroy())
        })
    })
} 