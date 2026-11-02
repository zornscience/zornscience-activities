(function () {
  "use strict";
  const body = document.body;
  const enterButton = document.getElementById('fullscreen');
  const exitButton = document.getElementById('exit-fullscreen');
  const toolbar = document.querySelector('.fullscreen-toolbar');
  const modal = document.getElementById('modal');
  let active = false;
  // Words and the share link come from the shared language module (data.js holds the Spanish).
  let i18n;
  body.dispatchEvent(new CustomEvent('zsa:request-i18n', {detail: {receive(api) { i18n = api; }}}));
  function tr(text) { return i18n ? i18n.text(text) : text; }
  let requesting = false;

  function update(value) {
    active = value;
    body.classList.toggle('calculator-fullscreen', value);
    toolbar.hidden = !value;
    enterButton.setAttribute('aria-pressed', String(value));
    (value ? document.querySelector('.calculator') : enterButton).focus({preventScroll: true});
  }
  async function exit() {
    update(false);
    if (document.fullscreenElement && document.exitFullscreen) {
      try { await document.exitFullscreen(); } catch (_) { /* The calculator view is already restored. */ }
    }
  }
  enterButton.addEventListener('click', async function () {
    if (active) { await exit(); return; }
    // This layout is also the fallback when a mobile browser cannot hide its own controls.
    update(true);
    if (document.documentElement.requestFullscreen) {
      requesting = true;
      try { await document.documentElement.requestFullscreen(); } catch (_) { /* Keep the screen-filling layout. */ }
      finally { requesting = false; }
    }
  });
  exitButton.addEventListener('click', exit);
  document.addEventListener('fullscreenchange', function () {
    if (active && !requesting && !document.fullscreenElement) update(false);
  });
  // Capture Escape before it reaches the calculator's clear-entry shortcut.
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && active && !modal.open) {
      event.preventDefault();
      event.stopImmediatePropagation();
      exit();
    }
  }, true);
  document.getElementById('share').addEventListener('click', function () {
    document.getElementById('modal-title').textContent = tr('Share this activity');
    document.getElementById('modal-body').replaceChildren(document.getElementById('dialog-share').content.cloneNode(true));
    const input = document.getElementById('share-url');
    const status = document.getElementById('share-status');
    input.value = i18n ? i18n.url('https://activities.zornscience.org/scientific-calculator/') : 'https://activities.zornscience.org/scientific-calculator/';
    document.getElementById('copy-link').addEventListener('click', async function () {
      try {
        if (!navigator.clipboard) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(input.value);
        status.textContent = tr('Link copied.');
      } catch (_) {
        input.focus();
        input.select();
        status.textContent = tr('Select and copy the activity link.');
      }
    });
    modal.showModal();
  });
}());
