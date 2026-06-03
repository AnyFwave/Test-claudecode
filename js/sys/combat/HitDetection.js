export class HitDetection {
  static circleVsCircle(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const ra = a.radius || a.size || 0;
    const rb = b.radius || b.size || 0;
    return (dx * dx + dy * dy) < ((ra + rb) * (ra + rb));
  }

  static rayVsCircle(ox, oy, angle, range, cx, cy, cr) {
    const dx = cx - ox;
    const dy = cy - oy;
    const t = dx * Math.cos(angle) + dy * Math.sin(angle);
    if (t < 0 || t > range) return false;
    const px = ox + t * Math.cos(angle);
    const py = oy + t * Math.sin(angle);
    const dist = Math.sqrt((cx - px) ** 2 + (cy - py) ** 2);
    return dist < cr;
  }
}
