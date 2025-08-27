import { ramp } from './utils.js'

export default class Level {

    public static readonly GridSize = 9

    public topGrid = new Array<boolean[]>(Level.GridSize)
    public bottomGrid = new Array<boolean[]>(Level.GridSize)
    public difficulty = 1
    public lastCount = 0
    public timer = 0
    public playing = false

    constructor() {
        for (let i = 0; i < Level.GridSize; i++) {
            this.topGrid[i] = new Array<boolean>(Level.GridSize)
            this.bottomGrid[i] = new Array<boolean>(Level.GridSize)
        }

        this.timer = 5
        this.buildTopGrid(1)
    }

    clearTopGrid() {
        this.clearGrid(this.topGrid)
    }
    clearBottomGrid() {
        this.clearGrid(this.bottomGrid)
    }

    clearGrid(grid: boolean[][]) {
        for (let i = 0; i < Level.GridSize; i++) {
            for (let j = 0; j < Level.GridSize; j++) {
                grid[i][j] = false
            }
        }
    }

    toggleRect(x: number, y: number, w: number, h: number, grid: boolean[][]): number {
        let count = 0
        for (let i = x; i < x + w; i++) {
            for (let j = y; j < y + h; j++) {
                grid[i][j] = !grid[i][j]
                count += grid[i][j] ? 1 : -1
            }
        }
        return count
    }

    inBounds(x: number, y: number) {
        return x >= 0 && x < Level.GridSize && y >= 0 && y < Level.GridSize
    }

    buildTopGrid(difficulty: number) {
        const rampedDifficulty = ramp(difficulty, 20, 20)
        const maxCount = 1 + Math.floor(rampedDifficulty)
        const maxLength = Math.ceil(rampedDifficulty / 2)

        let count = 0

        while (count < maxCount || count === this.lastCount) {
            const w = Math.ceil(Math.random() * maxLength)
            const h = Math.ceil(Math.random() * maxLength)
            const x = Math.ceil(Math.random() * (Level.GridSize - w))
            const y = Math.ceil(Math.random() * (Level.GridSize - h))

            count += this.toggleRect(x, y, w, h, this.topGrid)
        }
    }



    count(grid: boolean[][]) {
        let count = 0
        for (let i = 0; i < Level.GridSize; i++) {
            for (let j = 0; j < Level.GridSize; j++) {
                count += grid[i][j] ? 1 : -1
            }
        }
        return count
    }

    equal() {
        return this.count(this.topGrid) === this.count(this.bottomGrid)
    }

    nextLevel() {
        this.clearGrid(this.topGrid)
        this.difficulty++
        this.buildTopGrid(this.difficulty)
        this.timer += 5.0
    }

    update(deltaTime: number) {
        if (!this.playing) return

        if (this.equal()) {
            this.nextLevel()
        }
        this.timer -= deltaTime
        this.checkForLoss()
    }

    move(x: number, y: number, w: number, h: number) {
        this.playing = true
        this.toggleRect(x, y, w, h, this.bottomGrid)
        if (!this.equal()) {
            this.timer -= 1.0
        }
    }

    checkForLoss() {
        if (this.timer < 0) {
            this.difficulty = 1
            this.clearTopGrid()
            this.clearBottomGrid()
            this.buildTopGrid(this.difficulty)
            this.timer = 5.0
            this.playing = false
        }
    }
}