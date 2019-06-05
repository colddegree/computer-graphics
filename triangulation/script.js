function drawTriangulatedPolygon(ctx, polygonPoints, colors) {
    let pts = polygonPoints.slice();

    let initialFillStyle = ctx.fillStyle;

    for (let i = 0; pts.length; i++) {
        let earPos = findEar(pts);
        let triangle = getTriangle(earPos, pts);

        ctx.fillStyle = colors[i % colors.length];

        if (triangle !== false)
            drawPolygon(ctx, triangle, true);
        else
            break;

        if (earPos === pts.length)
            pts = pts.slice(1);
        else if (earPos === pts.length - 1)
            pts = pts.slice(0, pts.length - 1);
        else
            pts.splice(earPos + 1, 1);
    }

    ctx.fillStyle = initialFillStyle;
}

function findEar(polygonPoints) {
    let pts = polygonPoints.slice();

    pts.push(polygonPoints[0]);
    pts.push(polygonPoints[1]);

    for (let i = 0; pts.length > 3; i++) {
        let triangle = pts.slice(i, i + 3);

        if (triangle.length !== 3)
            break;

        if (fullInside([ triangle[0], triangle[2] ], polygonPoints)) {
            return i;
        }
    }
}

function getTriangle(i, polygonPoints) {
    let pts = polygonPoints.slice();

    pts.push(polygonPoints[0]);
    pts.push(polygonPoints[1]);

    return pts.slice(i, i + 3)
}

function fullInside(seg, polygonPoints) {
    let pts = polygonPoints.slice();

    pts.push(polygonPoints[0]);

    for (let i = 0; ; i++) {
        let seg_i = pts.slice(i, i + 2);

        if (seg_i.length !== 2)
            break;

        if (intersects(seg, seg_i))
            return false;
    }

    let point = {
        x: (seg[0].x + seg[1].x) / 2,
        y: (seg[0].y + seg[1].y) / 2,
    };

    return inside(point, polygonPoints);
}

function intersects(seg1, seg2) {
    let a = seg1[0].x;
    let b = seg1[0].y;

    let c = seg1[1].x;
    let d = seg1[1].y;

    let p = seg2[0].x;
    let q = seg2[0].y;
    
    let r = seg2[1].x;
    let s = seg2[1].y;

    let det, gamma, lambda;
    det = (c - a) * (s - q) - (r - p) * (d - b);

    if (det === 0)
        return false;

    lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
    gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;

    return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
}

function inside(point, points) {
    let x = point.x;
    let y = point.y;

    let inside = false;

    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        let xi = points[i].x,
            yi = points[i].y;
        let xj = points[j].x,
            yj = points[j].y;

        let intersect = ((yi > y) !== (yj > y)) &&
            (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

        if (intersect)
            inside = !inside;
    }

    return inside;
}

function drawPolygon(ctx, points, fill = false) {
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();

    if (fill)
        ctx.fill();

    ctx.stroke();
}

///////////////////////////////////////////////////////////////////////////////

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

    const {_, ctx, dimensions: {
        width: canvasWidth,
        height: canvasHeight
    }} = initCanvas(CANVAS_ID);

    const colors = [
        '#993333',
        '#d28345',
        '#f4bf75',
        '#90a959',
        '#75b6ab',
        '#6b9fb5',
        '#aa769f',
        '#875636'
    ];

    drawTriangulatedPolygon(ctx, generatePolygon({
        x: canvasWidth / 2,
        y: canvasHeight / 2
    },
        10,
        250,
        1,
        0),
    colors);
})();
