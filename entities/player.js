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
            direction: 'right'
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