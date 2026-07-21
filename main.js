// Main JavaScript for 290045's Hub
// Handles tab switching, link opening, cloaks, themes, panic hotkey, and constellation particle effects

// ================= GLOBAL CONFIGURATION LAYER =================
const IS_MAINTENANCE_ON = false; // Set to true to lock site, false to open
const HASHED_PASSWORD = "aaa065eb6460b9d4d1e824de3422738595646507678efad38d20f52f20bb5272";
const PANIC_REDIRECT = 'https://google.com';

const STORAGE_KEYS = {
  title: 'cloakTitle',
  favicon: 'cloakFavicon',
  panic: 'panicKey'
};

// ================= MAINTENANCE OVERLAY SYSTEM =================
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
    const msgBuffer = new TextEncoder().encode(inputValue);
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
        setTimeout(() => {
          box.style.animation = "fadeIn 0.4s";
        }, 10);
      }
    }
  } catch (error) {
    console.error("Cryptographic evaluation failed:", error);
  }
}

// ================= DYNAMIC WORKSPACE THEME PICKER =================
document.addEventListener("DOMContentLoaded", () => {
  const presetSelect = document.getElementById("preset-selector");
  const customControls = document.getElementById("custom-theme-controls");
  const customBgInput = document.getElementById("custom-bg");
  const customTextInput = document.getElementById("custom-text");
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

  if (fontSelect) {
    fontSelect.addEventListener("change", (e) => {
      const selectedFont = e.target.value;
      document.documentElement.style.setProperty("--font-family", selectedFont);
      localStorage.setItem("theme-font", selectedFont);
    });
  }

  if (cursorSelect) {
    cursorSelect.addEventListener("change", (e) => {
      const selectedCursor = e.target.value;
      document.documentElement.style.setProperty("--cursor-type", selectedCursor);
      localStorage.setItem("theme-cursor", selectedCursor);
    });
  }
});

// ================= CORE MODULES & ROUTING ACTIONS =================

// Tab System Toggle Routing
function switchTab(id) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  const target = document.getElementById(id);
  if (target) target.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Security Target Redirect Tracker
function handleLinkClick(url) {
  if (!url || url === 'test') return alert('Coming soon...');
  try {
    window.open(url, '_blank', 'noopener,noreferrer');
  } catch (e) {
    location.href = url;
  }
}

// Cloaking Utilities
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

// Emergency Panic Key Mapping
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
