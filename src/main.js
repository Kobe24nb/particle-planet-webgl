const canvas = document.getElementById('scene');
const ctx = canvas.getContext('2d');

const pointer = {
  x: window.innerWidth * 0.5,
  y: window.innerHeight * 0.5,
};

let width = 0;
let height = 0;
let dpr = Math.min(window.devicePixelRatio || 1, 2);

const stars = [];
const orbitParticles = [];

function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  dpr = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  stars.length = 0;
  orbitParticles.length = 0;

  const starCount = Math.min(220, Math.max(120, Math.floor((width * height) / 8)));
  for (let i = 0; i < starCount; i += 1) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.8 + 0.5,
      alpha: Math.random() * 0.7 + 0.2,
      twinkle: Math.random() * Math.PI * 2,
    });
  }

  const orbitCount = Math.min(700, Math.max(260, Math.floor((width * height) / 6)));
  for (let i = 0; i < orbitCount; i += 1) {
    orbitParticles.push({
      angle: Math.random() * Math.PI * 2,
      speed: randomRange(0.004, 0.018),
      radius: randomRange(100, 215),
      size: randomRange(1.2, 3.6),
      offset: Math.random() * Math.PI * 2,
      alpha: Math.random() * 0.9 + 0.1,
      hue: randomRange(180, 270),
    });
  }
}

function drawBackground() {
  const gradient = ctx.createRadialGradient(
    width * 0.5,
    height * 0.5,
    20,
    width * 0.5,
    height * 0.5,
    width * 0.7
  );

  gradient.addColorStop(0, '#0c1227');
  gradient.addColorStop(0.5, '#070d1b');
  gradient.addColorStop(1, '#02040a');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  for (const star of stars) {
    const pulse = 0.5 + Math.sin(performance.now() * 0.0015 + star.twinkle) * 0.5;
    ctx.beginPath();
    ctx.fillStyle = `rgba(255,255,255,${star.alpha * pulse})`;
    ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPlanet(t) {
  const cx = width * 0.5 + (pointer.x - width * 0.5) * 0.12;
  const cy = height * 0.52 + (pointer.y - height * 0.5) * 0.12;
  const radius = Math.min(width, height) * 0.18;

  const glow = ctx.createRadialGradient(cx, cy, radius * 0.3, cx, cy, radius * 2.6);
  glow.addColorStop(0, 'rgba(120, 200, 255, 0.8)');
  glow.addColorStop(0.28, 'rgba(96, 163, 255, 0.72)');
  glow.addColorStop(0.6, 'rgba(91, 90, 232, 0.32)');
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 2.6, 0, Math.PI * 2);
  ctx.fill();

  const planetGradient = ctx.createRadialGradient(
    cx - radius * 0.4,
    cy - radius * 0.5,
    radius * 0.2,
    cx,
    cy,
    radius * 1.2
  );
  planetGradient.addColorStop(0, '#d7f5ff');
  planetGradient.addColorStop(0.25, '#8cd7ff');
  planetGradient.addColorStop(0.5, '#4a8ef7');
  planetGradient.addColorStop(0.8, '#1d2f9f');
  planetGradient.addColorStop(1, '#050b45');

  ctx.fillStyle = planetGradient;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.strokeStyle = 'rgba(141, 234, 255, 0.7)';
  ctx.lineWidth = 1.5;
  ctx.arc(cx, cy, radius * 1.35, 0, Math.PI * 2);
  ctx.stroke();

  const ringGradient = ctx.createLinearGradient(cx - radius * 1.7, cy, cx + radius * 1.7, cy);
  ringGradient.addColorStop(0, 'rgba(122, 229, 255, 0)');
  ringGradient.addColorStop(0.5, 'rgba(122, 229, 255, 0.8)');
  ringGradient.addColorStop(1, 'rgba(122, 229, 255, 0)');

  ctx.beginPath();
  ctx.strokeStyle = ringGradient;
  ctx.lineWidth = 3;
  ctx.ellipse(cx, cy, radius * 1.8, radius * 0.7, Math.PI / 7, 0, Math.PI * 2);
  ctx.stroke();

  for (const particle of orbitParticles) {
    const drift = Math.sin(t * 0.0008 + particle.offset) * 0.35;
    const angle = particle.angle + t * particle.speed + drift;
    const px = cx + Math.cos(angle) * (particle.radius + Math.sin(t * 0.001 + particle.offset) * 18);
    const py = cy + Math.sin(angle) * (particle.radius * 0.58) + Math.cos(t * 0.0012 + particle.offset) * 10;
    const alpha = particle.alpha * (0.5 + Math.sin(angle * 4 + t * 0.004) * 0.5);

    ctx.beginPath();
    ctx.fillStyle = `hsla(${particle.hue}, 90%, 74%, ${alpha})`;
    ctx.arc(px, py, particle.size, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < 80; i += 1) {
    const angle = (i / 80) * Math.PI * 2 + t * 0.0008;
    const x = cx + Math.cos(angle) * (radius * 1.02 + i * 0.2);
    const y = cy + Math.sin(angle) * (radius * 0.7 + i * 0.08);

    ctx.beginPath();
    ctx.fillStyle = 'rgba(150, 220, 255, 0.18)';
    ctx.arc(x, y, 1.1, 0, Math.PI * 2);
    ctx.fill();
  }
}

function animate(now) {
  drawBackground();
  drawPlanet(now);
  requestAnimationFrame(animate);
}

window.addEventListener('resize', resize);
window.addEventListener('pointermove', (event) => {
  pointer.x = event.clientX;
  pointer.y = event.clientY;
});

resize();
requestAnimationFrame(animate);
