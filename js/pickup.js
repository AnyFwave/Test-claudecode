class Pickup {
    constructor(x, y, type, weaponId) {
        this.x = x;
        this.y = y;
        this.type = type; // 'weapon' | 'health'
        this.weaponId = weaponId; // only for type 'weapon'
        this.radius = 12;
        this.alive = true;
        this.lifetime = 8; // seconds before disappearing
        this.blinkTimer = 0;
        this.bobOffset = Math.random() * Math.PI * 2;
    }

    update(dt) {
        this.lifetime -= dt;
        this.blinkTimer += dt;

        // Blink faster when about to disappear
        if (this.lifetime <= 0) {
            this.alive = false;
        }
    }

    draw(ctx) {
        const alpha = (this.lifetime < 2 && Math.floor(this.lifetime * 5) % 2 === 0) ? 0.4 : 1;
        ctx.globalAlpha = alpha;

        const bobY = Math.sin(this.blinkTimer * 3 + this.bobOffset) * 2;

        if (this.type === 'weapon') {
            const weapon = WEAPON_DATA[this.weaponId];
            if (!weapon) return;

            // Glow
            ctx.shadowColor = '#f39c12';
            ctx.shadowBlur = 15;

            // Background circle
            ctx.fillStyle = 'rgba(243, 156, 18, 0.2)';
            ctx.beginPath();
            ctx.arc(this.x, this.y + bobY, this.radius + 4, 0, Math.PI * 2);
            ctx.fill();

            ctx.shadowBlur = 0;

            // Border
            ctx.strokeStyle = '#f39c12';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y + bobY, this.radius + 4, 0, Math.PI * 2);
            ctx.stroke();

            // Inner icon
            ctx.fillStyle = '#f39c12';
            ctx.font = '14px "Courier New", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(weapon.icon, this.x, this.y + bobY);

            // Label
            ctx.fillStyle = '#fff';
            ctx.font = '10px "Courier New", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText(weapon.name, this.x, this.y + bobY + this.radius + 8);
        } else if (this.type === 'health') {
            ctx.shadowColor = '#2ecc71';
            ctx.shadowBlur = 15;

            ctx.fillStyle = 'rgba(46, 204, 113, 0.2)';
            ctx.beginPath();
            ctx.arc(this.x, this.y + bobY, this.radius + 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.strokeStyle = '#2ecc71';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y + bobY, this.radius + 4, 0, Math.PI * 2);
            ctx.stroke();

            // Health cross
            ctx.fillStyle = '#2ecc71';
            ctx.fillRect(this.x - 4, this.y + bobY - 2, 8, 4);
            ctx.fillRect(this.x - 2, this.y + bobY - 4, 4, 8);

            ctx.fillStyle = '#fff';
            ctx.font = '9px "Courier New", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText('HP+25', this.x, this.y + bobY + this.radius + 8);
        }

        ctx.globalAlpha = 1;
    }

    canPickup(playerX, playerY) {
        const dx = this.x - playerX;
        const dy = this.y - playerY;
        return Math.sqrt(dx * dx + dy * dy) < this.radius + 18;
    }
}
