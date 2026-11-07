// Tutorial interactivo «¿Cómo funciona?». Se muestra la primera vez, se puede omitir y se abre de nuevo desde el menú.
(() => {
 const PASOS = [
  { icono: 'bi-geo-alt-fill', color: 'green', titulo: 'Encuentra servicios cerca de ti', texto: 'Busca gasfitería, electricidad, clases o productos del barrio. Cada tarjeta muestra a cuántos metros o kilómetros está y puedes ordenar por cercanía.', enlace: '/servicios', boton: 'Ver servicios' },
  { icono: 'bi-plus-circle-fill', color: 'green', titulo: 'Publica tu servicio en 3 clics', texto: 'Toca «Publicar», elige «Servicio o producto», completa y envía. Tus vecinos podrán darte su Visto Bueno.', enlace: '/servicios/nuevo', boton: 'Publicar un servicio' },
  { icono: 'bi-heart-fill', color: 'purple', titulo: 'Pide u ofrece favores sin dinero', texto: 'En «Necesito ayuda» pide una escalera, transporte o alimentos. En «Quiero ayudar» presta, dona o ofrece tu tiempo. Cada publicación pasa por Pendiente, En coordinación y Resuelta.', enlace: '/favores', boton: 'Ir a la cadena de favores' },
  { icono: 'bi-hand-thumbs-up-fill', color: 'green', titulo: 'Califica a un vecino', texto: 'Entra al detalle de un servicio y da tu Visto Bueno con estrellas y un comentario. Con varias recomendaciones, el servicio pasa a «Recomendado» y «Muy recomendado». Recuerda: es una opinión, no una certificación profesional.', enlace: '/servicios', boton: 'Ver recomendaciones' },
  { icono: 'bi-exclamation-triangle-fill', color: 'red', titulo: 'Reporta una emergencia', texto: 'Usa el botón rojo SOS o «Necesito ayuda» en el centro de ayuda. Tus vecinos reciben un aviso. Si hay peligro real, llama también al 105, 116 o 106: la app no sustituye a las autoridades.', enlace: '/emergencias', boton: 'Ir al centro de ayuda' },
  { icono: 'bi-people-fill', color: 'blue', titulo: 'Ofrece ayuda a otra persona', texto: 'Toca «Puedo ayudar» en una solicitud. Quien la publicó te acepta, ven el contacto del otro y coordinan. Al resolverse sumas una «ayuda completada» a tu reputación.', enlace: '/emergencias', boton: 'Ver quién necesita ayuda' }
 ];
 const CLAVE = 'bc_tutorial_visto';
 let modal, nodo, paso = 0;

 function render() {
  const p = PASOS[paso];
  nodo.querySelector('.tut-icon').className = 'tut-icon ' + p.color;
  nodo.querySelector('.tut-icon i').className = 'bi ' + p.icono;
  nodo.querySelector('.tut-title').textContent = p.titulo;
  nodo.querySelector('.tut-text').textContent = p.texto;
  nodo.querySelector('.tut-count').textContent = 'Paso ' + (paso + 1) + ' de ' + PASOS.length;
  nodo.querySelector('.tut-dots').innerHTML = PASOS.map((_, i) => '<span class="' + (i === paso ? 'on' : '') + '"></span>').join('');
  nodo.querySelector('.tut-try').textContent = p.boton; nodo.querySelector('.tut-try').href = p.enlace;
  nodo.querySelector('.tut-prev').disabled = paso === 0;
  nodo.querySelector('.tut-next').textContent = paso === PASOS.length - 1 ? '¡Listo!' : 'Siguiente';
 }
 function crear() {
  nodo = document.createElement('div');
  nodo.className = 'modal fade'; nodo.tabIndex = -1; nodo.setAttribute('aria-labelledby', 'tut-title'); nodo.setAttribute('aria-hidden', 'true');
  nodo.innerHTML = '<div class="modal-dialog modal-dialog-centered"><div class="modal-content border-0 bc-modal"><div class="modal-body p-4 p-md-5 text-center">' +
   '<div class="d-flex justify-content-between align-items-center mb-3"><span class="tut-count small muted"></span><button type="button" class="btn btn-link btn-sm text-secondary tut-skip">Omitir</button></div>' +
   '<div class="tut-icon green"><i class="bi"></i></div><h2 class="h4 fw-bold tut-title" id="tut-title"></h2><p class="text-secondary tut-text"></p>' +
   '<a class="btn btn-outline-success btn-sm tut-try"></a><div class="tut-dots my-3"></div>' +
   '<div class="d-flex justify-content-between gap-2"><button type="button" class="btn btn-light border tut-prev">Atrás</button><button type="button" class="btn btn-bc px-4 tut-next">Siguiente</button></div>' +
   '<p class="small muted mt-3 mb-0">Puedes volver a verlo desde «¿Cómo funciona?» en el menú.</p></div></div></div>';
  document.body.appendChild(nodo);
  modal = new bootstrap.Modal(nodo);
  const cerrar = () => { try { localStorage.setItem(CLAVE, '1'); } catch (e) {} modal.hide(); };
  nodo.querySelector('.tut-skip').addEventListener('click', cerrar);
  nodo.querySelector('.tut-try').addEventListener('click', () => { try { localStorage.setItem(CLAVE, '1'); } catch (e) {} });
  nodo.querySelector('.tut-prev').addEventListener('click', () => { if (paso > 0) { paso--; render(); } });
  nodo.querySelector('.tut-next').addEventListener('click', () => { if (paso < PASOS.length - 1) { paso++; render(); } else cerrar(); });
  nodo.addEventListener('hidden.bs.modal', () => { try { localStorage.setItem(CLAVE, '1'); } catch (e) {} });
 }
 function abrir() { if (!window.bootstrap) return; if (!nodo) crear(); paso = 0; render(); modal.show(); }

 document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-open-tutorial]').forEach(b => b.addEventListener('click', e => { e.preventDefault(); abrir(); }));
  let visto = null; try { visto = localStorage.getItem(CLAVE); } catch (e) {}
  if (!visto && location.pathname === '/') setTimeout(abrir, 700);
 });
 window.BC = window.BC || {}; window.BC.abrirTutorial = abrir;
})();
