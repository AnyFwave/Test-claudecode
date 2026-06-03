class Spawner {
    constructor(canvasW, canvasH) {
        this.canvasW = canvasW;
        this.canvasH = canvasH;
    }

    spawnEnemy(type, wave) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 60;
        let x = this.canvasW / 2 + Math.cos(angle) * dist;
        let y = this.canvasH / 2 + Math.sin(angle) * dist;

        // Ensure spawn is outside the visible area
        const margin = 40;
        x = Math.max(-margin, Math.min(this.canvasW + margin, x));
        y = Math.max(-margin, Math.min(this.canvasH + margin, y));

        return new Enemy(x, y, type, wave);
    }

    getSpawnPosition() {
        const side = Math.floor(Math.random() * 4);
        const margin = 30;
        let x, y;
        switch (side) {
            case 0: // top
                x = Math.random() * this.canvasW;
                y = -margin;
                break;
            case 1: // right
                x = this.canvasW + margin;
                y = Math.random() * this.canvasH;
                break;
            case 2: // bottom
                x = Math.random() * this.canvasW;
                y = this.canvasH + margin;
                break;
            case 3: // left
                x = -margin;
                y = Math.random() * this.canvasH;
                break;
        }
        return { x, y };
    }

    spawnEnemyAt(type, wave, x, y) {
        if (x === undefined) {
            const pos = this.getSpawnPosition();
            x = pos.x;
            y = pos.y;
        }
        return new Enemy(x, y, type, wave);
    }
}
