import Level from './level.js';
import { ramp } from './utils.js';
const PaddingFractionCells = 1;
const RenderWidthCells = Level.GridSize + PaddingFractionCells * 2;
const RenderHeightCells = Level.GridSize * 2 + PaddingFractionCells * 4;
const CornerRadiusFraction = 0.2;
export default class Game {
    canvas = document.getElementById('game-canvas');
    context = this.canvas.getContext('2d');
    horizontal = false;
    cellSize = 0;
    gridSize = 0;
    gameRect = { x: 0, y: 0, w: 0, h: 0 };
    upperGridRect = { x: 0, y: 0, w: 0, h: 0 };
    lowerGridRect = { x: 0, y: 0, w: 0, h: 0 };
    level = new Level();
    cornerRadius = 0;
    gridDownX = 0;
    gridDownY = 0;
    gridX = 0;
    gridY = 0;
    move = false;
    previousTime = 0;
    musicPlaying = false;
    constructor() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.canvas.addEventListener('mousedown', e => this.mouseDown(e));
        this.canvas.addEventListener('mousemove', e => this.mouseMove(e));
        this.canvas.addEventListener('mouseup', e => this.mouseUp(e));
        this.canvas.addEventListener('contextmenu', e => e.preventDefault());
        requestAnimationFrame(time => this.loop(time));
    }
    gridToDisplayX(gridX) {
        return this.lowerGridRect.x + gridX * this.cellSize;
    }
    gridToDisplayY(gridY) {
        return this.lowerGridRect.y + gridY * this.cellSize;
    }
    displayToGridX(displayX) {
        return Math.floor((displayX - this.lowerGridRect.x) / this.cellSize);
    }
    displayToGridY(displayY) {
        return Math.floor((displayY - this.lowerGridRect.y) / this.cellSize);
    }
    mouseDown(e) {
        if (!this.musicPlaying) {
            const audioElement = document.createElement('audio');
            audioElement.src = './res/music/loop.mp3';
            audioElement.volume = 0.25;
            audioElement.play();
            audioElement.loop = true;
            this.musicPlaying = true;
        }
        if (e.button !== 0) {
            this.move = false;
        }
        else if (this.level.inBounds(this.gridX, this.gridY)) {
            this.move = true;
            this.gridDownX = this.gridX;
            this.gridDownY = this.gridY;
        }
    }
    mouseMove(e) {
        this.gridX = this.displayToGridX(e.clientX);
        this.gridY = this.displayToGridY(e.clientY);
    }
    mouseUp(e) {
        if (e.button !== 0)
            return;
        if (this.move) {
            const rect = this.selectionRect();
            this.level.move(rect.x, rect.y, rect.w, rect.h);
            this.move = false;
        }
    }
    selectionRect() {
        let x1 = Math.min(this.gridDownX, this.gridX);
        let y1 = Math.min(this.gridDownY, this.gridY);
        let x2 = Math.max(this.gridDownX, this.gridX);
        let y2 = Math.max(this.gridDownY, this.gridY);
        if (x1 < 0)
            x1 = 0;
        if (y1 < 0)
            y1 = 0;
        if (x2 >= Level.GridSize)
            x2 = Level.GridSize - 1;
        if (y2 >= Level.GridSize)
            y2 = Level.GridSize - 1;
        const w = x2 - x1 + 1;
        const h = y2 - y1 + 1;
        return { x: x1, y: y1, w: w, h: h };
    }
    loop(time) {
        this.render();
        const deltaTime = (time - this.previousTime) / 1000;
        this.level.update(deltaTime);
        this.previousTime = time;
        requestAnimationFrame(time => this.loop(time));
    }
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.setDisplayVariables();
    }
    render() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.globalAlpha = 1;
        this.renderGameArea();
        const g = Math.floor(ramp(this.level.timer, 256, 20));
        const r = 255 - g;
        const rgb = `rgb(${r}, ${g}, 0)`;
        this.context.fillStyle = rgb;
        this.context.strokeStyle = rgb;
        this.renderUpperGridCells();
        this.renderLowerGridCells();
        this.renderGridLines();
        this.renderTimer();
        this.renderSelection();
    }
    renderGridCells(grid, rect) {
        for (let i = 0; i < Level.GridSize; i++) {
            for (let j = 0; j < Level.GridSize; j++) {
                if (!grid[i][j].on)
                    continue;
                let x = rect.x + i * this.cellSize;
                let y = rect.y + j * this.cellSize;
                this.context.globalAlpha = grid[i][j].power;
                this.context.beginPath();
                this.context.roundRect(x + 1, y + 1, this.cellSize - 2, this.cellSize - 2, this.cornerRadius);
                this.context.fill();
            }
        }
    }
    renderLowerGridCells() {
        this.renderGridCells(this.level.bottomGrid, this.lowerGridRect);
    }
    renderUpperGridCells() {
        this.renderGridCells(this.level.topGrid, this.upperGridRect);
    }
    renderGameArea() {
        this.context.fillStyle = '#111';
        this.context.fillRect(this.gameRect.x, this.gameRect.y, this.gameRect.w, this.gameRect.h);
    }
    renderSelection() {
        if (!this.move)
            return;
        const selectionRect = this.selectionRect();
        const x = this.gridToDisplayX(selectionRect.x);
        const y = this.gridToDisplayY(selectionRect.y);
        const w = selectionRect.w * this.cellSize;
        const h = selectionRect.h * this.cellSize;
        this.context.beginPath();
        this.context.roundRect(x, y, w, h, this.cornerRadius);
        this.context.globalAlpha = 0.125;
        this.context.fill();
        this.context.globalAlpha = 1;
        this.context.stroke();
    }
    renderTimer() {
        const timerLength = ramp(this.level.timer, 0.5, 20) * this.gridSize;
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const leftX = centerX - timerLength;
        const rightX = centerX + timerLength;
        this.context.beginPath();
        this.context.moveTo(leftX, centerY);
        this.context.lineTo(rightX, centerY);
        this.context.globalAlpha = 1;
        this.context.stroke();
    }
    renderGridLines() {
        const xLeft = this.upperGridRect.x;
        const xRight = xLeft + this.gridSize;
        const upperYTop = this.upperGridRect.y;
        const upperYBottom = upperYTop + this.gridSize;
        const lowerYTop = this.lowerGridRect.y;
        const lowerYBottom = lowerYTop + this.gridSize;
        this.context.beginPath();
        for (let i = 0; i <= Level.GridSize; i++) {
            let offset = i * this.cellSize;
            let x = this.upperGridRect.x + offset;
            let yUpper = this.upperGridRect.y + offset;
            let yLower = this.lowerGridRect.y + offset;
            this.context.moveTo(xLeft, yUpper);
            this.context.lineTo(xRight, yUpper);
            this.context.moveTo(xLeft, yLower);
            this.context.lineTo(xRight, yLower);
            this.context.moveTo(x, upperYTop);
            this.context.lineTo(x, upperYBottom);
            this.context.moveTo(x, lowerYTop);
            this.context.lineTo(x, lowerYBottom);
        }
        this.context.globalAlpha = 0.25;
        this.context.stroke();
        this.context.beginPath();
        const increment = Math.floor(Level.GridSize / 3);
        for (let i = 0; i <= Level.GridSize; i += increment) {
            let offset = i * this.cellSize;
            let x = this.upperGridRect.x + offset;
            let yUpper = this.upperGridRect.y + offset;
            let yLower = this.lowerGridRect.y + offset;
            this.context.moveTo(xLeft, yUpper);
            this.context.lineTo(xRight, yUpper);
            this.context.moveTo(xLeft, yLower);
            this.context.lineTo(xRight, yLower);
            this.context.moveTo(x, upperYTop);
            this.context.lineTo(x, upperYBottom);
            this.context.moveTo(x, lowerYTop);
            this.context.lineTo(x, lowerYBottom);
        }
        this.context.globalAlpha = 0.75;
        this.context.stroke();
    }
    setDisplayVariables() {
        this.horizontal = window.innerWidth * RenderHeightCells > window.innerHeight * RenderWidthCells;
        this.cellSize = this.horizontal
            ? window.innerHeight / RenderHeightCells
            : window.innerWidth / RenderWidthCells;
        this.cornerRadius = this.cellSize * CornerRadiusFraction;
        this.gridSize = Level.GridSize * this.cellSize;
        let w = this.cellSize * RenderWidthCells;
        let h = this.cellSize * RenderHeightCells;
        let x = (window.innerWidth - w) / 2;
        let y = (window.innerHeight - h) / 2;
        this.gameRect = { x, y, w, h };
        x = this.gameRect.x + this.gameRect.w / 2 - this.gridSize / 2;
        y = this.gameRect.y + this.cellSize * PaddingFractionCells;
        this.upperGridRect = { x, y, w: this.gridSize, h: this.gridSize };
        y = this.upperGridRect.y + this.gridSize + this.cellSize * PaddingFractionCells * 2;
        this.lowerGridRect = { x, y, w: this.gridSize, h: this.gridSize };
    }
}
