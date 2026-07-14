// Main JavaScript for 290045's Hub
// Handles tab switching, link opening, cloaks, themes, panic hotkey, and constellation particle effects

document.addEventListener("DOMContentLoaded", () => {
  // Grab Theme Element Targets
  const presetSelect = document.getElementById("preset-selector");
  const customControls = document.getElementById("custom-theme-controls");
  const customBgInput = document.getElementById("custom-bg");
  const customTextInput = document.getElementById("custom-text");
  const fontSelect = document.getElementById("font-selector");
  const cursorSelect = document.getElementById("cursor-selector");

  // Read saved client specifications out of storage
  const savedPreset = localStorage.getItem("theme-preset") || "dark";
  const savedFont = localStorage.getItem("theme-font") || "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  const savedCursor = localStorage.getItem("theme-cursor") || "default";

  // Assign interface positions 
  if (presetSelect) presetSelect.value = savedPreset;
  if (fontSelect) fontSelect.value = savedFont;
  if (cursorSelect) cursorSelect.value = savedCursor;

  // Process system visibility mappings instantly on boot
  applyThemePreset(savedPreset);
  document.documentElement.style.setProperty("--font-family", savedFont);
  document.documentElement.style.setProperty("--cursor-type", savedCursor);

  // Monitor Theme Changes
  if (presetSelect) {
    presetSelect.addEventListener("change", (e) => {
      const selection = e.target.value;
      localStorage.setItem("theme-preset", selection);
      applyThemePreset(selection);
    });
  }

  function applyThemePreset(preset) {
    if (!customControls) return;
    
    if (preset === "custom") {
      customControls.style.setProperty("display", "flex", "important");
      customControls.classList.remove("hidden");
      
      const customBg = localStorage.getItem("custom-bg-color") || "#07070a";
      const customText = localStorage.getItem("custom-text-color") || "#ffffff";
      
      if (customBgInput) customBgInput.value = customBg;
      if (customTextInput) customTextInput.value = customText;
      
      document.documentElement.removeAttribute("data-theme");
      document.documentElement.style.setProperty("--bg-color", customBg);
      document.documentElement.style.setProperty("--text-main", customText);
    } else {
      customControls.style.setProperty("display", "none", "important");
      customControls.classList.add("hidden");
      document.documentElement.style.removeProperty("--bg-color");
      document.documentElement.style.removeProperty("--text-main");
      document.documentElement.setAttribute("data-theme", preset);
    }
  }

  // Monitor Custom Hex Inputs live tracking
  [customBgInput, customTextInput].forEach(input => {
    if (input) {
      input.addEventListener("input", () => {
        if (presetSelect && presetSelect.value === "custom") {
          document.documentElement.style.setProperty("--bg-color", customBgInput.value);
          document.documentElement.style.setProperty("--text-main", customTextInput.value);
          localStorage.setItem("custom-bg-color", customBgInput.value);
          localStorage.setItem("custom-text-color", customTextInput.value);
        }
      });
    }
  });

  // Typography Engine Mapping
  if (fontSelect) {
    fontSelect.addEventListener("change", (e) => {
      const selectedFont = e.target.value;
      document.documentElement.style.setProperty("--font-family", selectedFont);
      localStorage.setItem("theme-font", selectedFont);
    });
  }

  // Custom System Cursor Engine Mapping
  if (cursorSelect) {
    cursorSelect.addEventListener("change", (e) => {
      const selectedCursor = e.target.value;
      document.documentElement.style.setProperty("--cursor-type", selectedCursor);
      localStorage.setItem("theme-cursor", selectedCursor);
    });
  }
});

// CONFIGURATION
const IS_MAINTENANCE_ON = true; // Set to true to lock site, false to open

// This is the verified SHA-256 hash for "password"
const HASHED_PASSWORD = "aaa065eb6460b9d4d1e824de3422738595646507678efad38d20f52f20bb5272";

document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("maintenance-overlay");
  const isDev = sessionStorage.getItem("dev_authenticated");
  const passwordInput = document.getElementById("dev-password");
  const errorMsg = document.getElementById("error-msg");

  if (errorMsg) {
    errorMsg.classList.add("hidden");
  }

  if (overlay) {
    if (IS_MAINTENANCE_ON && isDev !== "true") {
      overlay.style.removeProperty("display");
      overlay.classList.remove("hidden");
    } else {
      overlay.classList.add("hidden");
      overlay.style.setProperty("display", "none", "important");
    }
  }

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

  try {
    // 1. Encode password text to bytes
    const msgBuffer = new TextEncoder().encode(inputValue);
    
    // 2. Natively hash using browser Crypto API
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    
    // 3. FOOLPROOF FIX: Reliable byte-to-hex converter mapping
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const inputHash = hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join('');

    // 4. Compare strings
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
  } catch (error) {
    console.error("Cryptographic evaluation failed:", error);
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
