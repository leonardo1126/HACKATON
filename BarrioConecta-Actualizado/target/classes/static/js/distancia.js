// Distancia aproximada a cada tarjeta ([data-geo-card] con data-lat / data-lon) y orden por cercanía.
// La ubicación del visitante no se envía ni se guarda en el servidor; solo se recuerda en este dispositivo.
(() => {
 const rad = x => x * Math.PI / 180;
 const km = (a, b, c, d) => {
  const h = Math.sin(rad(c - a) / 2) ** 2 + Math.cos(rad(a)) * Math.cos(rad(c)) * Math.sin(rad(d - b) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
 };
 const formato = k => k < 1 ? '≈ ' + Math.max(50, Math.round(k * 20) * 50) + ' m' : '≈ ' + (k < 10 ? k.toFixed(1) : Math.round(k)) + ' km';
 window.BC = window.BC || {};
 window.BC.distanciaKm = km; window.BC.formatoDistancia = formato;

 document.addEventListener('DOMContentLoaded', () => {
  const cards = [...document.querySelectorAll('[data-geo-card]')];
  const status = document.getElementById('distance-status');
  const msg = (html) => { if (status) status.innerHTML = html; };
  if (!cards.length) return;
  const tiene = c => c.dataset.lat && c.dataset.lon && Number.isFinite(Number(c.dataset.lat)) && Number.isFinite(Number(c.dataset.lon));
  cards.forEach(c => {
   const l = c.querySelector('[data-distance]'); if (!l) return;
   if (!tiene(c)) { l.textContent = 'Sin ubicación'; l.classList.add('no-location'); c.dataset.km = ''; }
  });
  const aplicar = (lat, lon, desdeCache) => {
   cards.forEach(c => {
    const l = c.querySelector('[data-distance]'); if (!l || !tiene(c)) return;
    const d = km(lat, lon, Number(c.dataset.lat), Number(c.dataset.lon));
    c.dataset.km = d; l.innerHTML = '<i class="bi bi-geo-alt-fill"></i> ' + formato(d); l.classList.remove('no-location');
   });
   msg('<i class="bi bi-check-circle-fill me-1"></i>' + (desdeCache ? 'Distancias según tu última ubicación guardada en este dispositivo.' : 'Distancias aproximadas desde tu ubicación actual. No se guarda en el servidor.'));
  };
  const cache = () => { try { return JSON.parse(localStorage.getItem('bc_pos') || 'null'); } catch (e) { return null; } };
  const sinPermiso = () => {
   const p = cache();
   if (p) aplicar(p.lat, p.lon, true);
   else { msg('<i class="bi bi-geo-alt me-1"></i>No pudimos acceder a tu ubicación. Activa el permiso del navegador para ver distancias.'); cards.forEach(c => { const l = c.querySelector('[data-distance]'); if (l && tiene(c)) { l.textContent = 'Activa tu ubicación'; l.classList.add('no-location'); } }); }
  };
  const ordenar = () => {
   document.querySelectorAll('[data-geo-list]').forEach(lista => {
    const hijos = [...lista.children].filter(h => h.hasAttribute('data-geo-card'));
    hijos.sort((x, y) => (x.dataset.km ? Number(x.dataset.km) : Infinity) - (y.dataset.km ? Number(y.dataset.km) : Infinity));
    hijos.forEach(h => lista.appendChild(h));
   });
   msg('<i class="bi bi-sort-down me-1"></i>Ordenado por cercanía. Lo que no tiene ubicación aparece al final.');
  };
  document.querySelectorAll('[data-distance-sort]').forEach(b => b.addEventListener('click', ordenar));
  if (!navigator.geolocation) { sinPermiso(); return; }
  msg('Solicitando permiso de ubicación…');
  navigator.geolocation.getCurrentPosition(pos => {
   try { localStorage.setItem('bc_pos', JSON.stringify({ lat: pos.coords.latitude, lon: pos.coords.longitude, ts: Date.now() })); } catch (e) {}
   aplicar(pos.coords.latitude, pos.coords.longitude, false);
  }, sinPermiso, { enableHighAccuracy: false, timeout: 12000, maximumAge: 120000 });
 });
})();
