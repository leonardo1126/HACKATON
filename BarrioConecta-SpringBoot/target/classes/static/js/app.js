// Barrio Conecta - comportamiento común a todas las páginas.
window.BC = window.BC || {};

/* ---------- Avisos breves (toasts) ---------- */
window.bcToast = function (mensaje, tipo) {
 let cont = document.getElementById('bc-toasts');
 if (!cont) { cont = document.createElement('div'); cont.id = 'bc-toasts'; cont.className = 'bc-toasts'; cont.setAttribute('aria-live', 'polite'); document.body.appendChild(cont); }
 const t = document.createElement('div');
 t.className = 'bc-toast ' + (tipo || 'info');
 t.textContent = mensaje;
 cont.appendChild(t);
 setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 400); }, 5200);
};

/* ---------- SOS flotante (funciona también sin conexión: se guarda y se envía al reconectar) ---------- */
document.addEventListener('DOMContentLoaded', () => {
 const btn = document.getElementById('global-sos-button'); if (!btn) return;
 const status = document.getElementById('global-sos-status');
 const setStatus = t => { if (status) status.textContent = t; };
 const mostrarNumeros = () => {
  alert('Si hay peligro inmediato, llama ahora:\n\n105 Policía\n116 Bomberos\n106 Ambulancia (SAMU)\n115 Defensa Civil\n\nBarrio Conecta avisa a tus vecinos, pero no a las autoridades.');
 };
 btn.addEventListener('click', () => {
  if (btn.dataset.logged !== 'true') {
   if (confirm('Para enviar una alerta SOS necesitas una cuenta e iniciar sesión. ¿Quieres ir a Ingresar?')) window.location.href = btn.dataset.loginUrl;
   return;
  }
  if (!confirm('¿ESTÁS SEGURO DE QUE QUIERES ENVIAR UNA ALERTA SOS?\n\nSe compartirá tu ubicación actual con tus vecinos. Úsala solo ante una emergencia real.\n\nEsto NO llama a la policía, bomberos ni ambulancia.')) return;
  if (!navigator.geolocation) { alert('Tu navegador no permite obtener la ubicación.'); return; }
  btn.disabled = true; setStatus('Obteniendo ubicación…');
  navigator.geolocation.getCurrentPosition(async pos => {
   const datos = { latitud: pos.coords.latitude, longitud: pos.coords.longitude };
   const body = new URLSearchParams(datos).toString();
   const guardarParaDespues = () => {
    if (window.BC.encolar) window.BC.encolar(btn.dataset.sosUrl, body, 'tu alerta SOS');
    setStatus('SOS guardado'); mostrarNumeros();
   };
   try {
    if (!navigator.onLine) { guardarParaDespues(); return; }
    const response = await fetch(btn.dataset.sosUrl, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body, credentials: 'same-origin' });
    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error(data.mensaje || 'No se pudo enviar el SOS.');
    setStatus('SOS enviado');
    window.bcToast('🚨 ' + data.mensaje + ' Llama también al 105, 116 o 106.', 'danger');
   } catch (err) {
    if (err instanceof TypeError) guardarParaDespues(); // sin red
    else { setStatus('No se pudo enviar'); alert(err.message || 'Ocurrió un error al enviar el SOS.'); }
   } finally { btn.disabled = false; setTimeout(() => setStatus('Emergencia'), 5000); }
  }, () => { btn.disabled = false; setStatus('Ubicación no disponible'); alert('No se pudo obtener tu ubicación. Activa el permiso de ubicación e inténtalo nuevamente.'); },
  { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
 });
});

/* ---------- Confirmaciones para acciones importantes ---------- */
document.addEventListener('DOMContentLoaded', () => {
 const modalNode = document.createElement('div');
 modalNode.className = 'modal fade'; modalNode.tabIndex = -1; modalNode.setAttribute('aria-hidden', 'true');
 modalNode.innerHTML = `<div class="modal-dialog modal-dialog-centered"><div class="modal-content border-0 bc-modal"><div class="modal-body text-center p-4 p-md-5"><div class="bc-modal-icon" id="bc-confirm-icon"><i class="bi bi-question-lg"></i></div><h2 class="h5 fw-bold mb-2" id="bc-confirm-title">¿Confirmas esta acción?</h2><p class="text-secondary mb-4" id="bc-confirm-message"></p><div class="d-flex justify-content-center gap-2"><button type="button" class="btn btn-light border" data-bs-dismiss="modal">Cancelar</button><button type="button" class="btn btn-danger px-4" id="bc-confirm-accept">Sí, continuar</button></div></div></div></div>`;
 document.body.appendChild(modalNode);
 const modal = window.bootstrap ? new bootstrap.Modal(modalNode) : null;
 let pendingForm = null;
 document.addEventListener('submit', event => {
  const submitter = event.submitter;
  if (!submitter || !submitter.hasAttribute('data-confirm') || !modal) return;
  event.preventDefault(); pendingForm = event.target;
  const msg = submitter.getAttribute('data-confirm') || '¿Deseas continuar?';
  const destructive = /eliminar|borrar|retirar|suspender|estado de esta cuenta/i.test(msg);
  document.getElementById('bc-confirm-title').textContent = destructive ? '¿Estás seguro?' : '¿Confirmas esta acción?';
  document.getElementById('bc-confirm-message').textContent = msg;
  const accept = document.getElementById('bc-confirm-accept');
  accept.className = destructive ? 'btn btn-danger px-4' : 'btn btn-success px-4';
  accept.textContent = destructive ? 'Sí, continuar' : 'Sí, confirmo';
  modal.show();
 }, true);
 document.getElementById('bc-confirm-accept').addEventListener('click', () => {
  if (!pendingForm) return;
  const form = pendingForm; pendingForm = null; modal.hide();
  HTMLFormElement.prototype.submit.call(form);
 });
 modalNode.addEventListener('hidden.bs.modal', () => { pendingForm = null; });
});

/* ---------- Reportar una publicación sospechosa ---------- */
document.addEventListener('DOMContentLoaded', () => {
 const botones = document.querySelectorAll('[data-report-tipo]');
 if (!botones.length || !window.bootstrap) return;
 const nodo = document.createElement('div');
 nodo.className = 'modal fade'; nodo.tabIndex = -1; nodo.setAttribute('aria-hidden', 'true');
 nodo.innerHTML = `<div class="modal-dialog modal-dialog-centered"><div class="modal-content border-0 bc-modal"><form method="post" action="/reportar"><div class="modal-body p-4"><h2 class="h5 fw-bold">Reportar publicación</h2><p class="small text-secondary">Un administrador la revisará. Úsalo si parece falsa, peligrosa o abusiva.</p><input type="hidden" name="tipo" id="bc-rep-tipo"><input type="hidden" name="id" id="bc-rep-id"><select class="form-select mb-2" id="bc-rep-motivo-sel" aria-label="Motivo"><option>Parece un engaño o estafa</option><option>Información falsa</option><option>Contenido ofensivo</option><option>Pone en riesgo a alguien</option><option>Otro motivo</option></select><textarea class="form-control" id="bc-rep-detalle" rows="2" maxlength="250" placeholder="Detalle (opcional)"></textarea><input type="hidden" name="motivo" id="bc-rep-motivo"><div class="d-flex justify-content-end gap-2 mt-3"><button type="button" class="btn btn-light border" data-bs-dismiss="modal">Cancelar</button><button class="btn btn-danger">Enviar reporte</button></div></div></form></div></div>`;
 document.body.appendChild(nodo);
 const modal = new bootstrap.Modal(nodo);
 botones.forEach(b => b.addEventListener('click', () => {
  document.getElementById('bc-rep-tipo').value = b.dataset.reportTipo;
  document.getElementById('bc-rep-id').value = b.dataset.reportId;
  modal.show();
 }));
 nodo.querySelector('form').addEventListener('submit', () => {
  const sel = document.getElementById('bc-rep-motivo-sel').value, det = document.getElementById('bc-rep-detalle').value.trim();
  document.getElementById('bc-rep-motivo').value = det ? sel + ': ' + det : sel;
 });
});

/* ---------- Al cerrar sesión se limpian las páginas guardadas del dispositivo ---------- */
document.addEventListener('click', e => {
 const a = e.target.closest && e.target.closest('a[href$="/logout"]');
 if (a && navigator.serviceWorker && navigator.serviceWorker.controller) navigator.serviceWorker.controller.postMessage('clear-pages');
});
