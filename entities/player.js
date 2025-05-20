import { gameState } from '../logic/state.js'

// Player class
export function createPlayer() {
    const player = add([
        sprite('idle-sprite'),
        scale(2),
        area({shape: new Rect(vec2(0), 32, 32), offset: vec2(0,32)}),
        anchor('center'),
        body(),
        pos(900, 10),
        {
            speed: 500,
            previousHeight: null,
            heightDelta: 0,
            direction: 'right',
            takeDamage(amount) {
                if (gameState.isInvulnerable) return
                
                gameState.currentHealth = Math.max(0, gameState.currentHealth - amount)
                gameState.isInvulnerable = true

                // Эффект мигания
                let blinkCount = 0
                const maxBlinks = 5
                function blink() {
                    if (blinkCount >= maxBlinks) {
                        player.opacity = 1
                        return
                    }
                    player.opacity = (player.opacity === 1) ? 0.3 : 1
                    blinkCount++
                    wait(0.08, blink)
                }
                blink()

                // Сохраняем текущий спрайт и анимацию
                const wasGrounded = player.isGrounded()
                const wasDirection = player.direction
                let nextAnim = 'idle-anim'
                let nextSprite = 'idle-sprite'
                if (!wasGrounded && player.heightDelta > 0) {
                    nextAnim = 'jump-anim'
                    nextSprite = 'jump-sprite'
                } else if (!wasGrounded && player.heightDelta < 0) {
                    nextAnim = 'fall-anim'
                    nextSprite = 'fall-sprite'
                } else if (wasGrounded && (isKeyDown('left') || isKeyDown('right'))) {
                    nextAnim = 'run-anim'
                    nextSprite = 'run-sprite'
                }

                // Воспроизводим анимацию получения урона
                player.use(sprite('take-hit-sprite'))
                player.play('take-hit')

                // После анимации возвращаемся к предыдущему состоянию
                wait(0.3, () => {
                    player.use(sprite(nextSprite))
                    player.play(nextAnim)
                    player.direction = wasDirection
                })
                
                // Remove invulnerability after cooldown
                wait(gameState.invulnerabilityTime / 1000, () => {
                    gameState.isInvulnerable = false
                    player.opacity = 1
                })
                
                // Check if player is dead
                if (gameState.currentHealth <= 0) {
                    go('results')
                }
            }
        }
    ])

    player.play('idle-anim')

    // Controls
    onKeyDown('right', () => {
        if (player.curAnim() !== 'run-anim' && player.isGrounded()) {
            player.use(sprite('run-sprite'))
            player.play('run-anim')
        }
        if (player.direction !== 'right') player.direction = 'right'
        player.move(player.speed, 0)
    })

    onKeyRelease('right', () => {
        player.use(sprite('idle-sprite'))
        player.play('idle-anim')
    })

    onKeyDown('left', () => {
        if (player.curAnim() !== 'run-anim' && player.isGrounded()) {
            player.use(sprite('run-sprite'))
            player.play('run-anim')
        }
        if (player.direction !== 'left') player.direction = 'left'
        player.move(-player.speed, 0)
    })

    onKeyRelease('left', () => {
        player.use(sprite('idle-sprite'))
        player.play('idle-anim')
    })

    onKeyPress('up', () => {
        if (player.isGrounded()) {
            player.jump()
        }
    })

    // Animation updates
    onUpdate(() => {
        if (player.curAnim() !== 'run-anim' && player.isGrounded()) {
            player.use(sprite('idle-sprite'))
            player.play('idle-anim')
        }

        if (player.curAnim() !== 'jump-anim' && !player.isGrounded() && player.heightDelta > 0) {
            player.use(sprite('jump-sprite'))
            player.play('jump-anim')
        }

        if (player.curAnim() !== 'fall-anim' && !player.isGrounded() && player.heightDelta < 0) {
            player.use(sprite('fall-sprite'))
            player.play('fall-anim')
        }

        if (player.direction === 'left') {
            player.flipX = true
        } else {
            player.flipX = false
        }
    })

    return player
} 