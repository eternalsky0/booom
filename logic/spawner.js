import { difficulties, gameState } from './state.js'

function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}

// Проверка на близость к другим монстрам
function isPositionFree(posVec, monsters, minDist = 40) {
    return !monsters.some(m => m.exists() && m.pos.dist(posVec) < minDist)
}

// Monster spawner
export function spawnMonster(player, monsters) {
    // Выбор типа монстра
    const types = ['normal', 'fast', 'jumper', 'shooter']
    // Не более 2 подряд одного типа
    let lastTypes = monsters.slice(-2).map(m => m.type)
    let availableTypes = types.filter(t => lastTypes.filter(l => l === t).length < 2)
    const type = availableTypes.length > 0 ? availableTypes[Math.floor(Math.random() * availableTypes.length)] : types[Math.floor(Math.random() * types.length)]
    let speed = difficulties[gameState.difficulty].monsterSpeed
    if (type === 'fast') speed *= 1.5
    if (type === 'jumper') speed *= 1.1
    if (type === 'shooter') speed *= 0.8

    // Спавним ближе к игроку, но не ближе 120px
    let posVec
    let attempts = 0
    do {
        let px = clamp(player.pos.x + rand(-350, 350), 100, width() - 100)
        let py = clamp(player.pos.y + rand(-120, 120), 100, height() - 100)
        posVec = vec2(px, py)
        attempts++
    } while ((!isPositionFree(posVec, monsters, 48) || posVec.dist(player.pos) < 120) && attempts < 10)
    if (!isPositionFree(posVec, monsters, 48) || posVec.dist(player.pos) < 120) return // Не спавним, если нет места

    const monster = createMonster(posVec, speed, type, player, monsters)
    monsters.push(monster)
}

// Monster class
function createMonster(posVec, speed, type, player, monsters) {
    let colorVal = type === 'fast' ? rgb(255,80,80) : type === 'jumper' ? rgb(80,255,80) : type === 'shooter' ? rgb(80,80,255) : rgb(255,0,0)
    const monster = add([
        rect(32, 32),
        pos(posVec.x, posVec.y),
        area(),
        body(),
        color(colorVal),
        'monster',
        {
            speed: speed,
            direction: Math.random() < 0.5 ? 1 : -1,
            type: type,
            shootCooldown: 0
        }
    ])

    // Визуальный эффект появления
    monster.opacity = 0.2
    tween(monster.opacity, 1, 0.5, v => monster.opacity = v)

    monster.onUpdate(() => {
        // Погоня за игроком
        let chase = false
        if (player && Math.abs(player.pos.x - monster.pos.x) < 350 && Math.abs(player.pos.y - monster.pos.y) < 120) {
            chase = true
        }
        let moveSpeed = monster.speed
        if (chase) moveSpeed *= 1.5

        // Патрулирование платформы (не падает вниз)
        if (monster.isGrounded()) {
            if (chase) {
                if (player.pos.x > monster.pos.x) {
                    monster.move(moveSpeed, 0)
                    monster.direction = 1
                } else {
                    monster.move(-moveSpeed, 0)
                    monster.direction = -1
                }
            } else {
                monster.move(moveSpeed * monster.direction, 0)
            }
        }

        // Прыгающий монстр
        if (monster.type === 'jumper' && monster.isGrounded() && Math.random() < 0.02) {
            monster.jump()
        }

        // Стреляющий монстр
        if (monster.type === 'shooter') {
            monster.shootCooldown -= dt()
            if (chase && monster.shootCooldown <= 0) {
                spawnProjectile(monster, player)
                monster.shootCooldown = 2 + Math.random() * 2
            }
        }

        // Смена направления у края экрана
        if (monster.pos.x <= 0 || monster.pos.x >= width()) {
            monster.direction *= -1
        }
    })

    // Удаляем из массива при уничтожении
    monster.onDestroy(() => {
        const idx = monsters.indexOf(monster)
        if (idx !== -1) monsters.splice(idx, 1)
    })

    return monster
}

// Снаряд для стреляющего монстра
function spawnProjectile(monster, player) {
    const dir = Math.sign(player.pos.x - monster.pos.x)
    const proj = add([
        rect(12, 6),
        pos(monster.pos.x + dir * 20, monster.pos.y + 8),
        area(),
        color(255, 255, 0),
        move(dir, 400),
        'monsterProjectile'
    ])
    proj.onUpdate(() => {
        if (proj.pos.x < 0 || proj.pos.x > width()) proj.destroy()
    })
}

// Chest spawner
export function spawnChest() {
    const x = rand(100, width() - 100)
    const y = rand(100, height() - 100)
    createChest(vec2(x, y))
}

// Chest class
function createChest(posVec) {
    return add([
        rect(32, 32),
        pos(posVec.x, posVec.y),
        area(),
        body({isStatic: true}),
        color(255, 215, 0),
        'chest'
    ])
} 