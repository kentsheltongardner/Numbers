import Cell from './cell.js'
import { ramp } from './utils.js'

export default class Level {
    public static readonly GridSize = 9
    public static readonly Middle = Math.floor(Level.GridSize / 2)

    public topGrid = new Array<Cell[]>(Level.GridSize)
    public bottomGrid = new Array<Cell[]>(Level.GridSize)
    public difficulty = 1
    public lastCount = 0
    public timer = 0
    public playing = false

    constructor() {
        for (let i = 0; i < Level.GridSize; i++) {
            this.topGrid[i] = new Array<Cell>(Level.GridSize)
            this.bottomGrid[i] = new Array<Cell>(Level.GridSize)
            for (let j = 0; j < Level.GridSize; j++) {
                this.topGrid[i][j] = new Cell(false, 0)
                this.bottomGrid[i][j] = new Cell(false, 0)
            }
        }
        this.reset()
    }


    reset() {
        this.difficulty = 1
        this.playing = false
        this.timer = 5
        const middleCell = this.topGrid[Level.Middle][Level.Middle]
        middleCell.on = true
        middleCell.power = 1
        this.lastCount = 1
    }

    clearTopGrid() {
        this.clearGrid(this.topGrid)
    }
    clearBottomGrid() {
        this.clearGrid(this.bottomGrid)
    }

    clearGrid(grid: Cell[][]) {
        for (let i = 0; i < Level.GridSize; i++) {
            for (let j = 0; j < Level.GridSize; j++) {
                grid[i][j].on = false
                grid[i][j].power = 0
            }
        }
    }

    toggleRect(x: number, y: number, w: number, h: number, grid: Cell[][]): number {
        let count = 0
        for (let i = x; i < x + w; i++) {
            for (let j = y; j < y + h; j++) {
                grid[i][j].on = !grid[i][j].on
                count += grid[i][j].on ? 1 : -1
            }
        }
        return count
    }

    inBounds(x: number, y: number) {
        return x >= 0 && x < Level.GridSize && y >= 0 && y < Level.GridSize
    }

    buildTopGrid(difficulty: number) {
        const rampedDifficulty = ramp(difficulty, 25, 50)
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
        this.lastCount = count
    }



    count(grid: Cell[][]) {
        let count = 0
        for (let i = 0; i < Level.GridSize; i++) {
            for (let j = 0; j < Level.GridSize; j++) {
                count += grid[i][j].on ? 1 : -1
            }
        }
        return count
    }
    settled(grid: Cell[][]) {
        for (let i = 0; i < Level.GridSize; i++) {
            for (let j = 0; j < Level.GridSize; j++) {
                const power = grid[i][j].power
                if (power !== 1 && power !== 0) {
                    return false
                }
            }
        }
        return true
    }



    equal() {
        return this.count(this.topGrid) === this.count(this.bottomGrid)
            && this.settled(this.topGrid)
            && this.settled(this.bottomGrid)
    }

    nextLevel() {
        this.clearGrid(this.topGrid)
        this.difficulty++
        this.buildTopGrid(this.difficulty)
        this.timer += 6.0
    }

    update(deltaTime: number) {
        if (!this.playing) return

        for (let i = 0; i < Level.GridSize; i++) {
            for (let j = 0; j < Level.GridSize; j++) {
                this.topGrid[i][j].update(deltaTime)
                this.bottomGrid[i][j].update(deltaTime)
            }
        }

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
            this.clearTopGrid()
            this.clearBottomGrid()
            this.reset()
        }
    }
}