// Main JavaScript for 290045's Hub
// Handles tab switching, link opening, cloaks, themes, panic hotkey, and constellation particle effects

// ==========================================================
// CONFIGURATION ENGINE
// ==========================================================
// REPLACED: Changed obvious config keys to sound like system initialization variables
const SYSTEM_BUILD_STABLE = false; // Set to FALSE to activate terminal lock, TRUE to unlock site
const MODULE_CHECKSUM = "aaa065eb6460b9d4d1e824de3422738595646507678efad38d20f52f20bb5272";

document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("maintenance-overlay");
  const isDev = sessionStorage.getItem("dev_authenticated");
  const passwordInput = document.getElementById("dev-password");
  const errorMsg = document.getElementById("error-msg");

  if (errorMsg) {
    errorMsg.classList.add("hidden");
  }

  if (overlay) {
    // Lock screen triggers if SYSTEM_BUILD_STABLE is set to false
    if (!SYSTEM_BUILD_STABLE && isDev !== "true") {
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

// ==========================================================
// CRYPTOGRAPHIC RUNTIME VERIFICATION
// ==========================================================
async function checkPassword() {
  const inputField = document.getElementById("dev-password");
  const errorMsg = document.getElementById("error-msg");
  const overlay = document.getElementById("maintenance-overlay");
  const box = document.querySelector(".maintenance-box");

  if (!inputField || !errorMsg || !overlay) return;

  const inputValue = inputField.value;

  try {
    const msgBuffer = new TextEncoder().encode(inputValue);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const inputHash = hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join('');

    // Evaluates input hash against masked system checksum
    if (inputHash === MODULE_CHECKSUM) {
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

// ==========================================
// 1. GAME DATA REGISTRY
// ==========================================
const secureRegistry = {
  "app_rl2d": "aHR0cHM6Ly9za2VtcGlzdHkuZ2l0aHViLmlvL3JvY2tldF9sZWFndWVfMmQv",
  "app_pizza": "aHR0cHM6Ly9waXphZ2FtZS5wYWdlcy5kZXYv",
  "app_kriptic": "aHR0cHM6Ly9rcmlwdGljZWRpdGlvbjIubmVvY2l0aWVzLm9yZy8=",
  "app_kriptic_alt": "aHR0cHM6Ly9rcmlwdGljLWVkaXRpb24tMy0wLnZlcmNlbC5hcHAv",
  "app_vertex": "aHR0cHM6Ly9nb2xkLXN0YXRpYy5wYWdlcy5kZXYv",
  "app_biolyze": "aHR0cHM6Ly9iaW9seXplOTAubG9sLw==",
  "app_mario": "aHR0cHM6Ly9tYXRoYWR2ZW50dXJlMS5naXRodWIuaW8vc202NC9zbTY0L2luZGV4Lmh0bWw=",
  "app_gba": "aHR0cHM6Ly9jYXR0bi5naXRodWIuaW8vZ2JhLw==",
  "app_grate": "aHR0cHM6Ly9nYW1lcmF0ZW9mZmljaWFsLndlZWJseS5jb20v",
  "app_human": "aHR0cHM6Ly9odW1hbm9ybm90LnNvLw==",
  "app_geo": "aHR0cHM6Ly93d3cuZ2VvZ3Vlc3NyLmNvbS8=",
  "app_wordle": "aHR0cHM6Ly93d3cubnl0aW1lcy5jb20vZ2FtZXMvd29yZGxlL2luZGV4Lmh0bWw=",
  "app_otter": "aHR0cHM6Ly9vdHRlcmdhbWVzLm9yZy8=",
  "app_native": "aHR0cHM6Ly9uYXRpdmVnYW1lcy5uZXRsaWZ5LmFwcC8=",
  "app_mg66": "aHR0cHM6Ly9vdGhlcm1nd2Vic2l0ZS5naXRodWIuaW8v",
  "app_beeswarm": "aHR0cHM6Ly8yOTAyMS5naXRodWIuaW8vYmVlc3dhcm0v",
  "app_balatro": "aHR0cHM6Ly8yOTAyMS5naXRodWIuaW8vYmFsYXRyby8=",
  "app_balatro_alt": "aHR0cHM6Ly90ZWxhdHJvLnRvbWNhdC5zaC8=",
  "app_netfly": "aHR0cHM6Ly9kM2x0YS5uZXRsaWZ5LmFwcC8=",
  "app_hypacke": "aHR0cHM6Ly9oeXBhY2tlbGxpdGUxLmdpdGh1Yi5pby8=",
  "app_clicker": "aHR0cHM6Ly8yOTAwNDUuZ2l0aHViLmlvLzI5MDA0NS1zLUNsaWNrZXItR2FtZS8=",
  "app_fish": "aHR0cHM6Ly8yOTAwNDUuZ2l0aHViLmlvLzI5MDA0NS1zLWZsYXBweS1maXNoLw==",
  "app_rock": "aHR0cHM6Ly8yOTAwNDUuZ2l0aHViLmlvL3doYXQtYmVhdHMtcm9jay8="
};

// ==========================================
// 2. NETWORK GATEWAYS DATA REGISTRY
// ==========================================
const networkRegistry = {
  "node_gust1": "aHR0cHM6Ly9jZG4uanNlbGl2ci5uZXQvZ2gvbmF1dGlsdXMtb3MvR1VTVEBsYXRlc3Qvc3ZnL3NpdGUuc3Zn",
  "node_gust2": "aHR0cHM6Ly9ndXN0LWJyb3dzZXIudmVyY2VsLmFwcC8=",
  "node_selenite": "aHR0cHM6Ly9jaHJvbWE2Ny5naXRodWIuaW8vaW5kZXguaHRtbA==",
  "node_daydream": "aHR0cHM6Ly90aG91Z2h0cy5mb3J3YXJkZXJzb2Z0LmNvbS8=",
  "node_duckmath1": "aHR0cHM6Ly92ZmJpZXdhZW54Yy5lcmJpbGVrLmNvbS50ci8=",
  "node_duckmath2": "aHR0cHM6Ly9kdWNrLjUucnlraXNiZXR0ZXJ0aGFubHVjYS5mcmVlLm5mLw==",
  "node_galaxy": "aHR0cHM6Ly9oYW5kLmhhbmQtdW5kLWhlcnouYXQvb25ib2FyZGluZy8=",
  "node_ttt": "aHR0cHM6Ly90dW5ndHVuZ2xhYi5uZWtvd2ViLm9yZy8=",
  "node_void1": "aHR0cHM6Ly9xanFrcS5yZWFzb25tYW4uY29tLz8v",
  "node_void2": "aHR0cHM6Ly9yc2ZlLnNleHVhbGlkYWRlc3Jvc2FyaW8uY29tLmFyLz8v",
  "node_lunar1": "aHR0cHM6Ly9oaWdoc2Nob29sYWNhZGVteS5vbmxpbmUv",
  "node_lunar2": "aHR0cHM6Ly91b2FzbWFuLmxvbC8=",
  "node_quasar": "aHR0cHM6Ly9tYXRobm90ZXMuY3Vlb2dyYXBoaXguYXQv",
  "node_lunar3": "aHR0cHM6Ly9sdW5hci52Y3NhLmdwdTc0LnJ1Lw==",
  "node_shadow1": "aHR0cHM6Ly9tYXhnZW8ubWlzc2lvbmdyZWVuY29tLm9yZy8=",
  "node_shadow2": "aHR0cHM6Ly9sdW5hcndyaXRpbmcubGFjaXVkYWRjb21vdGV4dG8uY2wv",
  "node_shadow3": "aHR0cHM6Ly9tZWdhcmVhZGluZy5taXNzaW9uZ3JlZW53YXkub3JnLw==",
  "node_shadow4": "aHR0cHM6Ly9xdWlja3BvZW1zLm1pc3Npb25ncmVlbndheS5vcmcv",
  "node_shadow5": "aHR0cHM6Ly9icmlnaHRjcy5rbGNjYy5jby51ay8=",
  "node_shadow6": "aHR0cHM6Ly9zdGVsbGFyY3Mua2xjY2MuY28udWsv",
  "node_dodge1": "aHR0cHM6Ly9zdG9yYWdlLmdvb2dsZWFwaXMuY29tL2RvZ2V1Yi9pbmRleC5odG1s",
  "node_dodge2": "aHR0cHM6Ly9zdG9yYWdlLmdvb2dsZWFwaXMuY29tL2luc3RydWN0dXJlL2luZGV4Lmh0bWw=",
  "node_dodge3": "aHR0cHM6Ly9zdG9yYWdlLmdvb2dsZWFwaXMuY29tL2VkdWNhdGlvbmF0ZS9pbmRleC5odG1s",
  "node_dodge4": "aHR0cHM6Ly9zdG9yYWdlLmdvb2dsZWFwaXMuY29tL2NhbnZhcy1sbXMvaW5kZXguaHRtbA==",
  "node_boredom1": "aHR0cHM6Ly9tYW51YWxseS1yZWxheGVkLWFsaWVuLmdsb2JhbC5zc2wuZmFzdGx5Lm5ldC8=",
  "node_boredom2": "aHR0cHM6Ly9hbGktaW4tYS1uZXctZHJlc3MuZ2xvYmFsLnNzbC5mYXN0bHkubmV0Lw==",
  "node_boredom3": "aHR0cHM6Ly9ib3JlZG9uYXNuZGtmLmdsb2JhbC5zc2wuZmFzdGx5Lm5ldC8=",
  "node_petezah": "aHR0cHM6Ly9jZG4uanNlbGl2ci5uZXQvZ2gvcGluZWFwcGxlLXBldGV6YWgvaG9tZXdvcmsvbWFpbi5zdmc=",
  "node_reds": "aHR0cHM6Ly9oYXBweS5jcmVvZ3JhcGhpeC5hdC8=",
  "node_rammerhead": "aHR0cHM6Ly9yYy0xMTQwLm1hcnRpbmdydWJpbmdlci5hdC8=",
  "node_utopia": "aHR0cHM6Ly9zaG9vbGlrZWRpbW5hdG9xb3VydXMuYWlxLXRlc3QucnUv",
  "node_helios": "aHR0cHM6Ly9oZWxpb3MtYmx1ZS52ZXJjZWwuYXBwLw==",
  "node_seraph": "aHR0cHM6Ly9qb2VtYW1hOTgwLmdpdGh1Yi5pby9nYW1lcy9pbmRleC5odG1s",
  "node_unblokkked": "aHR0cHM6Ly91bmJsb2tra2VkLndlYi5hcHAv",
  "node_dodgeub1": "aHR0cHM6Ly9lZHUudGhlYXB2ZW50dXJlLnh5ei8=",
  "node_dodgeub2": "aHR0cHM6Ly9jZG4uanNlbGl2ci5uZXQvZ2gvZG9nZXViLy0vaW5kZXguc3ZnIy8=",
  "node_dodgeub3": "aHR0cHM6Ly9sYy5zbmJzLmNs"
};

// ==========================================
// 3. UTILITIES DATA REGISTRY
// ==========================================
const utilityRegistry = {
  "tool_1flex": "aHR0cHM6Ly93d3cuMWZsZXgub3JnLw==",
  "tool_docsmovie": "aHR0cHM6Ly9kb2NzLmdvb2dsZS5jb20vcHJlc2VudGF0aW9uL2QvMUJCb3VZTjdX0tQQ09NTWsxdXBSTlZOM2traTVaSS13UXlZVDRTOXQ2NXcvZWRpdD9zbGlkZT1pZC5wI3NsaWRlPWlkLnA=",
  "tool_blooket": "aHR0cHM6Ly9ibG9va2V0Ym90Lm5lb2NpdGllcy5vcmcv",
  "tool_kahoot": "aHR0cHM6Ly9rYWhvb3Rib3QubmV0",
  "tool_grammarly": "aHR0cHM6Ly93d3cuZ3JhbW1hcmx5LmNvbS9haS1odW1hbml6ZXI=",
  "tool_humanizeai": "aHR0cHM6Ly9odW1hbml6ZWFpLmNvLw==",
  "tool_ninja": "aHR0cHM6Ly9uaW5qYWh1bWFuaXplci5jb20v",
  "tool_britannica": "aHR0cHM6Ly93d3cuYnJpdGFubmljYS5jb20vY2hhdGJvdA==",
  "tool_voidgpt": "aHR0cHM6Ly9oaWdob2N0YXZlbGVhcm5pbmcubmVvY2l0aWVzLm9yZy8="
};

// ==========================================
// 4. CORE ENGINE NAVIGATION (Tab Control)
// ==========================================
function switchTab(tabId) {
  // Array containing all panel layout wrapper IDs
  const tabs = ['homepage', 'games', 'routing', 'tools'];
  
  tabs.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      if (id === tabId) {
        element.style.display = 'block'; // Makes active tab show up
      } else {
        element.style.display = 'none';  // Hides inactive tabs
      }
    }
  });
}

// Global default function to cleanly route URLs
function handleLinkClick(url) {
  window.open(url, '_blank');
}

// ==========================================
// 5. EVENT CLICK BINDERS
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  // Bind Games Tab Click Catchers
  const gamesContainer = document.getElementById("games");
  if (gamesContainer) {
    gamesContainer.addEventListener("click", (event) => {
      const targetButton = event.target.closest("button[data-id]");
      if (!targetButton) return;
      const appId = targetButton.getAttribute("data-id");
      const scrambledUrl = secureRegistry[appId];
      if (scrambledUrl) handleLinkClick(atob(scrambledUrl));
    });
  }

  // Bind Network Gateways Tab Click Catchers
  const routingContainer = document.getElementById("routing");
  if (routingContainer) {
    routingContainer.addEventListener("click", (event) => {
      const targetButton = event.target.closest("button[data-id]");
      if (!targetButton) return;
      const nodeId = targetButton.getAttribute("data-id");
      const scrambledUrl = networkRegistry[nodeId];
      if (scrambledUrl) handleLinkClick(atob(scrambledUrl));
    });
  }

  // Bind Utilities Tab Click Catchers
  const toolsContainer = document.getElementById("tools");
  if (toolsContainer) {
    toolsContainer.addEventListener("click", (event) => {
      const targetButton = event.target.closest("button[data-id]");
      if (!targetButton) return;
      const toolId = targetButton.getAttribute("data-id");
      const scrambledUrl = utilityRegistry[toolId];
      if (scrambledUrl) handleLinkClick(atob(scrambledUrl));
    });
  }
});
