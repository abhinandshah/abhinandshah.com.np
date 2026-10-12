// main.js — index.html behavior
// Theme toggle, mobile nav, sticky header state, lazy-initialized map,
// and an accessible contact form with a honeypot.

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initContactForm();
  setCopyrightYear();
});

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMobileNav();
  initStickyHeader();
  initHeroMap();
  initContactForm();
  initFeaturedExplorer();
  initGalleries();
  document.getElementById('year').textContent = new Date().getFullYear();
});

/* ---------------- Theme (dark = night map / light = atlas paper) ---------------- */
function initTheme() {
  const root = document.documentElement;
  const toggle = document.getElementById('theme-toggle');
  const stored = localStorage.getItem('theme');
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  const initial = stored || (prefersLight ? 'light' : 'dark');

  applyTheme(initial);

  toggle.addEventListener('click', () => {
    const current = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    applyTheme(current === 'light' ? 'dark' : 'light');
  });

  function applyTheme(theme) {
    if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
      toggle.setAttribute('aria-label', 'Switch to dark theme');
      toggle.setAttribute('aria-pressed', 'true');
    } else {
      root.removeAttribute('data-theme');
      toggle.setAttribute('aria-label', 'Switch to light theme');
      toggle.setAttribute('aria-pressed', 'false');
    }
    localStorage.setItem('theme', theme);
  }
}

/* ---------------- Mobile nav ---------------- */
function initMobileNav() {
  const btn = document.getElementById('menu-toggle');
  const nav = document.getElementById('mobile-nav');

  btn.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', String(isOpen));
    btn.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-label', 'Open menu');
    });
  });
}

/* ---------------- Sticky header background on scroll ---------------- */
function initStickyHeader() {
  const header = document.getElementById('site-header');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ---------------- Hero map: lazy-init only once it's visible ---------------- */
function initHeroMap() {
  const el = document.getElementById('hero-map');
  if (!el) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        buildMap();
        observer.disconnect();
      }
    });
  }, { rootMargin: '200px' });

  observer.observe(el);

  function buildMap() {
    // Requires Leaflet's CSS. Add this once in <head> alongside the JS include:
    // <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css">
    if (typeof L === 'undefined') return;

    const map = L.map(el, {
      zoomControl: true,
      scrollWheelZoom: false,
    }).setView([26.4525, 87.2718], 12); // Biratnagar, Koshi Province, Nepal

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      maxZoom: 19,
    }).addTo(map);

    L.marker([26.4525, 87.2718]).addTo(map);

    // re-enable scroll zoom only once the user has clicked into the map,
    // so page scroll isn't hijacked accidentally
    map.on('click', () => map.scrollWheelZoom.enable());
  }
}

