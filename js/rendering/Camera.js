export class Camera {
  constructor() {
    this.shakeX = 0;
    this.shakeY = 0;
    this.shakeIntensity = 0;
  }

  shake(intensity) {
    this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
  }

  update() {
    if (this.shakeIntensity > 0.5) {
      this.shakeX = (Math.random() - 0.5) * this.shakeIntensity * 2;
      this.shakeY = (Math.random() - 0.5) * this.shakeIntensity * 2;
      this.shakeIntensity *= 0.85;
    } else {
      this.shakeX = 0;
      this.shakeY = 0;
      this.shakeIntensity = 0;
    }
  }

  apply(ctx) {
    ctx.save();
    ctx.translate(this.shakeX, this.shakeY);
  }

  restore(ctx) {
    ctx.restore();
  }
}
