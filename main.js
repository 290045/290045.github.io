// Main JavaScript for 290045's Hub
// Handles tab switching, link opening, cloaks, themes, panic hotkey, and particle effects

(function() {
  const STORAGE_KEYS = {
    title: 'cloakTitle',
    favicon: 'cloakFavicon',
    panic: 'panicKey'
  };

  const PANIC_REDIRECT = 'https://google.com';

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

  // ================= LIQUID GLASS PARTICLE ENGINE (iOS 26 SPEC) =================
  let canvas, ctx;
  let particles = [];
  const PARTICLE_COUNT = 18; // Clean, high-performance blob consolidation count

  class LiquidBlob {
    constructor() {
      // Oversized dimensions keep components interlinking under the contrast mask
      this.radius = Math.random() * 60 + 75; 
      this.x = Math.random() * window.innerWidth;
      this.y = Math.random() * window.innerHeight;
      this.vx = (Math.random() - 0.5) * 1.5;
      this.vy = (Math.random() - 0.5) * 1.5;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      // Handle bounce properties safely relative to layout bounds
      if (this.x - this.radius < 0 || this.x + this.radius > canvas.width) this.vx *= -1;
      if (this.y - this.radius < 0 || this.y + this.radius > canvas.height) this.vy *= -1;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }
  }

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // Re-initialize boundaries smoothly if scaling transitions dramatically
    if (particles.length > 0) {
      particles.forEach(p => {
        if (p.x > canvas.width) p.x = canvas.width - p.radius;
        if (p.y > canvas.height) p.y = canvas.height - p.radius;
      });
    }
  }

  function renderLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach(blob => {
      blob.update();
      blob.draw();
    });

    requestAnimationFrame(renderLoop);
  }

  function initParticles() {
    canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    
    ctx = canvas.getContext('2d');
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new LiquidBlob());
    }

    renderLoop();
  }

  // ================= INIT EXECUTION LOOP =================
  function init() {
    initParticles();

    window.switchTab = switchTab;
    window.handleLinkClick = handleLinkClick;
    window.setUserCloak = setUserCloak;
    window.applyCustomCloak = applyCustomCloak;
    window.setPanicKey = startListeningForPanicKey;
    window.clearPanicKey = clearPanicKey;

    const savedTitle = localStorage.getItem(STORAGE_KEYS.title);
    const savedFavicon = localStorage.getItem(STORAGE_KEYS.favicon);
    if (savedTitle || savedFavicon) applyCloak(savedTitle, savedFavicon);

    updatePanicDisplay();
    window.addEventListener('keydown', handlePanicKey);

    const active = document.querySelector('.tab-content.active');
    if (!active) switchTab('homepage');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
