const META_PIXEL_ID = '881981060699779';

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : '';
}

function createEventId() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

function sendCapiEvent(eventName, eventId) {
  fetch('/api/meta-event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event_name: eventName,
      event_id: eventId,
      event_source_url: window.location.href,
      fbp: getCookie('_fbp'),
      fbc: getCookie('_fbc'),
    }),
    keepalive: true,
  }).catch(function () {});
}

function trackBrowser(eventName, eventId, params) {
  if (typeof window.fbq !== 'function') return;
  window.fbq('track', eventName, params || {}, { eventID: eventId });
}

function trackEvent(eventName, params) {
  const eventId = createEventId();
  trackBrowser(eventName, eventId, params);
  sendCapiEvent(eventName, eventId);
  return eventId;
}

function loadMetaPixel() {
  if (window.fbq) return;

  !(function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

  window.fbq('init', META_PIXEL_ID);
  trackEvent('PageView');
}

function scheduleMetaPixel() {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(loadMetaPixel, { timeout: 2500 });
  } else {
    setTimeout(loadMetaPixel, 1500);
  }
}

window.trackMetaLead = function () {
  trackEvent('Lead');
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', scheduleMetaPixel);
} else {
  scheduleMetaPixel();
}
