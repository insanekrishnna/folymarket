/**
 * Minimal themed confetti using pitch green, card red, trophy gold, blue, and
 * white. Mounts a non-interactive fullscreen canvas, fires a burst from the
 * upper center, and cleans itself up when the animation ends.
 * Respeta `prefers-reduced-motion`.
 */
export function fireConfetti(opts?: { particles?: number }) {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText =
    "position:fixed;inset:0;pointer-events:none;z-index:9999";
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    canvas.remove();
    return;
  }

  const colors = [
    "oklch(0.74 0.18 162)", // pitch green
    "oklch(0.65 0.22 25)", // card red
    "oklch(0.82 0.15 92)", // trophy gold
    "oklch(0.62 0.16 258)", // blue
    "#ffffff",
  ];

  const N = opts?.particles ?? 120;
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight * 0.35;

  type P = {
    x: number;
    y: number;
    vx: number;
    vy: number;
    rot: number;
    vr: number;
    size: number;
    color: string;
  };

  const parts: P[] = Array.from({ length: N }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = 4 + Math.random() * 9;
    return {
      x: cx + (Math.random() - 0.5) * 160,
      y: cy + (Math.random() - 0.5) * 40,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 4,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.35,
      size: 6 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
    };
  });

  const start = performance.now();
  const duration = 2600;
  const gravity = 0.34;
  let raf = 0;

  const tick = (t: number) => {
    const elapsed = t - start;
    const life = Math.max(0, 1 - elapsed / duration);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const p of parts) {
      p.vy += gravity;
      p.vx *= 0.995;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = life;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.55);
      ctx.restore();
    }

    if (elapsed < duration) {
      raf = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(raf);
      canvas.remove();
    }
  };
  raf = requestAnimationFrame(tick);
}
