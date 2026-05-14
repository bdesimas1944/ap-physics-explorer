/* ══════════════════════════════════════════════
   AP Physics 1 Explorer — Shared Utilities
   utils.js
══════════════════════════════════════════════ */

/**
 * Resize a canvas to match its CSS display size at device pixel ratio.
 * Call on load and on window resize.
 * @param {HTMLCanvasElement} canvas
 */
function resizeCanvas(canvas) {
  const wrap = canvas.parentElement;
  const dpr  = window.devicePixelRatio || 1;
  canvas.width  = wrap.clientWidth  * dpr;
  canvas.height = wrap.clientHeight * dpr;
  canvas.style.width  = wrap.clientWidth  + 'px';
  canvas.style.height = wrap.clientHeight + 'px';
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

/**
 * Logical width of canvas (CSS pixels).
 * @param {HTMLCanvasElement} canvas
 */
function cw(canvas) { return canvas.width  / (window.devicePixelRatio || 1); }

/**
 * Logical height of canvas (CSS pixels).
 * @param {HTMLCanvasElement} canvas
 */
function ch(canvas) { return canvas.height / (window.devicePixelRatio || 1); }

/**
 * Draw a dashed line between two points.
 * @param {CanvasRenderingContext2D} ctx
 */
function dashedLine(ctx, x1, y1, x2, y2, dash = 5, gap = 4) {
  const dx = x2 - x1, dy = y2 - y1;
  const dist = Math.hypot(dx, dy);
  if (!dist) return;
  const steps = Math.floor(dist / (dash + gap));
  for (let i = 0; i <= steps; i++) {
    const t0 = i * (dash + gap) / dist;
    const t1 = Math.min((i * (dash + gap) + dash) / dist, 1);
    ctx.beginPath();
    ctx.moveTo(x1 + dx * t0, y1 + dy * t0);
    ctx.lineTo(x1 + dx * t1, y1 + dy * t1);
    ctx.stroke();
  }
}

/**
 * Draw an arrowhead at (x, y) pointing in the given angle (radians).
 * @param {CanvasRenderingContext2D} ctx
 */
function arrowHead(ctx, x, y, angle, size = 8) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-size * 0.6,  size * 0.35);
  ctx.lineTo(-size * 0.6, -size * 0.35);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/**
 * Draw a rounded rectangle path.
 * radii = [topLeft, topRight, bottomRight, bottomLeft]
 * @param {CanvasRenderingContext2D} ctx
 */
function roundRect(ctx, x, y, w, h, radii = [3, 3, 3, 3]) {
  const [tl, tr, br, bl] = radii;
  ctx.beginPath();
  ctx.moveTo(x + tl, y);
  ctx.lineTo(x + w - tr, y);      ctx.arcTo(x + w, y,     x + w, y + tr,     tr);
  ctx.lineTo(x + w, y + h - br);  ctx.arcTo(x + w, y + h, x + w - br, y + h, br);
  ctx.lineTo(x + bl, y + h);      ctx.arcTo(x,     y + h, x, y + h - bl,     bl);
  ctx.lineTo(x, y + tl);          ctx.arcTo(x,     y,     x + tl, y,         tl);
  ctx.closePath();
}

/**
 * Draw grid lines and y-axis ticks for a physics canvas.
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} layout - { padL, padR, padT, padB, groundY, pxPerM, maxHm, canvasW, canvasH }
 */
function drawGrid(ctx, layout) {
  const { padL, groundY, pxPerM, maxHm, canvasW } = layout;
  const drawW = canvasW - padL - layout.padR;

  ctx.font = '11px "DM Mono", monospace';
  ctx.textAlign = 'right';

  for (let hv = 0; hv <= maxHm; hv += 5) {
    const ty = groundY - hv * pxPerM;
    ctx.strokeStyle = '#1e2028';
    ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(padL, ty); ctx.lineTo(padL + drawW, ty); ctx.stroke();
    ctx.fillStyle = '#4a4d5e';
    ctx.fillText(hv + 'm', padL - 8, ty + 4);
  }

  // Y axis
  ctx.strokeStyle = '#2a2b33';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padL, layout.padT);
  ctx.lineTo(padL, groundY);
  ctx.stroke();

  // Ground
  ctx.strokeStyle = '#3a3b45';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(padL, groundY);
  ctx.lineTo(padL + drawW, groundY);
  ctx.stroke();

  // Ground hatch marks
  ctx.strokeStyle = '#2a2b33';
  ctx.lineWidth = 1;
  for (let x = padL; x < padL + drawW; x += 16) {
    ctx.beginPath(); ctx.moveTo(x, groundY); ctx.lineTo(x - 10, groundY + 10); ctx.stroke();
  }
}

/**
 * Draw a ball with highlight and shadow.
 * @param {CanvasRenderingContext2D} ctx
 */
function drawBall(ctx, x, y, r, groundY) {
  // Shadow
  ctx.beginPath();
  ctx.ellipse(x, groundY - 2, r * 0.9, 5, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fill();
  // Ball
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = '#c8cad8'; ctx.fill();
  ctx.strokeStyle = '#7a7d8e'; ctx.lineWidth = 1.5; ctx.stroke();
  // Highlight
  ctx.beginPath(); ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.25, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.fill();
}
