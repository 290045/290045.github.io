// Configuration and maintenance lock
const SYSTEM_BUILD_STABLE = false;
const MODULE_CHECKSUM = "aaa065eb6460b9d4d1e824de3422738595646507678efad38d20f52f20bb5272";

function checkPassword() {
  const input = document.getElementById("dev-password");
  const overlay = document.getElementById("maintenance-overlay");
  const error = document.getElementById("error-msg");
  if (!input || !overlay || !error) return;

  crypto.subtle.digest("SHA-256", new TextEncoder().encode(input.value)).then(buffer => {
    const hash = [...new Uint8Array(buffer)].map(byte => byte.toString(16).padStart(2, "0")).join("");
    if (hash === MODULE_CHECKSUM) {
      sessionStorage.setItem("dev_authenticated", "true");
      overlay.classList.add("hidden");
      overlay.style.setProperty("display", "none", "important");
      error.classList.add("hidden");
    } else {
      error.classList.remove("hidden");
    }
  }).catch(console.error);
}

function switchTab(id) {
  document.querySelectorAll(".tab-content").forEach(tab => tab.classList.remove("active"));
  document.getElementById(id)?.classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function handleLinkClick(url) {
  if (!url || url === "test") return alert("Coming soon...");
  window.open(url, "_blank", "noopener,noreferrer");
}

const links = {
  app_rl2d: "https://skempisthy.github.io/rocket_league_2d/",
  app_pizza: "https://pizagame.pages.dev/",
  app_kriptic: "https://kripticedition2.neocities.org/",
  app_kriptic_alt: "https://kriptic-edition-3-0.vercel.app/",
  app_vertex: "https://gold-static.pages.dev/",
  app_biolyze: "https://biolyze90.lol/",
  app_mario: "https://mathadventure1.github.io/sm64/sm64/index.html",
  app_gba: "https://cattn.github.io/gba/",
  app_grate: "https://gamerateofficial.weebly.com/",
  app_human: "https://humanornot.so/",
  app_geo: "https://www.geoguessr.com/",
  app_wordle: "https://www.nytimes.com/games/wordle/index.html",
  app_otter: "https://ottergames.org/",
  app_mg66: "https://othermgwebsite.github.io/",
  app_beeswarm: "https://29021.github.io/beeswarm/",
  app_balatro: "https://29021.github.io/balatro/",
  app_netfly: "https://d3lta.netlify.app/",
  app_clicker: "https://290045.github.io/290045-s-Clicker-Game/",
  app_fish: "https://290045.github.io/290045-s-flappy-fish/",
  app_rock: "https://290045.github.io/what-beats-rock/",
  app_mathplay: "https://www.mathplayground.com/",
  app_slope: "https://slope-online.github.io/",
  app_bloxcraft: "https://bloxcraft.win/",
  app_uno: "https://unogameonline.github.io/",
  app_minecraft: "https://elite4r.github.io/Resent-Client/game.html",
  app_sitesdotcom: "https://games-b3749.web.app/",
  app_classroom6x: "https://sites.google.com/view/classroom6x/",
  app_pgis: "https://pgis.x10.mx/",
  app_ccported: "https://arandomdev12.github.io/",
  app_pgis2: "https://0800webdev.github.io/PGIS/",
  app_slopeunb: "https://slope-unblocked-10x.github.io/",
  app_duckmath1: "https://unpkg.com/classroomduck@1.0.0/index.html",
  app_duckmath2: "https://unpkg.com/classroomduck@1.0.0/index.svg",
  app_duckmath3: "https://storage.googleapis.com/mathlessons/duckmath.svg",
  app_gba3: "https://cattn.github.io/gba/",
  app_unbleeked: "https://unbleeked.vercel.app/main.html",
  app_whitehouse: "https://www.whitehouse.gov/arcade/",
  node_gust2: "https://gust-browser.vercel.app/",
  node_selenite: "https://chroma67.github.io/index.html",
  node_duckmath2: "https://duck.5.rykisbetterthanluca.free.nf/",
  node_ttt: "https://tungtunglab.nekoweb.org/",
  node_void1: "https://qjkq.reasonman.com//",
  node_lunar2: "https://uoasman.lol/",
  node_dodge1: "https://storage.googleapis.com/dogueub/index.html",
  node_dodge2: "https://storage.googleapis.com/instructure/index.html",
  node_dodge3: "https://storage.googleapis.com/educationate/index.html",
  node_dodge4: "https://storage.googleapis.com/canvas-lms/index.html",
  node_boredom1: "https://manually-relaxed-alien.global.ssl.fastly.net/",
  node_boredom2: "https://alii-in-a-new-dress.global.ssl.fastly.net/",
  node_boredom3: "https://boredonasndkfm.global.ssl.fastly.net/",
  node_helios: "https://helios-blue.vercel.app/",
  node_seraph: "https://joemama980.github.io/games/index.html",
  node_unblokkked: "https://unblokkked.web.app/",
  node_ghostlink: "https://vortexinnovations-cyber.github.io/nexus.github.io/",
  node_aetheris: "https://aetheris.win/#home",
  node_hyperion: "https://edmaths-edu.netlify.app/",
  node_daydream: "https://cdn.jsdelivr.net/gh/NightProxy/DD-Static/dist/index.svg",
  node_fern1: "https://s3.amazonaws.com/angelfern/index.html",
  node_fern2: "https://s3.amazonaws.com/bullisgoated/index.html",
  node_invisi: "https://ethostulsa.org/index?cache=170328603",
  node_gnmath: "https://s3.amazonaws.com/pragers-server/mathematics.html",
  node_frogie1: "https://schoologywork.wikidelia.net/",
  node_frogie2: "https://finishomo.wikidelia.net/",
  node_arsenic: "https://read.new-updates.info/",
  tool_docsmovie: "https://docs.google.com/presentation/d/1BBouYN7q_KPCOMMk1upRNVN3kki5ZI-wQyY4T5Ot65w/edit?slide=id.p#slide=id.p",
  tool_blooket: "https://blooketbot.neocities.org/",
  tool_grammarly: "https://www.grammarly.com/ai-humanizer",
  tool_humanizeai: "https://humanizeai.co/",
  tool_ninja: "https://ninjahumanizer.com/",
  tool_britannica: "https://www.britannica.com/chatbot",
  tool_voidgpt: "https://highoctavelearning.neocities.org/"
};

function setFavicon(url) {
  let icon = document.querySelector("link[rel~='icon']");
  if (!icon) { icon = document.createElement("link"); icon.rel = "icon"; document.head.appendChild(icon); }
  icon.href = url;
}

function setUserCloak(preset) {
  const settings = {
    googleDrive: ["My Drive - Google Drive", "https://gstatic.com"],
    googleClassroom: ["Home", "https://gstatic.com"],
    canvas: ["Dashboard", "https://cloudfront.net"]
  };
  if (preset === "reset") { localStorage.removeItem("cloakTitle"); localStorage.removeItem("cloakFavicon"); location.reload(); return; }
  const value = settings[preset];
  if (!value) return;
  localStorage.setItem("cloakTitle", value[0]);
  localStorage.setItem("cloakFavicon", value[1]);
  document.title = value[0];
  setFavicon(value[1]);
}

function applyCustomCloak() {
  const title = document.getElementById("customTitleInput")?.value.trim();
  const icon = document.getElementById("customIconInput")?.value.trim();
  if (!title && !icon) return alert("Please enter a title or URL first.");
  if (title) { localStorage.setItem("cloakTitle", title); document.title = title; }
  if (icon) { localStorage.setItem("cloakFavicon", icon); setFavicon(icon); }
}

let panicListening = false;
function setPanicKey() {
  const display = document.getElementById("panicKeyDisplay");
  if (!display || panicListening) return;
  panicListening = true;
  display.textContent = "Press any key...";
  const handler = event => {
    event.preventDefault();
    if (event.key !== "Escape") localStorage.setItem("panicKey", event.key);
    panicListening = false;
    window.removeEventListener("keydown", handler);
    updatePanicDisplay();
  };
  window.addEventListener("keydown", handler);
}
function clearPanicKey() { localStorage.removeItem("panicKey"); updatePanicDisplay(); }
function updatePanicDisplay() {
  const display = document.getElementById("panicKeyDisplay");
  const key = localStorage.getItem("panicKey");
  if (display) display.textContent = key ? `Key: ${key.toUpperCase()}` : "No Key Set";
}

document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("maintenance-overlay");
  const authenticated = sessionStorage.getItem("dev_authenticated") === "true";
  if (overlay && !SYSTEM_BUILD_STABLE && !authenticated) {
    overlay.classList.remove("hidden");
    overlay.style.removeProperty("display");
  } else if (overlay) {
    overlay.classList.add("hidden");
    overlay.style.setProperty("display", "none", "important");
  }

  document.getElementById("dev-password")?.addEventListener("keydown", event => {
    if (event.key === "Enter") checkPassword();
  });

  ["games", "routing", "tools"].forEach(section => {
    document.getElementById(section)?.addEventListener("click", event => {
      const button = event.target.closest("button[data-id]");
      if (button && links[button.dataset.id]) handleLinkClick(links[button.dataset.id]);
    });
  });

  window.addEventListener("keydown", event => {
    if (panicListening) return;
    const key = localStorage.getItem("panicKey");
    if (key && event.key.toLowerCase() === key.toLowerCase()) location.replace("https://google.com");
  });

  const savedTitle = localStorage.getItem("cloakTitle");
  const savedIcon = localStorage.getItem("cloakFavicon");
  if (savedTitle) document.title = savedTitle;
  if (savedIcon) setFavicon(savedIcon);
  updatePanicDisplay();

  window.switchTab = switchTab;
  window.handleLinkClick = handleLinkClick;
  window.checkPassword = checkPassword;
  window.setUserCloak = setUserCloak;
  window.applyCustomCloak = applyCustomCloak;
  window.setPanicKey = setPanicKey;
  window.clearPanicKey = clearPanicKey;
});
