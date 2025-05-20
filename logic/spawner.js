import { difficulties, gameState } from './state.js'

// Monster spawner
export function spawnMonster() {
    const x = rand(100, width() - 100)
    const y = rand(100, height() - 100)
    const monster = createMonster(vec2(x, y), difficulties[gameState.difficulty].monsterSpeed)
    
    // Monster movement
    monster.onUpdate(() => {
        monster.move(monster.speed * monster.direction, 0)
        
        // Change direction if hitting walls
        if (monster.pos.x <= 0 || monster.pos.x >= width()) {
            monster.direction *= -1
        }
    })
}

// Chest spawner
export function spawnChest() {
    const x = rand(100, width() - 100)
    const y = rand(100, height() - 100)
    createChest(vec2(x, y))
}

// Monster class
function createMonster(posVec, speed) {
    return add([
        rect(32, 32),
        pos(posVec.x, posVec.y),
        area(),
        body(),
        color(255, 0, 0),
        'monster',
        {
            speed: speed,
            direction: 1
        }
    ])
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