import { ramp } from './utils.js';
export default class Level {
    static GridSize = 9;
    static Middle = Math.floor(Level.GridSize / 2);
    topGrid = new Array(Level.GridSize);
    bottomGrid = new Array(Level.GridSize);
    difficulty = 1;
    lastCount = 0;
    timer = 0;
    playing = false;
    constructor() {
        for (let i = 0; i < Level.GridSize; i++) {
            this.topGrid[i] = new Array(Level.GridSize);
            this.bottomGrid[i] = new Array(Level.GridSize);
        }
        this.timer = 5;
        this.topGrid[Level.Middle][Level.Middle] = true;
        this.lastCount = 1;
    }
    clearTopGrid() {
        this.clearGrid(this.topGrid);
    }
    clearBottomGrid() {
        this.clearGrid(this.bottomGrid);
    }
    clearGrid(grid) {
        for (let i = 0; i < Level.GridSize; i++) {
            for (let j = 0; j < Level.GridSize; j++) {
                grid[i][j] = false;
            }
        }
    }
    toggleRect(x, y, w, h, grid) {
        let count = 0;
        for (let i = x; i < x + w; i++) {
            for (let j = y; j < y + h; j++) {
                grid[i][j] = !grid[i][j];
                count += grid[i][j] ? 1 : -1;
            }
        }
        return count;
    }
    inBounds(x, y) {
        return x >= 0 && x < Level.GridSize && y >= 0 && y < Level.GridSize;
    }
    buildTopGrid(difficulty) {
        const rampedDifficulty = ramp(difficulty, 20, 20);
        const maxCount = 1 + Math.floor(rampedDifficulty);
        const maxLength = Math.ceil(rampedDifficulty / 2);
        let count = 0;
        while (count < maxCount || count === this.lastCount) {
            const w = Math.ceil(Math.random() * maxLength);
            const h = Math.ceil(Math.random() * maxLength);
            const x = Math.ceil(Math.random() * (Level.GridSize - w));
            const y = Math.ceil(Math.random() * (Level.GridSize - h));
            count += this.toggleRect(x, y, w, h, this.topGrid);
        }
        this.lastCount = count;
    }
    count(grid) {
        let count = 0;
        for (let i = 0; i < Level.GridSize; i++) {
            for (let j = 0; j < Level.GridSize; j++) {
                count += grid[i][j] ? 1 : -1;
            }
        }
        return count;
    }
    equal() {
        return this.count(this.topGrid) === this.count(this.bottomGrid);
    }
    nextLevel() {
        this.clearGrid(this.topGrid);
        this.difficulty++;
        this.buildTopGrid(this.difficulty);
        this.timer += 5.0;
    }
    update(deltaTime) {
        if (!this.playing)
            return;
        if (this.equal()) {
            this.nextLevel();
        }
        this.timer -= deltaTime;
        this.checkForLoss();
    }
    move(x, y, w, h) {
        this.playing = true;
        this.toggleRect(x, y, w, h, this.bottomGrid);
        if (!this.equal()) {
            this.timer -= 1.0;
        }
    }
    checkForLoss() {
        if (this.timer < 0) {
            this.difficulty = 1;
            this.clearTopGrid();
            this.clearBottomGrid();
            this.buildTopGrid(this.difficulty);
            this.timer = 5.0;
            this.playing = false;
        }
    }
}
