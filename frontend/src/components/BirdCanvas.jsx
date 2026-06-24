import { useEffect, useRef } from 'react';

/**
 * BirdCanvas – draws and animates realistic flapping birds on a <canvas>
 * that is absolutely positioned over the hero section.
 * Automatically starts when mounted and stops (clears RAF) when unmounted.
 */

const BIRD_COUNT = 6;
const TWO_PI = Math.PI * 2;

function createBird(canvasW, canvasH, index) {
  const side = Math.random() < 0.5 ? 'left' : 'right'; // spawn side
  const speed = 0.4 + Math.random() * 0.55; // px per frame
  const scale = 0.55 + Math.random() * 0.65;
  const y = 40 + Math.random() * canvasH * 0.52; // stay in upper 52%
  const wingsPhase = Math.random() * TWO_PI;
  const wingsSpeed = 0.07 + Math.random() * 0.07;
  const wobbleAmp = 6 + Math.random() * 10;
  const wobbleFreq = 0.008 + Math.random() * 0.006;
  const delay = index * 90 + Math.random() * 200; // stagger frames

  return {
    x: side === 'left' ? -80 : canvasW + 80,
    y,
    baseY: y,
    speed: side === 'left' ? speed : -speed,
    scale,
    wingsPhase,
    wingsSpeed,
    wobbleAmp,
    wobbleFreq,
    wobbleTick: Math.random() * 1000,
    delay,
    active: false,
    side,
    opacity: 0,
  };
}

/**
 * Draw a single stylised bird at (0,0) facing right.
 * Wing angle 0 = fully spread, Math.PI/4 = flapping up.
 */
function drawBird(ctx, wingAngle, scale, opacity) {
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.scale(scale, scale);
  ctx.strokeStyle = '#3d6b72';
  ctx.lineWidth = 1.4;
  ctx.lineCap = 'round';

  const sweep = wingAngle; // 0..~0.6 radians flap

  // Body – small ellipse
  ctx.fillStyle = 'rgba(61,107,114,0.85)';
  ctx.beginPath();
  ctx.ellipse(0, 0, 7, 3.2, 0, 0, TWO_PI);
  ctx.fill();

  // Head
  ctx.beginPath();
  ctx.ellipse(8, -2, 4, 3, -0.25, 0, TWO_PI);
  ctx.fill();

  // Beak
  ctx.beginPath();
  ctx.moveTo(11, -2.5);
  ctx.lineTo(15, -1.5);
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Tail
  ctx.beginPath();
  ctx.moveTo(-6, 0);
  ctx.lineTo(-13, -1);
  ctx.lineTo(-12, 2);
  ctx.closePath();
  ctx.fillStyle = 'rgba(50,95,100,0.8)';
  ctx.fill();

  // Left wing (upper)
  ctx.save();
  ctx.rotate(-sweep);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-4, -18, -18, -22, -26, -14);
  ctx.bezierCurveTo(-20, -8, -8, -6, 0, 0);
  ctx.fillStyle = 'rgba(70,130,140,0.82)';
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Right wing (lower)
  ctx.save();
  ctx.rotate(sweep * 0.7);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-4, 16, -17, 19, -25, 11);
  ctx.bezierCurveTo(-18, 5, -8, 4, 0, 0);
  ctx.fillStyle = 'rgba(60,115,125,0.75)';
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  ctx.restore();
}

const BirdCanvas = () => {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const birdsRef  = useRef([]);
  const tickRef   = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      birdsRef.current = Array.from({ length: BIRD_COUNT }, (_, i) =>
        createBird(canvas.width, canvas.height, i)
      );
    };

    resize();
    window.addEventListener('resize', resize);

    const loop = () => {
      tickRef.current++;
      const tick = tickRef.current;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      birdsRef.current.forEach(bird => {
        // Delay activation
        if (!bird.active) {
          if (tick >= bird.delay) bird.active = true;
          else return;
        }

        // Fade in
        if (bird.opacity < 1) bird.opacity = Math.min(1, bird.opacity + 0.02);

        // Move
        bird.x += bird.speed;
        bird.wobbleTick += bird.wobbleFreq;
        bird.y = bird.baseY + Math.sin(bird.wobbleTick * 5) * bird.wobbleAmp;

        // Wing flap
        bird.wingsPhase += bird.wingsSpeed;
        const wingAngle = (Math.sin(bird.wingsPhase) * 0.5 + 0.5) * 0.55; // 0..0.55

        // Recycle when off-screen
        if (bird.side === 'left' && bird.x > canvas.width + 100) {
          Object.assign(bird, createBird(canvas.width, canvas.height, 0));
          bird.side = 'left';
          bird.x = -80;
          bird.speed = Math.abs(bird.speed);
          bird.active = true;
          bird.opacity = 0;
          bird.delay = 0;
        } else if (bird.side === 'right' && bird.x < -100) {
          Object.assign(bird, createBird(canvas.width, canvas.height, 0));
          bird.side = 'right';
          bird.x = canvas.width + 80;
          bird.speed = -Math.abs(bird.speed);
          bird.active = true;
          bird.opacity = 0;
          bird.delay = 0;
        }

        ctx.save();
        ctx.translate(bird.x, bird.y);
        // Flip horizontally for right-to-left birds
        if (bird.speed < 0) ctx.scale(-1, 1);
        drawBird(ctx, wingAngle, bird.scale, bird.opacity);
        ctx.restore();
      });

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 2,
      }}
    />
  );
};

export default BirdCanvas;
