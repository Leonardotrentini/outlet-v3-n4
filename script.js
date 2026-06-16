const PRODUCTS = [
  'Design-sem-nome-15-2.webp',
  'Design-sem-nome-12-2.webp',
  'Design-sem-nome-11-2.webp',
  'Design-sem-nome-10-2.webp',
  'Design-sem-nome-9-2.webp',
  'Design-sem-nome-8-2.webp',
  'Design-sem-nome-7-2.webp',
  'Design-sem-nome-6-2.webp',
  'Design-sem-nome-5-2.webp',
];

const SLIDE_WIDTH = 240;
const SLIDE_HEIGHT = 340;

function buildCarousel() {
  const track = document.getElementById('carousel-track');
  if (!track || track.dataset.ready) return;
  track.dataset.ready = '1';

  const slides = [...PRODUCTS, ...PRODUCTS];
  track.innerHTML = slides
    .map(
      (file) =>
        `<div class="carousel__slide"><img src="/assets/${file}" alt="Produto Outlet Camisetas" width="${SLIDE_WIDTH}" height="${SLIDE_HEIGHT}" loading="lazy" decoding="async"></div>`
    )
    .join('');
}

function initLazyCarousel() {
  const section = document.getElementById('carousel-section');
  if (!section) return;

  if (!('IntersectionObserver' in window)) {
    buildCarousel();
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        buildCarousel();
        observer.disconnect();
      }
    },
    { rootMargin: '200px' }
  );

  observer.observe(section);
}

function redirectTo(url) {
  if (!url) return;
  window.location.assign(url);
}

function getRotadorPool() {
  if (window.ROTADOR_POOL) return window.ROTADOR_POOL;
  if (window.location.pathname.includes('rotacionador-grupos-antigos')) {
    return 'grupos-antigos';
  }
  return 'default';
}

function initRotator() {
  document.querySelectorAll('.btn-rotator').forEach((btn) => {
    const label = btn.textContent.trim();
    let loading = false;

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (loading) return;
      loading = true;
      btn.textContent = 'Aguarde...';

      if (typeof window.trackMetaLead === 'function') {
        window.trackMetaLead();
      }

      const pool = getRotadorPool();
      fetch(`/api/rotador/next?pool=${encodeURIComponent(pool)}`)
        .then((res) => {
          if (!res.ok) throw new Error('API error');
          return res.json();
        })
        .then((data) => {
          if (data.url) {
            redirectTo(data.url);
            return;
          }
          throw new Error('URL missing');
        })
        .catch(() => {
          btn.textContent = label;
          loading = false;
        });
    });
  });
}

initLazyCarousel();
initRotator();
