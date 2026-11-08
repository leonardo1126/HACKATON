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

/* ---------- SOS inteligente con vulnerabilidades (funciona online y offline) ---------- */
document.addEventListener('DOMContentLoaded', () => {
 const sosBtn = document.getElementById('global-sos-button');
 const triggerBtn = document.getElementById('btn-trigger-sos-confirmed');
 const status = document.getElementById('global-sos-status');
 const feedback = document.getElementById('sos-modal-feedback');
 const chipContainer = document.getElementById('sos-category-chips');
 const detailInput = document.getElementById('sos-detail-input');

 let categoriaSeleccionada = 'Adulto mayor o persona vulnerable';

 if (chipContainer) {
  chipContainer.querySelectorAll('.sos-chip-btn').forEach(b => {
   b.addEventListener('click', () => {
    chipContainer.querySelectorAll('.sos-chip-btn').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    categoriaSeleccionada = b.dataset.cat || 'SOS';
   });
  });
 }

 const setStatus = t => { if (status) status.textContent = t; };
 const setFeedback = (msg, isError) => {
  if (feedback) {
   feedback.textContent = msg;
   feedback.className = 'small text-center mt-2 ' + (isError ? 'text-danger fw-bold' : 'text-success fw-bold');
  }
 };

 if (triggerBtn && sosBtn) {
  triggerBtn.addEventListener('click', () => {
   if (sosBtn.dataset.logged !== 'true') {
    if (confirm('Para enviar una alerta comunitaria necesitas una cuenta. ¿Deseas ir a Iniciar sesión?')) {
     window.location.href = sosBtn.dataset.loginUrl;
    }
    return;
   }

   const detalle = detailInput ? detailInput.value.trim() : '';

   if (!navigator.geolocation) {
    setFeedback('Tu navegador no admite geolocalización.', true);
    return;
   }

   triggerBtn.disabled = true;
   triggerBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Obteniendo ubicación GPS…';
   setStatus('Localizando…');

   navigator.geolocation.getCurrentPosition(async pos => {
    const datos = {
     latitud: pos.coords.latitude,
     longitud: pos.coords.longitude,
     categoria: categoriaSeleccionada,
     detalle: detalle
    };
    const body = new URLSearchParams(datos).toString();

    const guardarOffline = () => {
     if (window.BC && window.BC.encolar) {
      window.BC.encolar(sosBtn.dataset.sosUrl, body, 'tu alerta SOS (' + categoriaSeleccionada + ')');
     }
     setStatus('SOS guardado local');
     setFeedback('Guardado sin conexión. Se transmitirá en cuanto vuelva la señal.', false);
     window.bcToast('⚠️ Alerta SOS guardada sin conexión. Se enviará al reconectar.', 'warn');
     setTimeout(() => {
      const modalEl = document.getElementById('sosModal');
      if (modalEl && window.bootstrap) bootstrap.Modal.getInstance(modalEl)?.hide();
     }, 1800);
    };

    try {
     if (!navigator.onLine) {
      guardarOffline();
      return;
     }

     const response = await fetch(sosBtn.dataset.sosUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      credentials: 'same-origin'
     });

     const data = await response.json();
     if (!response.ok || !data.ok) throw new Error(data.mensaje || 'Error al enviar alerta SOS');

     setStatus('SOS transmitido');
     setFeedback('¡Alerta enviada a tus vecinos cercanos!', false);
     window.bcToast('🚨 ' + data.mensaje + ' Verifica también llamar al 105, 116 o 106.', 'danger');

     setTimeout(() => {
      const modalEl = document.getElementById('sosModal');
      if (modalEl && window.bootstrap) bootstrap.Modal.getInstance(modalEl)?.hide();
      window.location.href = '/?modo=emergencia';
     }, 1200);

    } catch (err) {
     if (err instanceof TypeError) {
      guardarOffline();
     } else {
      setFeedback(err.message || 'Error al conectar con el servidor.', true);
     }
    } finally {
     triggerBtn.disabled = false;
     triggerBtn.innerHTML = '<i class="bi bi-broadcast me-2"></i>ENVIAR SOS A MIS VECINOS';
     setTimeout(() => setStatus('Auxilio 1-clic'), 5000);
    }
   }, () => {
    triggerBtn.disabled = false;
    triggerBtn.innerHTML = '<i class="bi bi-broadcast me-2"></i>ENVIAR SOS A MIS VECINOS';
    setStatus('Sin GPS');
    setFeedback('No se pudo acceder a tu ubicación. Concede permiso de GPS en tu navegador.', true);
   }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
  });
 }
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