/* ---------------- Contact form ---------------- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  if (!form) return;

  // Replace with your real form endpoint (Formspree, Google Apps Script, etc).
  const endpoint = 'https://script.google.com/macros/s/AKfycbw0uRxMUmXb7soWDgnnYrGtchE8lGukU_HUr9RAuzqqSLl4Zg-tyqbDdpusW2rqnwfj3w/exec';

  form.addEventListener('submit', e => {
    e.preventDefault();

    if (form.company.value) {
      form.reset();
      return; // honeypot caught a bot — drop silently
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;

    fetch(endpoint, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new FormData(form),
    })
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        status.textContent = 'Message sent — thanks, I\u2019ll reply soon.';
        form.reset();
      })
      .catch(err => {
        status.textContent = 'Something went wrong — please email me directly instead.';
        console.error('Contact form error:', err);
      })
      .finally(() => {
        submitBtn.disabled = false;
      });
  });
}

/* ---------------- Project galleries + lightbox ---------------- */
// Add or reorder images here. Each key matches a data-gallery attribute in index.html.
const GALLERIES = {
  webgis: {
    title: 'Spatial Wings WebGIS, Biratnagar Municipality',
    images: [
      { src: 'images/gallery/webgis-0-land-management.webp', title: 'Land Management', caption: '39,575 Cadastral parcels, searchable by ward and kitta number', alt: 'Land Management System showing 39,575 Cadastral parcels over Biratnagar Municipality' },
      { src: 'images/gallery/webgis-1-dashboard.webp', title: 'Dashboard', caption: 'Five municipal GIS modules behind a single admin login', alt: 'Spatial WebGIS dashboard with five module cards' },
      { src: 'images/gallery/webgis-2-house-numbering.webp', title: 'House Numbering', caption: 'Geocoded house points, filterable by ward', alt: 'House Numbering System showing house points over satellite imagery' },
      { src: 'images/gallery/webgis-3-road-network.webp', title: 'Road Network', caption: '423.1 km of roads classified by type and surface status', alt: 'Road Network System with roads colored by classification' },
      { src: 'images/gallery/webgis-4-weather.webp', title: 'Nepal Weather Map', caption: 'Live temperature and wind readings for major towns across Nepal', alt: 'Nepal Weather Map with temperature markers and legend' },
      { src: 'images/gallery/webgis-5-login.webp', title: 'Secure login', caption: 'Authenticated access for municipal administrators', alt: 'Spatial Wings WebGIS login screen' }
    ]
  },
  georef: {
    title: 'Cadastral georeferencing',
    images: [
      { src: 'images/gallery/georef-1.webp', caption: 'Hardcopy cadastral parcels georeferenced over high-resolution imagery', alt: 'Red cadastral parcel boundaries overlaid on orthoimagery of hillside terraces' },
      { src: 'images/gallery/georef-2.webp', caption: 'Georeferenced cadastral sheet linework inside ArcMap', alt: 'Cadastral parcel linework in the ArcMap interface' }
    ]
  },
  housenum: {
    title: 'Metric-based house numbering',
    images: [
      { src: 'images/gallery/house-1-bagmati-plate.webp', caption: 'QR-coded house number plate, Bagmati Municipality', alt: 'Blue Bagmati Municipality house plate with Nepali numerals and a QR code' },
      { src: 'images/gallery/house-2-inaruwa-plate.webp', caption: 'QR-coded house number plate, Inaruwa Municipality', alt: 'Blue Inaruwa Municipality house plate with road name, numerals and a QR code' },
      { src: 'images/gallery/house-3-bagmati-arcmap.webp', caption: 'House numbering interface in ArcMap, Bagmati', alt: 'ArcMap showing numbered house points for Bagmati' },
      { src: 'images/gallery/house-4-inaruwa-arcmap.webp', caption: 'House numbering interface in ArcMap, Inaruwa', alt: 'ArcMap showing numbered house points for Inaruwa' },
      { src: 'images/gallery/house-5-attributes.webp', caption: 'Attribute data that drives the numbering and QR codes', alt: 'ArcMap attribute table beside orthoimagery with house points' }
    ]
  },
  landuse: {
    title: 'Land-use zone mapping',
    images: [
      { src: 'images/gallery/landuse-1-bagmati.webp', caption: 'Land-use zone map sheet, Bagmati Municipality (Sarlahi District)', alt: 'Printed land-use zone map sheet of Bagmati Municipality with legend and scale' },
      { src: 'images/gallery/landuse-2-manthali.webp', caption: 'Cadastral overlay map sheet, Manthali Municipality (Ramechhap District)', alt: 'Printed map sheet of Manthali Municipality with land-use zones and cadastral overlay' },
      { src: 'images/gallery/landuse-3-sheet.webp', caption: 'Land-use zone map layout, Manthali Municipality', alt: 'Colored land-use zone map layout of Manthali Municipality with legend and chart' }
    ]
  },
  drone: {
    title: 'Drone-based feature digitization',
    images: [
      { src: 'images/gallery/drone-1-digitization.webp', caption: 'Roads, rivers, houses, forest and farmland digitized along the Butwal to Pokhara corridor', alt: 'ArcMap window with digitized road, house, river, forest and agricultural layers along a corridor' },
      { src: 'images/gallery/drone-2-sasplanet.webp', caption: 'Stitching satellite tiles into a GeoTIFF basemap with SAS Planet', alt: 'SAS Planet selection manager configured to export a GeoTIFF' }
    ]
  },
  tole: {
    title: 'Street naming & tole mapping',
    images: [
      { src: 'images/gallery/tole-1-audit.webp', caption: 'Public audit: reviewing a printed map with local representatives during tole mapping', alt: 'People gathered around a large printed satellite map during a public audit meeting' }
    ]
  },
  urban3d: {
    title: '3D planning & visualization',
    images: [
      { src: 'images/gallery/3d-1-settlement.webp', caption: 'Planned settlement layout with parks and internal roads', alt: '3D model of a planned residential settlement' },
      { src: 'images/gallery/3d-2-resort.webp', caption: 'Riverside resort concept: pool, gardens and entrance', alt: 'SketchUp model of a riverside resort site' },
      { src: 'images/gallery/3d-3-market.webp', caption: 'Market design with covered stalls and gated entrance', alt: '3D render of a market with covered stalls' },
      { src: 'images/gallery/3d-4-industry.webp', caption: 'Industrial park site layout', alt: '3D render of an industrial park layout' },
      { src: 'images/gallery/3d-5-hospital.webp', caption: 'Hospital site design', alt: '3D render of a hospital compound' },
      { src: 'images/gallery/3d-6-incubation.webp', caption: 'Incubation center site design', alt: '3D render of an incubation center compound' }
    ]
  }
};

