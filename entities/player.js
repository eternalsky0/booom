import { gameState } from '../logic/state.js'

function blinkPlayer(player, times = 4, interval = 0.1) {
    let count = 0;
    function blink() {
        player.opacity = player.opacity === 1 ? 0.3 : 1;
        count++;
        if (count < times * 2) {
            wait(interval, blink);
        } else {
            player.opacity = 1;
        }
    }
    blink();
}

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
                if (gameState.isInvulnerable || player.isDead) return
                
                gameState.currentHealth = Math.max(0, gameState.currentHealth - amount)
                gameState.isInvulnerable = true
                
                // Вызов анимации урона
                player.use(sprite('take-hit-sprite'))
                player.play('take-hit-anim')
                // Вернуть обычную анимацию после удара
                wait(0.4, () => {
                    if (gameState.currentHealth > 0) {
                        player.use(sprite('idle-sprite'))
                        player.play('idle-anim')
                    }
                })
                
                blinkPlayer(player)
                
                // Remove invulnerability after cooldown
                wait(gameState.invulnerabilityTime / 1000, () => {
                    gameState.isInvulnerable = false
                })
                
                // Check if player is dead
                if (gameState.currentHealth <= 0) {
                    player.isDead = true
                    player.use(sprite('death-sprite'))
                    // Нет анимации смерти, просто показываем кадр смерти
                    wait(1.2, () => {
                        go('results')
                    })
                }
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