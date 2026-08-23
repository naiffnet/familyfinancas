/**
 * MODAL DIALOG COMPONENT
 */

export const Modal = {
  open(title, bodyHTML, wide = false, isSettings = false) {
    const titleEl = document.getElementById('modal-title');
    const bodyEl = document.getElementById('modal-body');
    const modalEl = document.getElementById('modal');
    const overlayEl = document.getElementById('modal-overlay');

    if (titleEl) titleEl.textContent = title;
    if (bodyEl) bodyEl.innerHTML = bodyHTML;
    if (modalEl) modalEl.className = `modal${wide ? ' modal-lg' : ''}${isSettings ? ' modal-no-scroll' : ''}`;
    if (overlayEl) overlayEl.classList.remove('hidden');
  },
  close() {
    const overlayEl = document.getElementById('modal-overlay');
    const bodyEl = document.getElementById('modal-body');
    if (overlayEl) overlayEl.classList.add('hidden');
    if (bodyEl) bodyEl.innerHTML = '';
  }
};

export default Modal;
