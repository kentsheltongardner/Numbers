const PowerUpSpeed = 10.0;
const PowerDownSpeed = 5.0;
const PowerThreshold = 0.1;
export default class Cell {
    on;
    power;
    constructor(on, power) {
        this.on = on;
        this.power = power;
    }
    update(deltaTime) {
        if (this.on) {
            this.power += deltaTime * PowerUpSpeed * (1 - this.power);
            if (1 - this.power < PowerThreshold) {
                this.power = 1;
            }
        }
        else {
            this.power -= deltaTime * PowerDownSpeed * this.power;
            if (this.power < PowerThreshold) {
                this.power = 0;
            }
        }
    }
}
