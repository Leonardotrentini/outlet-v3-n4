const PRODUCTS = [
  'Design-sem-nome-15-2.png',
  'Design-sem-nome-12-2.png',
  'Design-sem-nome-11-2.png',
  'Design-sem-nome-10-2.png',
  'Design-sem-nome-9-2.png',
  'Design-sem-nome-8-2.png',
  'Design-sem-nome-7-2.png',
  'Design-sem-nome-6-2.png',
  'Design-sem-nome-5-2.png',
];

function buildCarousel() {
  const track = document.getElementById('carousel-track');
  if (!track) return;

  const slides = [...PRODUCTS, ...PRODUCTS];
  track.innerHTML = slides
    .map(
      (file) =>
        `<div class="carousel__slide"><img src="assets/${file}" alt="Produto Outlet Camisetas" loading="lazy"></div>`
    )
    .join('');
}

function redirectTo(url) {
  if (!url) return;
  // window.open após fetch async é bloqueado no mobile (Safari/Chrome).
  // Redirecionar na mesma aba abre o WhatsApp direto no celular.
  window.location.assign(url);
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

      fetch('https://outletcamisetas.com.br/wp-json/rotador/v1/next')
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

buildCarousel();
initRotator();
