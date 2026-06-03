class Input {
    static keys = {};
    static mouseX = 0;
    static mouseY = 0;
    static mouseDown = false;
    static justShot = false;

    static init(canvas) {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            this.keys[e.code] = true;
            if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) {
                e.preventDefault();
            }
        });
        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
            this.keys[e.code] = false;
        });

        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            this.mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
            this.mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);
        });

        canvas.addEventListener('mousedown', (e) => {
            if (e.button === 0) {
                this.mouseDown = true;
                this.justShot = true;
            }
        });
        canvas.addEventListener('mouseup', (e) => {
            if (e.button === 0) {
                this.mouseDown = false;
            }
        });

        canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    static isDown(key) {
        return !!this.keys[key];
    }

    static get moveDir() {
        let dx = 0, dy = 0;
        if (this.isDown('ArrowUp') || this.isDown('KeyW')) dy -= 1;
        if (this.isDown('ArrowDown') || this.isDown('KeyS')) dy += 1;
        if (this.isDown('ArrowLeft') || this.isDown('KeyA')) dx -= 1;
        if (this.isDown('ArrowRight') || this.isDown('KeyD')) dx += 1;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len > 0) { dx /= len; dy /= len; }
        return { dx, dy };
    }

    static get mouseAngle() {
        return Math.atan2(this.mouseY, this.mouseX);
    }

    static consumeShot() {
        if (this.justShot) {
            this.justShot = false;
            return true;
        }
        return false;
    }
}
