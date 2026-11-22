// AETHER Website — Interactive Animations & Simulator Engine

document.addEventListener('DOMContentLoaded', () => {
  initMouseSpotlight();
  initSimulator();
  initCopyButtons();
  initShieldVisualizer();
  initFaqAccordion();
});

// 1. Mouse Spotlight Tracker
function initMouseSpotlight() {
  const spotlight = document.getElementById('mouse-spotlight');
  if (!spotlight) return;

  window.addEventListener('mousemove', (e) => {
    spotlight.style.left = `${e.clientX}px`;
    spotlight.style.top = `${e.clientY}px`;
  });
}

// 2. Interactive Simulator
function initSimulator() {
  const canvas = document.getElementById('sim-canvas');
  const clockEl = document.getElementById('sim-clock');
  const greetingEl = document.getElementById('sim-greeting');
  const dateEl = document.getElementById('sim-date');
  const searchInput = document.getElementById('sim-search-input');
  const searchSubmit = document.getElementById('sim-search-submit');
  const wpButtons = document.querySelectorAll('[data-sim-wp]');
  const timerDigits = document.getElementById('sim-timer-digits');
  const timerBtn = document.getElementById('sim-timer-btn');
  const notesArea = document.getElementById('sim-notes');
  const locText = document.getElementById('sim-loc-text');
  const weatherText = document.getElementById('sim-weather-text');

  // Automatic Location & Weather Detection
  if (locText) {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      if (tz) {
        const parts = tz.split('/');
        locText.textContent = parts[parts.length - 1].replace(/_/g, ' ') || 'Local Time';
      }
    } catch(e) {
      locText.textContent = 'Local Time';
    }

    // Live Geolocation fetch
    fetch('https://get.geojs.io/v1/ip/geo.json')
      .then(r => r.json())
      .then(geo => {
        if (geo.city && geo.country) {
          locText.textContent = `${geo.city}, ${geo.country}`;
        }
        if (geo.latitude && geo.longitude && weatherText) {
          return fetch(`https://api.open-meteo.com/v1/forecast?latitude=${geo.latitude}&longitude=${geo.longitude}&current_weather=true`)
            .then(wr => wr.json())
            .then(wData => {
              if (wData.current_weather) {
                weatherText.textContent = ` • ${Math.round(wData.current_weather.temperature)}°C 🌤️`;
              }
            });
        }
      })
      .catch(() => {});
  }

  // Real-time Clock
  function updateClock() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    clockEl.textContent = `${h}:${m}`;

    const hour = now.getHours();
    let greet = 'Good morning';
    if (hour >= 12 && hour < 17) greet = 'Good afternoon';
    else if (hour >= 17 || hour < 5) greet = 'Good evening';
    greetingEl.textContent = greet;

    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    dateEl.textContent = now.toLocaleDateString(undefined, options);
  }
  updateClock();
  setInterval(updateClock, 1000);

  // Wallpaper Switcher
  wpButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const wp = btn.getAttribute('data-sim-wp');
      canvas.className = `sim-body wallpaper-${wp}`;
      wpButtons.forEach(b => b.classList.toggle('active', b === btn));
    });
  });

  // Simulator Search Interaction
  function doSearch() {
    const q = searchInput.value.trim();
    if (!q) return;
    window.open(`https://duckduckgo.com/?q=${encodeURIComponent(q)}`, '_blank');
  }

  searchSubmit.addEventListener('click', doSearch);
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doSearch();
  });

  // Simulator Focus Timer
  let remaining = 25 * 60;
  let timerId = null;
  let running = false;

  timerBtn.addEventListener('click', () => {
    if (running) {
      clearInterval(timerId);
      running = false;
      timerBtn.textContent = 'Resume';
    } else {
      running = true;
      timerBtn.textContent = 'Pause';
      timerId = setInterval(() => {
        if (remaining > 0) {
          remaining--;
          const mins = String(Math.floor(remaining / 60)).padStart(2, '0');
          const secs = String(remaining % 60).padStart(2, '0');
          timerDigits.textContent = `${mins}:${secs}`;
        } else {
          clearInterval(timerId);
          running = false;
          timerBtn.textContent = 'Start';
          remaining = 25 * 60;
          timerDigits.textContent = '25:00';
          alert('Focus session complete!');
        }
      }, 1000);
    }
  });

  // Local Notes Autosave Demo
  const saved = localStorage.getItem('aether_demo_notes');
  if (saved) notesArea.value = saved;
  notesArea.addEventListener('input', () => {
    localStorage.setItem('aether_demo_notes', notesArea.value);
  });
}

// 3. One-Click Copy Buttons
function initCopyButtons() {
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.getAttribute('data-copy');
      navigator.clipboard.writeText(text).then(() => {
        const original = btn.textContent;
        btn.textContent = 'Copied!';
        btn.style.background = '#34d399';
        btn.style.color = '#05070c';
        setTimeout(() => {
          btn.textContent = original;
          btn.style.background = '';
          btn.style.color = '';
        }, 1500);
      }).catch(err => {
        console.error('Copy failed:', err);
      });
    });
  });
}

// 4. Shield Interactive Telemetry Toggle
function initShieldVisualizer() {
  const toggleBtn = document.getElementById('toggle-shield-demo');
  const items = document.querySelectorAll('.shield-telemetry-list .telemetry-item');

  let active = true;
  toggleBtn.addEventListener('click', () => {
    active = !active;
    toggleBtn.textContent = active ? 'Active' : 'Disabled';
    toggleBtn.style.color = active ? '#34d399' : '#ef4444';
    toggleBtn.style.borderColor = active ? '#34d399' : '#ef4444';

    items.forEach(item => {
      const badge = item.querySelector('.t-badge');
      if (item.classList.contains('blocked')) {
        if (active) {
          badge.textContent = 'BLOCKED';
          badge.className = 't-badge';
          item.style.opacity = '1';
        } else {
          badge.textContent = 'LEAKING';
          badge.className = 't-badge';
          badge.style.background = 'rgba(239, 68, 68, 0.4)';
          item.style.opacity = '0.6';
        }
      }
    });
  });
}

// 5. FAQ Accordion
function initFaqAccordion() {
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-question');
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });
}
