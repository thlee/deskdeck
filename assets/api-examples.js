// Example visibility and code copying are controlled only by visitor actions.
(() => {
  'use strict';
  for (const button of document.querySelectorAll('[data-examples-action]')) {
    button.addEventListener('click', () => {
      const examples = document.querySelectorAll('#api-examples .api-example');
      const open = button.dataset.examplesAction === 'expand';
      for (const example of examples) example.open = open;
      const status = document.getElementById('api-examples-status');
      if (status) status.textContent = button.dataset.examplesMessage.replace('{count}', String(examples.length));
    });
  }
  for (const button of document.querySelectorAll('[data-copy-code]')) {
    button.addEventListener('click', async () => {
      const code = document.getElementById(button.dataset.copyCode);
      const status = document.getElementById(button.dataset.copyStatus);
      if (!code || !status) return;
      button.disabled = true;
      status.textContent = '';
      try {
        if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(code.textContent);
        status.textContent = button.dataset.copied;
      } catch (_) {
        let selected = false;
        try {
          const range = document.createRange();
          range.selectNodeContents(code);
          const selection = window.getSelection();
          if (selection) {
            selection.removeAllRanges();
            selection.addRange(range);
            selected = true;
          }
        } catch (_) {}
        status.textContent = selected ? button.dataset.copySelected : button.dataset.copyFailed;
      } finally {
        button.disabled = false;
      }
    });
  }
})();
