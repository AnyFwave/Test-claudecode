export class NotificationSystem {
  constructor() {
    this.text = '';
    this.timer = 0;
  }

  show(text, duration = 2.0) {
    this.text = text;
    this.timer = duration;
  }

  update(dt) {
    if (this.timer > 0) this.timer -= dt;
  }

  draw(ctx, canvasWidth) {
    if (this.timer <= 0) return;
    const alpha = Math.min(1, this.timer);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#f39c12';
    ctx.font = 'bold 18px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(this.text, canvasWidth / 2, 70);
    ctx.globalAlpha = 1;
  }
}
