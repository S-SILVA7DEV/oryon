// assets/js/theme.js
(function () {
  const STORAGE_KEY = 'oryon-theme';

  function applyTheme(mode) {
    if (mode === 'dark') document.documentElement.classList.add('dark-mode');
    else document.documentElement.classList.remove('dark-mode');

    try { localStorage.setItem(STORAGE_KEY, mode); } catch (e) { /* ignore */ }
    updateToggleIcons(mode);
  }

  function updateToggleIcons(mode) {
    // procura por [data-theme-toggle] e pelo id #theme-toggle (compatibilidade)
    const btns = Array.from(document.querySelectorAll('[data-theme-toggle]'));
    const byId = document.getElementById('theme-toggle');
    if (byId && !btns.includes(byId)) btns.push(byId);

    btns.forEach(btn => {
      const icon = btn.querySelector('i');
      if (!icon) return;
      // se estiver usando RemixIcon
      if (mode === 'dark') icon.className = 'ri-sun-line';
      else icon.className = 'ri-moon-line';
    });
  }

  // Ler preferencia do localStorage ou sistema (prefers-color-scheme)
  const saved = (function(){
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  })();

  // Se o usuário já salvou escolha — usa ela. Se não, usa a preferência do sistema.
  const initial = saved || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  applyTheme(initial);

  // Adiciona handlers: procura pelos elementos com atributo ou pelo id
  const buttons = Array.from(document.querySelectorAll('[data-theme-toggle]'));
  const btnById = document.getElementById('theme-toggle');
  if (btnById && !buttons.includes(btnById)) buttons.push(btnById);

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const isDark = document.documentElement.classList.contains('dark-mode');
      applyTheme(isDark ? 'light' : 'dark');
    });
  });

  // opcional: atualiza ícones caso elementos sejam adicionados depois
  const observer = new MutationObserver(() => updateToggleIcons(document.documentElement.classList.contains('dark-mode') ? 'dark' : 'light'));
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