function initGalleries() {
  const dialog = document.getElementById('lightbox');
  if (!dialog || typeof dialog.showModal !== 'function') return; // plain links still open the image

  const img = document.getElementById('lb-img');
  const caption = document.getElementById('lb-caption');
  const count = document.getElementById('lb-count');
  const title = document.getElementById('lb-title');
  const prev = document.getElementById('lb-prev');
  const next = document.getElementById('lb-next');
  const closeBtn = document.getElementById('lb-close');

  let current = null; // { key, index }

  function show(key, index) {
    const gallery = GALLERIES[key];
    if (!gallery) return;
    const total = gallery.images.length;
    const i = (index + total) % total;
    const item = gallery.images[i];
    current = { key, index: i };

    img.classList.add('is-loading');
    img.onload = () => img.classList.remove('is-loading');
    img.src = item.src;
    img.alt = item.alt || item.caption || '';
    title.textContent = gallery.title;
    caption.textContent = item.caption || '';
    count.textContent = total > 1 ? (i + 1) + ' / ' + total : '';
    dialog.dataset.single = String(total === 1);

    // warm the cache for neighbours so arrows feel instant
    if (total > 1) {
      [i + 1, i - 1].forEach(n => { new Image().src = gallery.images[(n + total) % total].src; });
    }
  }

  function open(key, index) {
    show(key, index);
    if (!dialog.open) dialog.showModal();
    document.body.style.overflow = 'hidden';
  }

  // Any element with data-gallery opens the lightbox. Featured main button resumes at the visible image.
  document.querySelectorAll('[data-gallery]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      const key = el.dataset.gallery;
      const start = el.id === 'fp-main-btn' ? featuredIndex : 0;
      open(key, start);
    });
  });

  prev.addEventListener('click', () => current && show(current.key, current.index - 1));
  next.addEventListener('click', () => current && show(current.key, current.index + 1));
  closeBtn.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => { document.body.style.overflow = ''; });

  // click on the dark backdrop (not the image or controls) closes
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });

  dialog.addEventListener('keydown', e => {
    if (!current) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); show(current.key, current.index + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(current.key, current.index - 1); }
  });

  // touch swipe
  let touchX = null;
  dialog.addEventListener('touchstart', e => { touchX = e.changedTouches[0].clientX; }, { passive: true });
  dialog.addEventListener('touchend', e => {
    if (touchX === null || !current) return;
    const dx = e.changedTouches[0].clientX - touchX;
    touchX = null;
    if (Math.abs(dx) > 50) show(current.key, current.index + (dx < 0 ? 1 : -1));
  }, { passive: true });
}

/* ---------------- Flagship project image rail ---------------- */
let featuredIndex = 0;

function initFeaturedExplorer() {
  const main = document.getElementById('fp-main-img');
  const cap = document.getElementById('fp-caption');
  const thumbs = document.querySelectorAll('.fp-thumb');
  if (!main || !thumbs.length) return;

  thumbs.forEach(btn => {
    btn.addEventListener('click', () => {
      const i = Number(btn.dataset.index);
      const item = GALLERIES.webgis.images[i];
      if (!item || i === featuredIndex) return;
      featuredIndex = i;

      main.classList.add('is-swapping');
      const swap = () => {
        main.src = item.src;
        main.alt = item.alt;
        cap.innerHTML = '';
        const strong = document.createElement('strong');
        strong.textContent = item.title;
        cap.append(strong, ' \u2014 ' + item.caption);
        main.onload = () => main.classList.remove('is-swapping');
      };
      setTimeout(swap, 120);

      thumbs.forEach(t => {
        const active = t === btn;
        t.classList.toggle('is-active', active);
        t.setAttribute('aria-pressed', String(active));
      });
    });
  });
}


/* ---------------- Footer year ---------------- */
function setCopyrightYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}
