// Main JavaScript for 290045's Hub
// Handles tab switching, link opening, cloaks, themes, and panic hotkey

(function() {
  const STORAGE_KEYS = {
    title: 'cloakTitle',
    favicon: 'cloakFavicon',
    panic: 'panicKey'
  };

  const PANIC_REDIRECT = 'https://google.com';

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

    // Use a named handler function so it can safely remove itself later
    function keyHandler(e) {
      e.preventDefault();
      
      // Let users exit listening mode safely with Escape key
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
    if (listeningForPanic) return; // Ignore hotkey checks while assigning keys
    const key = localStorage.getItem(STORAGE_KEYS.panic);
    if (!key) return;

    if (e.key.toLowerCase() === key.toLowerCase()) {
      e.preventDefault();
      // Instantly wipe history stack frame so clicking "Back" fails
      location.replace(PANIC_REDIRECT);
    }
  }

  // Init Execution Loop
  function init() {
    // Map functions directly to the global window scope for HTML onclick events
    window.switchTab = switchTab;
    window.handleLinkClick = handleLinkClick;
    window.setUserCloak = setUserCloak;
    window.applyCustomCloak = applyCustomCloak;
    window.setPanicKey = startListeningForPanicKey; // Matches your fixed HTML button name
    window.clearPanicKey = clearPanicKey;

    // Apply saved configurations
    const savedTitle = localStorage.getItem(STORAGE_KEYS.title);
    const savedFavicon = localStorage.getItem(STORAGE_KEYS.favicon);
    if (savedTitle || savedFavicon) applyCloak(savedTitle, savedFavicon);

    updatePanicDisplay();
    window.addEventListener('keydown', handlePanicKey);

    // Default Fallback: Fall straight back onto homepage if view states fail
    const active = document.querySelector('.tab-content.active');
    if (!active) switchTab('homepage');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
