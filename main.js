// Main JavaScript for 290045's Hub
// Handles tab switching, link opening, cloaks, themes, panic hotkey, and particle effects

(function() {
  const STORAGE_KEYS = {
    title: 'cloakTitle',
    favicon: 'cloakFavicon',
    panic: 'panicKey'
  };

  const PANIC_REDIRECT = 'https://google.com';

  // ================= PARTICLE SYSTEM =================
  class Particle {
    constructor(x, y, canvas) {
      this.x = x;
      this.y = y;
      this.canvas = canvas;
      this.vx = (Math.random() - 0.5) * 2;
      this.vy = (Math.random() - 0.5) * 2 - 0.5;
      this.radius = Math.random() * 2 + 0.5;
      this.opacity = Math.random() * 0.5 + 0.2;
      this.life = Math.random() * 100 + 50;
      this.maxLife = this.life;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += 0.1; // gravity
      this.life--;
      this.opacity = (this.life / this.maxLife) * 0.5;
    }

    draw(ctx) {
      ctx.fillStyle = `rgba(100, 200, 255, ${this.opacity})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    isAlive() {
      return this.life > 0 && this.y < this.canvas.height;
    }
  }

  let particles = [];
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;

  function initParticles() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const ctx = canvas.getContext('2d');

    // Create initial particles
    for (let i = 0; i < 50; i++) {
      particles.push(new Particle(Math.random() * canvas.width, Math.random() * canvas.height, canvas));
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particles = particles.filter(p => p.isAlive());
      particles.forEach(p => {
        p.update();
        p.draw(ctx);
      });

      // Add new particles occasionally
      if (Math.random() < 0.3) {
        particles.push(new Particle(mouseX + (Math.random() - 0.5) * 100, mouseY + (Math.random() - 0.5) * 100, canvas));
      }

      // Draw connecting lines
      ctx.strokeStyle = 'rgba(100, 200, 255, 0.1)';
      ctx.lineWidth = 1;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 150) {
            ctx.globalAlpha = 0.1 * (1 - distance / 150);
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      }

      requestAnimationFrame(animate);
    }

    animate();
  }

  // Track mouse position for particle generation
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Generate particles on cursor
    for (let i = 0; i < 2; i++) {
      particles.push(new Particle(mouseX + (Math.random() - 0.5) * 50, mouseY + (Math.random() - 0.5) * 50, document.getElementById('particleCanvas')));
    }
  });

  // Handle window resize
  window.addEventListener('resize', () => {
    const canvas = document.getElementById('particleCanvas');
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  });

  // ================= TAB & UI FUNCTIONS =================
  function switchTab(id) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    const target = document.getElementById(id);
    if (target) target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleLinkClick(url) {
    if (!url || url === 'test') return alert('Coming soon...');
    try {
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (e) {
      location.href = url;
    }
  }

  // Cloak helpers
  function setFavicon(href) {
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = href;
  }

  function applyCloak(title, favicon) {
    if (title) document.title = title;
    if (favicon) setFavicon(favicon);
  }

  function setUserCloak(preset) {
    if (preset === 'reset') {
      localStorage.removeItem(STORAGE_KEYS.title);
      localStorage.removeItem(STORAGE_KEYS.favicon);
      alert('Tab settings restored! Reloading page...');
      location.reload();
      return;
    }

    let title = null, favicon = null;
    if (preset === 'googleDrive') {
      title = 'My Drive - Google Drive';
      favicon = 'https://gstatic.com';
    } else if (preset === 'googleClassroom') {
      title = 'Home';
      favicon = 'https://gstatic.com';
    } else if (preset === 'canvas') {
      title = 'Dashboard';
      favicon = 'https://cloudfront.net';
    }

    if (title) localStorage.setItem(STORAGE_KEYS.title, title);
    if (favicon) localStorage.setItem(STORAGE_KEYS.favicon, favicon);
    applyCloak(title, favicon);
    alert(`${preset} cloak applied successfully!`);
  }

  function applyCustomCloak() {
    const titleInput = document.getElementById('customTitleInput');
    const iconInput = document.getElementById('customIconInput');
    if (!titleInput || !iconInput) return alert('Inputs not found');

    const title = titleInput.value.trim();
    const favicon = iconInput.value.trim();

    if (!title && !favicon) return alert('Please enter a title or URL first.');

    if (title) localStorage.setItem(STORAGE_KEYS.title, title);
    if (favicon) localStorage.setItem(STORAGE_KEYS.favicon, favicon);
    applyCloak(title, favicon);
    alert('Custom configuration applied!');
  }

  // Panic hotkey
  let listeningForPanic = false;

  function startListeningForPanicKey() {
    const display = document.getElementById('panicKeyDisplay');
    if (!display || listeningForPanic) return;

    listeningForPanic = true;
    display.classList.add('listening');
    display.textContent = 'Press any key...';

    function keyHandler(e) {
      e.preventDefault();
      
      if (e.key === 'Escape') {
        listeningForPanic = false;
        display.classList.remove('listening');
        updatePanicDisplay();
        window.removeEventListener('keydown', keyHandler);
        return;
      }

      localStorage.setItem(STORAGE_KEYS.panic, e.key);
      listeningForPanic = false;
      display.classList.remove('listening');
      updatePanicDisplay();
      window.removeEventListener('keydown', keyHandler);
    }

    window.addEventListener('keydown', keyHandler);
  }

  function clearPanicKey() {
    localStorage.removeItem(STORAGE_KEYS.panic);
    updatePanicDisplay();
  }

  function updatePanicDisplay() {
    const display = document.getElementById('panicKeyDisplay');
    const key = localStorage.getItem(STORAGE_KEYS.panic);
    if (!display) return;
    display.textContent = key ? `Key: ${key.toUpperCase()}` : 'No Key Set';
  }

  function handlePanicKey(e) {
    if (listeningForPanic) return;
    const key = localStorage.getItem(STORAGE_KEYS.panic);
    if (!key) return;

    if (e.key.toLowerCase() === key.toLowerCase()) {
      e.preventDefault();
      location.replace(PANIC_REDIRECT);
    }
  }

  // Init Execution Loop
  function init() {
    // Initialize particle system
    initParticles();

    // Map functions to global scope
    window.switchTab = switchTab;
    window.handleLinkClick = handleLinkClick;
    window.setUserCloak = setUserCloak;
    window.applyCustomCloak = applyCustomCloak;
    window.setPanicKey = startListeningForPanicKey;
    window.clearPanicKey = clearPanicKey;

    // Apply saved configurations
    const savedTitle = localStorage.getItem(STORAGE_KEYS.title);
    const savedFavicon = localStorage.getItem(STORAGE_KEYS.favicon);
    if (savedTitle || savedFavicon) applyCloak(savedTitle, savedFavicon);

    updatePanicDisplay();
    window.addEventListener('keydown', handlePanicKey);

    // Default fallback to homepage
    const active = document.querySelector('.tab-content.active');
    if (!active) switchTab('homepage');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
