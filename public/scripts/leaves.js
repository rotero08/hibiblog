/*
 * Ambient scroll-responsive falling leaves (sakura + momiji).
 *
 * Loaded on both the custom Astro pages (via Layout.astro) and the Starlight
 * documentation pages (via the `head` config). It is idempotent: if a canvas is
 * already animating (for example one preserved across an Astro View Transition
 * with `transition:persist`), it does nothing and the existing animation keeps
 * running uninterrupted. Otherwise it injects/initialises the canvas.
 */
(function () {
  function initLeaves() {
    let canvas = document.getElementById('ambient-canvas');

    // On pages that don't render the canvas themselves (e.g. Starlight docs),
    // create one and place it behind everything.
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'ambient-canvas';
      document.body.prepend(canvas);
    }

    // Already animating (persisted canvas) → leave it alone.
    if (canvas.dataset.leavesActive === 'true') return;
    canvas.dataset.leavesActive = 'true';

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const maxParticles = 38;

    class Leaf {
      constructor() {
        this.reset();
        this.y = Math.random() * height;
      }

      reset() {
        this.x = Math.random() * width;
        this.y = -20;
        this.size = Math.random() * 8 + 5;
        this.speedY = Math.random() * 0.35 + 0.3;
        this.speedX = Math.random() * 0.25 - 0.125;
        this.rotation = Math.random() * Math.PI * 2;
        this.spinSpeed = Math.random() * 0.012 - 0.006;
        this.opacity = Math.random() * 0.3 + 0.18;
        this.swaySpeed = Math.random() * 0.015 + 0.005;
        this.swayValue = Math.random() * Math.PI;
        this.type = Math.random() > 0.45 ? 'sakura' : 'momiji';
        this.flip = 1;
        this.flipSpeed = Math.random() * 0.02 + 0.01;
      }

      update(windY) {
        this.swayValue += this.swaySpeed;
        this.x += Math.sin(this.swayValue) * 0.22 + this.speedX;
        this.y += this.speedY + windY;
        this.rotation += this.spinSpeed;
        this.flip = Math.sin(this.y * this.flipSpeed);

        if (this.y > height + 20 || this.x < -20 || this.x > width + 20) {
          this.reset();
        }
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(1, this.flip);
        ctx.globalAlpha = this.opacity;

        // Dark mode follows Starlight's convention: data-theme on <html>.
        const isDark = document.documentElement.dataset.theme === 'dark';
        ctx.beginPath();

        if (isDark) {
          // night: petals catch the lantern light, pale pink sakura and amber momiji
          ctx.fillStyle = this.type === 'sakura' ? '#f2b8b0' : '#e0a25c';
        } else {
          ctx.fillStyle = this.type === 'sakura' ? '#8B6F47' : '#5A8A72';
        }

        if (this.type === 'sakura') {
          ctx.moveTo(0, -this.size);
          ctx.bezierCurveTo(this.size * 0.55, -this.size * 0.5, this.size * 0.55, this.size * 0.5, 0, this.size);
          ctx.bezierCurveTo(-this.size * 0.55, this.size * 0.5, -this.size * 0.55, -this.size * 0.5, 0, -this.size);
        } else {
          ctx.moveTo(0, -this.size);
          ctx.quadraticCurveTo(this.size * 0.75, -this.size * 0.35, 0, this.size);
          ctx.quadraticCurveTo(-this.size * 0.75, -this.size * 0.35, 0, -this.size);
        }

        ctx.fill();
        ctx.restore();
      }
    }

    for (let i = 0; i < maxParticles; i++) {
      particles.push(new Leaf());
    }

    let lastScrollY = window.scrollY;
    let scrollVelocity = 0;
    let targetScrollVelocity = 0;

    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      const diff = Math.abs(currentScrollY - lastScrollY);
      targetScrollVelocity = Math.min(diff * 0.15, 5.0);
      lastScrollY = currentScrollY;
    });

    function animate() {
      ctx.clearRect(0, 0, width, height);

      scrollVelocity += (targetScrollVelocity - scrollVelocity) * 0.08;
      targetScrollVelocity *= 0.92;

      for (let i = 0; i < particles.length; i++) {
        particles[i].update(scrollVelocity);
        particles[i].draw();
      }
      requestAnimationFrame(animate);
    }

    animate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLeaves, { once: true });
  } else {
    initLeaves();
  }

  // Re-run after client-side navigations (Astro View Transitions). When the
  // canvas is persisted the active-guard makes this a no-op; otherwise it
  // re-initialises on the freshly swapped page. Bind only once even if this
  // script is evaluated again during a transition.
  if (!window.__hibiLeavesBound) {
    window.__hibiLeavesBound = true;
    document.addEventListener('astro:page-load', initLeaves);
  }
})();
