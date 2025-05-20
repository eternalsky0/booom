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
            isTakingHit: false,
            isDead: false,
            die() {
                if (player.isDead) return
                player.isDead = true
                player.isTakingHit = false
                // Отключаем физику и управление
                player.unuse('body')
                // Проигрываем анимацию смерти
                player.use(sprite('death-sprite'))
                player.play('death')
                // После анимации — пауза 2 секунды, затем переход к результатам
                wait(0.7, () => {
                    wait(2, () => {
                        go('results')
                    })
                })
            },
            takeDamage(amount) {
                if (gameState.isInvulnerable || player.isTakingHit || player.isDead) return
                
                gameState.currentHealth = Math.max(0, gameState.currentHealth - amount)
                if (gameState.currentHealth <= 0 && !player.isDead) {
                    gameState.currentHealth = 0
                    player.die()
                    return
                }
                gameState.isInvulnerable = true
                player.isTakingHit = true

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

                // Учитываем направление для анимации получения урона
                player.use(sprite('take-hit-sprite'))
                player.flipX = (player.direction === 'left')
                player.play('take-hit')

                // Эффект мигания
                let blinkCount = 0
                const maxBlinks = 5
                function blink() {
                    if (blinkCount >= maxBlinks || player.isDead) {
                        player.opacity = 1
                        return
                    }
                    player.opacity = (player.opacity === 1) ? 0.3 : 1
                    blinkCount++
                    wait(0.06, blink)
                }
                blink()

                // После анимации возвращаемся к предыдущему состоянию и снимаем флаг
                wait(0.3, () => {
                    if (!player.isDead) {
                        player.use(sprite(nextSprite))
                        player.play(nextAnim)
                        player.direction = wasDirection
                        player.flipX = (player.direction === 'left')
                        player.isTakingHit = false
                    }
                })
                
                // Remove invulnerability after cooldown
                wait(gameState.invulnerabilityTime / 1000, () => {
                    gameState.isInvulnerable = false
                })
            }
        }
    ])

    player.play('idle-anim')

    // Controls
    onKeyDown('right', () => {
        if (player.isDead) return
        if (player.curAnim() !== 'run-anim' && player.isGrounded()) {
            player.use(sprite('run-sprite'))
            player.play('run-anim')
        }
        if (player.direction !== 'right') player.direction = 'right'
        player.move(player.speed, 0)
    })

    onKeyRelease('right', () => {
        if (player.isDead) return
        player.use(sprite('idle-sprite'))
        player.play('idle-anim')
    })

    onKeyDown('left', () => {
        if (player.isDead) return
        if (player.curAnim() !== 'run-anim' && player.isGrounded()) {
            player.use(sprite('run-sprite'))
            player.play('run-anim')
        }
        if (player.direction !== 'left') player.direction = 'left'
        player.move(-player.speed, 0)
    })

    onKeyRelease('left', () => {
        if (player.isDead) return
        player.use(sprite('idle-sprite'))
        player.play('idle-anim')
    })

    onKeyPress('up', () => {
        if (player.isDead) return
        if (player.isGrounded()) {
            player.jump()
        }
    })

    // Animation updates
    onUpdate(() => {
        if (player.isTakingHit || player.isDead) return
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