// Main JavaScript for 290045's Hub
// Handles tab switching, link opening, cloaks, themes, panic hotkey, and constellation particle effects

// CONFIGURATION
const IS_MAINTENANCE_ON = true; // Set to true to lock site, false to open

// PASTE YOUR GENERATED SHA-256 STRING HERE (This matches "Password")
const HASHED_PASSWORD = "c672b144bc343272900bfa51c8db1a196e9da89f2a009d6f83ec5cbf5d70b793";

document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("maintenance-overlay");
  const isDev = sessionStorage.getItem("dev_authenticated");
  const passwordInput = document.getElementById("dev-password");
  const errorMsg = document.getElementById("error-msg");

  // Force clean the error message
  if (errorMsg) {
    errorMsg.classList.add("hidden");
  }

  // CONTROLLING OVERLAY VISIBILITY
  if (overlay) {
    if (IS_MAINTENANCE_ON && isDev !== "true") {
      // Clear inline overrides and reveal the lock screen
      overlay.style.removeProperty("display");
      overlay.classList.remove("hidden");
    } else {
      // Hard block it from showing up completely
      overlay.classList.add("hidden");
      overlay.style.setProperty("display", "none", "important");
    }
  }

  // Monitor the Enter key inside the passcode field
  if (passwordInput) {
    passwordInput.addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        checkPassword();
      }
    });
  }
});

// Securely hash the text passcode input and evaluate
async function checkPassword() {
  const inputField = document.getElementById("dev-password");
  const errorMsg = document.getElementById("error-msg");
  const overlay = document.getElementById("maintenance-overlay");
  const box = document.querySelector(".maintenance-box");

  if (!inputField || !errorMsg || !overlay) return;

  const inputValue = inputField.value;

  // Generate cryptographic hash signature natively in the browser
  const msgBuffer = new TextEncoder().encode(inputValue);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const inputHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  if (inputHash === HASHED_PASSWORD) {
    sessionStorage.setItem("dev_authenticated", "true");
    errorMsg.classList.add("hidden");
    overlay.classList.add("hidden");
    overlay.style.setProperty("display", "none", "important");
  } else {
    errorMsg.classList.remove("hidden");
    if (box) {
      box.style.animation = "none";
      setTimeout(() => {
        box.style.animation = "fadeIn 0.4s";
      }, 10);
    }
  }
}

// ================= CLOAKING =================
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

  // ================= CONSTELLATION MOUSE-INTERACTIVE ENGINE =================
  let canvas, ctx;
  let particles = [];
  const PARTICLE_COUNT = 65; 
  const LINK_DISTANCE = 115; 

  // Track mouse coordinates for dynamic interaction
  const mouse = {
    x: null,
    y: null,
    radius: 160 // Connection area around the cursor
  };

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
  });

  class NodeParticle {
    constructor() {
      this.radius = Math.random() * 2 + 1.5; 
      this.x = Math.random() * window.innerWidth;
      this.y = Math.random() * window.innerHeight;
      this.vx = (Math.random() - 0.5) * 0.8; 
      this.vy = (Math.random() - 0.5) * 0.8;
    }

    update() {
      // Pull particles slightly toward the cursor when nearby
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          this.x += (dx / dist) * force * 0.6;
          this.y += (dy / dist) * force * 0.6;
        }
      }

      this.x += this.vx;
      this.y += this.vy;

      // Screen wrapping rules
      if (this.x < 0) this.x = canvas.width;
      if (this.x > canvas.width) this.x = 0;
      if (this.y < 0) this.y = canvas.height;
      if (this.y > canvas.height) this.y = 0;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fill();
    }
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      // Create lines directly between particles and the cursor
      if (mouse.x !== null && mouse.y !== null) {
        const mdx = particles[i].x - mouse.x;
        const mdy = particles[i].y - mouse.y;
        const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mDist < mouse.radius) {
          const mOpacity = (1 - mDist / mouse.radius) * 0.35;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(100, 200, 255, ${mOpacity})`;
          ctx.lineWidth = 1.0;
          ctx.stroke();
        }
      }

      // Create lines between neighboring nodes
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < LINK_DISTANCE) {
          const opacity = (1 - distance / LINK_DISTANCE) * 0.22;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(100, 180, 255, ${opacity})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
  }

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function renderLoop() {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawConnections();

    particles.forEach(p => {
      p.update();
      p.draw();
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
      particles.push(new NodeParticle());
    }

    renderLoop();
  }

  // ================= INIT EXECUTION LOOP =================
  function init() {
    initParticles();

    // Map features cleanly to global scope windows
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
