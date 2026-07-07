// Main JavaScript for 290045's Hub
// Handles tab switching, link opening, cloaks, themes, and panic hotkey

(function() {
  const STORAGE_KEYS = {
    title: 'cloakTitle',
    favicon: 'cloakFavicon',
    theme: 'cloakTheme',
    panic: 'panicKey'
  };

  function switchTab(id) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    const target = document.getElementById(id);
    if (target) target.classList.add('active');
    window.scrollTo({top:0,behavior:'smooth'});
  }

  function handleLinkClick(url) {
    if (!url || url === 'test') return alert('Coming soon...');
    // open in a new tab for external links, same tab for same-origin if desired
    try {
      window.open(url, '_blank', 'noopener');
    } catch (e) {
      location.href = url;
    }
  }

  // Cloak helpers
  function setFavicon(href) {
    if (!href) return removeFavicon();
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = href;
  }
  function removeFavicon() {
    const link = document.querySelector("link[rel~='icon']");
    if (link) link.remove();
  }

  function applyCloak(title, favicon) {
    if (title) document.title = title;
    if (favicon) setFavicon(favicon);
  }

  function setUserCloak(preset) {
    if (preset === 'reset') {
      localStorage.removeItem(STORAGE_KEYS.title);
      localStorage.removeItem(STORAGE_KEYS.favicon);
      localStorage.removeItem(STORAGE_KEYS.theme);
      location.reload();
      return;
    }

    let title = null, favicon = null;
    if (preset === 'googleDrive') {
      title = 'My Drive - Google Drive';
      favicon = 'https://ssl.gstatic.com/docs/doclist/images/drive_2020q4_48dp.png';
    } else if (preset === 'googleClassroom') {
      title = 'Classroom';
      favicon = 'https://www.gstatic.com/images/branding/product/1x/classroom_48dp.png';
    } else if (preset === 'canvas') {
      title = 'Canvas';
      favicon = 'https://about.instructure.com/assets/images/favicon.ico';
    }

    if (title) localStorage.setItem(STORAGE_KEYS.title, title);
    if (favicon) localStorage.setItem(STORAGE_KEYS.favicon, favicon);
    applyCloak(localStorage.getItem(STORAGE_KEYS.title), localStorage.getItem(STORAGE_KEYS.favicon));
  }

  function applyCustomCloak() {
    const titleInput = document.getElementById('customTitleInput');
    const iconInput = document.getElementById('customIconInput');
    if (!titleInput || !iconInput) return alert('Inputs not found');

    const title = titleInput.value?.trim();
    const favicon = iconInput.value?.trim();
    if (title) localStorage.setItem(STORAGE_KEYS.title, title);
    if (favicon) localStorage.setItem(STORAGE_KEYS.favicon, favicon);
    applyCloak(localStorage.getItem(STORAGE_KEYS.title), localStorage.getItem(STORAGE_KEYS.favicon));
  }

  // Panic hotkey
  let listeningForPanic = false;
  function startListeningForPanicKey() {
    const display = document.getElementById('panicKeyDisplay');
    if (!display) return;
    listeningForPanic = true;
    display.classList.add('listening');
    display.textContent = 'Press any key...';

    function handler(e) {
      const key = e.key;
      localStorage.setItem(STORAGE_KEYS.panic, key);
      stopListeningForPanicKey();
      updatePanicDisplay();
    }

    function stopListeningForPanicKey() {
      listeningForPanic = false;
      display.classList.remove('listening');
      window.removeEventListener('keydown', handler);
    }

    window.addEventListener('keydown', handler, { once: true });
  }

  function clearPanicKey() {
    localStorage.removeItem(STORAGE_KEYS.panic);
    updatePanicDisplay();
  }

  function updatePanicDisplay() {
    const display = document.getElementById('panicKeyDisplay');
    const key = localStorage.getItem(STORAGE_KEYS.panic);
    if (!display) return;
    display.textContent = key ? `Panic: ${key}` : 'No Key Set';
  }

  function handlePanicKey(e) {
    if (listeningForPanic) return; // while setting, ignore
    const key = localStorage.getItem(STORAGE_KEYS.panic);
    if (!key) return;
    if (e.key === key) {
      // Best-effort: try to close, otherwise navigate away and blur
      try { window.close(); } catch (err) {}
      try { location.href = 'about:blank'; window.blur(); } catch (err) {}
    }
  }

  // Init
  function init() {
    // Attach UI handlers that rely on DOM
    window.switchTab = switchTab;
    window.handleLinkClick = handleLinkClick;
    window.setUserCloak = setUserCloak;
    window.applyCustomCloak = applyCustomCloak;
    window.startListeningForPanicKey = startListeningForPanicKey;
    window.clearPanicKey = clearPanicKey;

    // Apply saved cloak
    const savedTitle = localStorage.getItem(STORAGE_KEYS.title);
    const savedFavicon = localStorage.getItem(STORAGE_KEYS.favicon);
    if (savedTitle || savedFavicon) applyCloak(savedTitle, savedFavicon);

    // Panic key display
    updatePanicDisplay();
    window.addEventListener('keydown', handlePanicKey);

    // Footer update date
    const updateEl = document.getElementById('update-date');
    if (updateEl) updateEl.textContent = new Date().toLocaleString();

    // Ensure homepage tab active by default
    const active = document.querySelector('.tab-content.active');
    if (!active) switchTab('homepage');
  }

  // Run when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
