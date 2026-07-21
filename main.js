// Main JavaScript for 290045's Hub
// Handles tab switching, link opening, cloaks, themes, and panic hotkeys safely

const IS_MAINTENANCE_ON = false;
const HASHED_PASSWORD = "aaa065eb6460b9d4d1e824de3422738595646507678efad38d20f52f20bb5272";
const PANIC_REDIRECT = 'https://google.com';

const STORAGE_KEYS = {
  title: 'cloakTitle',
  favicon: 'cloakFavicon',
  panic: 'panicKey'
};

// ================= SAFETY LAYER FOR ELEMENT LOOKUPS =================
function safeListener(id, event, callback) {
  const el = document.getElementById(id);
  if (el) el.addEventListener(event, callback);
}

// ================= MAINTENANCE OVERLAY SYSTEM =================
document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("maintenance-overlay");
  const isDev = sessionStorage.getItem("dev_authenticated");
  const errorMsg = document.getElementById("error-msg");

  if (errorMsg) errorMsg.classList.add("hidden");

  if (overlay) {
    if (IS_MAINTENANCE_ON && isDev !== "true") {
      overlay.style.removeProperty("display");
      overlay.classList.remove("hidden");
    } else {
      overlay.classList.add("hidden");
      overlay.style.setProperty("display", "none", "important");
    }
  }

  safeListener("dev-password", "keypress", (event) => {
    if (event.key === "Enter") checkPassword();
  });
});

async function checkPassword() {
  const inputField = document.getElementById("dev-password");
  const errorMsg = document.getElementById("error-msg");
  const overlay = document.getElementById("maintenance-overlay");
  const box = document.querySelector(".maintenance-box");

  if (!inputField || !errorMsg || !overlay) return;

  try {
    const msgBuffer = new TextEncoder().encode(inputField.value);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const inputHash = hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join('');

    if (inputHash === HASHED_PASSWORD) {
      sessionStorage.setItem("dev_authenticated", "true");
      errorMsg.classList.add("hidden");
      overlay.classList.add("hidden");
      overlay.style.setProperty("display", "none", "important");
    } else {
      errorMsg.classList.remove("hidden");
      if (box) {
        box.style.animation = "none";
        setTimeout(() => { box.style.animation = "fadeIn 0.4s"; }, 10);
      }
    }
  } catch (error) {
    console.error("Cryptographic evaluation failed:", error);
  }
}

// ================= DYNAMIC THEME SYSTEM =================
document.addEventListener("DOMContentLoaded", () => {
  const presetSelect = document.getElementById("preset-selector");
  const fontSelect = document.getElementById("font-selector");
  const cursorSelect = document.getElementById("cursor-selector");

  const savedPreset = localStorage.getItem("theme-preset") || "dark";
  const savedFont = localStorage.getItem("theme-font") || "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  const savedCursor = localStorage.getItem("theme-cursor") || "default";

  if (presetSelect) presetSelect.value = savedPreset;
  if (fontSelect) fontSelect.value = savedFont;
  if (cursorSelect) cursorSelect.value = savedCursor;

  applyThemePreset(savedPreset);
  document.documentElement.style.setProperty("--font-family", savedFont);
  document.documentElement.style.setProperty("--cursor-type", savedCursor);

  safeListener("preset-selector", "change", (e) => {
    localStorage.setItem("theme-preset", e.target.value);
    applyThemePreset(e.target.value);
  });

  function applyThemePreset(preset) {
    const customControls = document.getElementById("custom-theme-controls");
    if (preset === "custom") {
      if (customControls) {
        customControls.style.setProperty("display", "flex", "important");
        customControls.classList.remove("hidden");
      }
      const customBg = localStorage.getItem("custom-bg-color") || "#07070a";
      const customText = localStorage.getItem("custom-text-color") || "#ffffff";
      
      const bgInput = document.getElementById("custom-bg");
      const textInput = document.getElementById("custom-text");
      if (bgInput) bgInput.value = customBg;
      if (textInput) textInput.value = customText;
      
      document.documentElement.removeAttribute("data-theme");
      document.documentElement.style.setProperty("--bg-color", customBg);
      document.documentElement.style.setProperty("--text-main", customText);
    } else {
      if (customControls) {
        customControls.style.setProperty("display", "none", "important");
        customControls.classList.add("hidden");
      }
      document.documentElement.style.removeProperty("--bg-color");
      document.documentElement.style.removeProperty("--text-main");
      document.documentElement.setAttribute("data-theme", preset);
    }
  }

  ['custom-bg', 'custom-text'].forEach(id => {
    safeListener(id, "input", () => {
      const bgInput = document.getElementById("custom-bg");
      const textInput = document.getElementById("custom-text");
      const presetSelect = document.getElementById("preset-selector");
      if (presetSelect && presetSelect.value === "custom" && bgInput && textInput) {
        document.documentElement.style.setProperty("--bg-color", bgInput.value);
        document.documentElement.style.setProperty("--text-main", textInput.value);
        localStorage.setItem("custom-bg-color", bgInput.value);
        localStorage.setItem("custom-text-color", textInput.value);
      }
    });
  });

  safeListener("font-selector", "change", (e) => {
    document.documentElement.style.setProperty("--font-family", e.target.value);
    localStorage.setItem("theme-font", e.target.value);
  });

  safeListener("cursor-selector", "change", (e) => {
    document.documentElement.style.setProperty("--cursor-type", e.target.value);
    localStorage.setItem("theme-cursor", e.target.value);
  });
});

// ================= GLOBAL ACTIONS =================
function switchTab(id) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  const target = document.getElementById(id);
  if (target) target.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleLinkClick(url) {
  if (!url || url === 'test') return alert('Coming soon...');
  try { window.open(url, '_blank', 'noopener,noreferrer'); } catch (e) { location.href = url; }
}

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
  if (preset === 'googleDrive') { title = 'My Drive - Google Drive'; favicon = 'https://gstatic.com'; }
  else if (preset === 'googleClassroom') { title = 'Home'; favicon = 'https://gstatic.com'; }
  else if (preset === 'canvas') { title = 'Dashboard'; favicon = 'https://cloudfront.net'; }

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
  if (!display) return;
  const key = localStorage.getItem(STORAGE_KEYS.panic);
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

// Global scope mapping
window.switchTab = switchTab;
window.handleLinkClick = handleLinkClick;
window.setUserCloak = setUserCloak;
window.applyCustomCloak = applyCustomCloak;
window.setPanicKey = startListeningForPanicKey;
window.clearPanicKey = clearPanicKey;

document.addEventListener("DOMContentLoaded", () => {
