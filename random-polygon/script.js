function drawPolygon(ctx, points) {
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.closePath();

  ctx.stroke();
}

/**
   * Start with the centre of the polygon at origin.x, origin.y, 
   * then creates the polygon by sampling points on a circle around the centre. 
   * Randon noise is added by varying the angular spacing between sequential points,
   * and by varying the radial distance of each point from the centre
   * 
   * @param origin - coordinates of the "centre" of the polygon
   * @param numberOfVertices - self-explanatory
   * @param avgRadius - in px, the average radius of this polygon, this roughly controls how large the polygon is, really only useful for order of magnitude.
   * @param irregularity - [0,1] indicating how much variance there is in the angular spacing of vertices. [0,1] will map to [0, 2pi/numberOfVertices]
   * @param spikeyness - [0,1] indicating how much variance there is in each vertex from the circle of radius avgRadius. [0,1] will map to [0, avgRadius]
   * 
   * @returns a list of vertices, in CCW order.
   */
function generatePolygon(origin, numberOfVertices, avgRadius, irregularity = 0.5, spikeyness = 0.5) {
  if (numberOfVertices < 3) {
    throw new Error('Polygon must be at least with 3 edges.');
  }
  
  irregularity = clip(irregularity, 0, 1) * 2 * Math.PI / numberOfVertices;
  spikeyness = clip(spikeyness, 0, 1) * avgRadius;

  // generate n angle steps
  let angleSteps = [];
  let lower = 2 * Math.PI / numberOfVertices - irregularity;
  let upper = 2 * Math.PI / numberOfVertices + irregularity;
  let sum = 0;

  for (let i = 0; i < numberOfVertices; i++) {
    tmp = getRandomFloat(lower, upper);
    angleSteps.push(tmp);
    sum += tmp;
  }

  // normalize the steps so that point 0 and point n+1 are the same
  let k = sum / (2 * Math.PI);

  for (let i = 0; i < numberOfVertices; i++) {
    angleSteps[i] /= k;
  }

  // now generate the points
  let points = [];
  let angle = getRandomFloat(0, 2 * Math.PI);

  for (let i = 0; i < numberOfVertices; i++) {
    let r = clip(getRandomFloat(avgRadius, spikeyness), 0, 2 * avgRadius);

    points.push({
      x: Math.round(origin.x + r * Math.cos(angle)),
      y: Math.round(origin.y + r * Math.sin(angle))
    });

    angle += angleSteps[i];
  }

  return points;
}

function clip(x, min, max) {
  if (min > max) return x;
  else if (x < min) return min;
  else if (x > max) return max;
  else return x;
}

function getRandomFloat(min, max) {
  return Math.random() * (max - min) + min;
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

  drawPolygon(ctx, generatePolygon({
     x: canvasWidth / 2,
     y: canvasHeight / 2 
  }, 100, 250));
})();
