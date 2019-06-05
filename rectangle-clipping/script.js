function drawСoncentricRectangles(ctx, clip = false) {
  let rect0 = [
    { x: 100, y: 100 },
    { x: 300, y: 100 },
    { x: 300, y: 200 },
    { x: 100, y: 200 }
  ];

  let rect = rect0;

  let center = {
    x: (rect[0].x + rect[1].x) / 2,
    y: (rect[0].y + rect[2].y) / 2
  };

  if (clip) {
    ctx.ellipse(center.x, center.y, 50, 75, Math.PI / 4, 0, 2 * Math.PI);
    ctx.clip();
  }

  const rectCount = getRandomInt(20, 50);

  for (let i = 1; i <= rectCount; i++) {
    rect = rect0.map(point => rotate(point, center, 20*i));

    let hypotHalfLength = Math.hypot(center.x-rect0[0].x,center.y-rect0[0].y)/2;
    let shift = getRandomInt(0, hypotHalfLength);

    rect = rect.map(point => {
      point.x += shift;
      point.y += shift;
      return point;
    });

    drawPolygon(ctx, rect);
  }
}

function rotate(p, p2, angle) {
  let rad = angle * (Math.PI / 180);

  let pr = {
    x: p.x - p2.x,
    y: p.y - p2.y
  };

  let x = pr.x;
  let y = pr.y;

  pr.x = x * Math.cos(rad) - y * Math.sin(rad) + p2.x;
  pr.y = x * Math.sin(rad) + y * Math.cos(rad) + p2.y;

  return pr;
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function drawPolygon(ctx, points) {
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.closePath();

  ctx.stroke();
}

function initCanvas(canvasId) {
  const canvas = document.getElementById(canvasId);
  const width = canvas.getAttribute('width');
  const height = canvas.getAttribute('height');

  const ctx = canvas.getContext('2d');

  return {
    canvas,
    ctx,
    dimensions: {
      width,
      height
    }
  };
}

(function main() {
  const CANVAS_ID = 'canvas';

  const {canvas, ctx, dimensions: {
    width: canvasWidth,
    height: canvasHeight
  }} = initCanvas(CANVAS_ID);

  drawСoncentricRectangles(ctx, true);
})();
