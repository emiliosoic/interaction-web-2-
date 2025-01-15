let walls = [];
let particle;
let backgroundRays = []; // Rays emitted from the blue sphere

let wallCount = 50; // Number of rays in the starburst
let rayCount = 1; // Angle increment for rays
let rotationSpeed = 0.01; // Speed of rotating circles

const canvasWidth = 1920; // Fixed canvas width
const canvasHeight = 1080; // Fixed canvas height

function setup() {
  // Create a fixed-size canvas
  let canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.style('display', 'block'); // Removes scrollbars

  setupWalls(); // Initialize walls
  particle = new Particle();
  setupBackgroundRays(); // Initialize background rays
  noCursor();
}

function draw() {
  background(0); // Clear background

  drawBackgroundSphere(); // Adds the blue sphere rays

  for (let wall of walls) {
    wall.show();
  }

  drawHeartbeatCircles(); // Adds pulse-like heartbeat effect

  particle.update(mouseX, mouseY);
  particle.show();
  particle.look(walls);

  drawBackgroundRays(); // Blue sphere emits rays interacting with walls
}

// Setup walls dynamically based on canvas size
function setupWalls() {
  walls = [];
  let centerX = width / 2;
  let centerY = height / 2;

  for (let i = 0; i < wallCount; i++) {
    let angle = (TWO_PI / wallCount) * i;
    let x1 = centerX;
    let y1 = centerY;
    let x2 = centerX + cos(angle) * width / 4;
    let y2 = centerY + sin(angle) * height / 4;

    walls.push(new Boundary(x1, y1, x2, y2));
  }

  // Outlines (unchanged)
  walls.push(new Boundary(-1, -1, width, -1));
  walls.push(new Boundary(width, -1, width, height));
  walls.push(new Boundary(width, height, -1, height));
  walls.push(new Boundary(-1, height, -1, -1));
}

// Initialize background rays
function setupBackgroundRays() {
  let centerX = width / 2;
  let centerY = height / 2;
  backgroundRays = [];

  for (let angle = 0; angle < 360; angle += rayCount) {
    backgroundRays.push(new Ray(createVector(centerX, centerY), radians(angle)));
  }
}

// Pulsing blue sphere with rays
function drawBackgroundSphere() {
  fill(0, 0, 255, 100); // Semi-transparent blue
  noStroke();
  ellipse(width / 2, height / 2, 400); // Fixed size sphere
}

// Rays emitted from the background sphere
function drawBackgroundRays() {
  for (let ray of backgroundRays) {
    let closest = null;
    let record = Infinity;

    // Find the closest point of intersection
    for (let wall of walls) {
      const pt = ray.cast(wall);
      if (pt) {
        const d = p5.Vector.dist(ray.pos, pt);
        if (d < record) {
          record = d;
          closest = pt;
        }
      }
    }

    // Draw the ray to the intersection point
    if (closest) {
      stroke(0, 0, 255, 150); // Blue rays
      line(ray.pos.x, ray.pos.y, closest.x, closest.y);
    }
  }
}

// Heartbeat pulse effect for decorative circles
function drawHeartbeatCircles() {
  push();
  translate(width / 2, height / 2);
  strokeWeight(2);
  noFill();

  let pulse = map(sin(frameCount * 0.05), -1, 1, -10, 10); // Dynamic pulse

  for (let i = 0; i < 5; i++) {
    stroke(255, 100, 200, 150 - i * 30);
    let baseRadius = 100 + i * 50;
    let radius = baseRadius + pulse * (i + 1); // Each circle responds to the pulse
    ellipse(0, 0, radius, radius);
  }
  pop();
}

///////////////////////////////////////////////Walls
class Boundary {
  constructor(x1, y1, x2, y2) {
    this.a = createVector(x1, y1);
    this.b = createVector(x2, y2);
  }

  show() {
    stroke(255); // Wall Color
    line(this.a.x, this.a.y, this.b.x, this.b.y);
  }
}

///////////////////////////////////////////Rays
class Ray {
  constructor(pos, angle) {
    this.pos = pos;
    this.dir = p5.Vector.fromAngle(angle);
  }

  lookAt(x, y) {
    this.dir.x = x - this.pos.x;
    this.dir.y = y - this.pos.y;
    this.dir.normalize();
  }

  show() {
    stroke(255);
    push();
    translate(this.pos.x, this.pos.y);
    line(0, 0, this.dir.x * 10, this.dir.y * 10);
    pop();
  }

  cast(wall) {
    const x1 = wall.a.x;
    const y1 = wall.a.y;
    const x2 = wall.b.x;
    const y2 = wall.b.y;

    const x3 = this.pos.x;
    const y3 = this.pos.y;
    const x4 = this.pos.x + this.dir.x;
    const y4 = this.pos.y + this.dir.y;

    const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (den == 0) {
      return;
    }

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;
    if (t > 0 && t < 1 && u > 0) {
      const pt = createVector();
      pt.x = x1 + t * (x2 - x1);
      pt.y = y1 + t * (y2 - y1);
      return pt;
    } else {
      return;
    }
  }
}

////////////////////////////////////////////////////Particles
class Particle {
  constructor() {
    this.pos = createVector(width / 2, height / 2);
    this.rays = [];
    for (let a = 0; a < 360; a += rayCount) {
      this.rays.push(new Ray(this.pos, radians(a)));
    }
  }

  update(x, y) {
    this.pos.set(x, y);
  }

  look(walls) {
    for (let i = 0; i < this.rays.length; i++) {
      const ray = this.rays[i];
      let closest = null;
      let record = Infinity;
      for (let wall of walls) {
        const pt = ray.cast(wall);
        if (pt) {
          const d = p5.Vector.dist(this.pos, pt);
          if (d < record) {
            record = d;
            closest = pt;
          }
        }
      }
      if (closest) {
        stroke(255, 100); // Ray Color
        line(this.pos.x, this.pos.y, closest.x, closest.y);
      }
    }
  }

  show() {
    fill(255);
    noStroke();
    ellipse(this.pos.x, this.pos.y, 4);
    for (let ray of this.rays) {
      ray.show();
    }
  }
}
