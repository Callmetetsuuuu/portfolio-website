// main.js
// Bootstraps page behaviors after DOM is ready.

document.addEventListener('DOMContentLoaded', () => {
  if (window.initToggle) window.initToggle();
  if (window.initBanner) window.initBanner();

  const tabs = document.querySelectorAll('.tab-btn');
  const contents = document.querySelectorAll('[data-content]');

  const activateTab = (name) => {
    tabs.forEach((tab) => {
      const isActive = tab.dataset.tab === name;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
    contents.forEach((content) => {
      content.classList.toggle('hidden', content.dataset.content !== name);
    });
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => activateTab(tab.dataset.tab));
  });

  document.querySelectorAll('.tab-show-more').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.target;
      const content = document.querySelector('[data-content="' + target + '"]');
      if (!content) return;
      const hiddenItems = content.querySelectorAll('.extra');
      const isHidden = hiddenItems.length > 0 && hiddenItems[0].classList.contains('hidden');
      hiddenItems.forEach((el) => el.classList.toggle('hidden', !isHidden));
      btn.textContent = isHidden ? 'Show less' : 'Show more';
    });
  });
});

