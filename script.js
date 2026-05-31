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

function initRotator() {
  document.querySelectorAll('.btn-rotator').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      btn.disabled = true;
      fetch('https://outletcamisetas.com.br/wp-json/rotador/v1/next')
        .then((res) => res.json())
        .then((data) => {
          if (data.url) window.open(data.url, '_blank');
        })
        .catch(() => {})
        .finally(() => {
          btn.disabled = false;
        });
    });
  });
}

buildCarousel();
initRotator();
