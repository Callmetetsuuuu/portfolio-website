document.addEventListener && document.addEventListener('DOMContentLoaded', () => {});

// banner.js
window.initBanner = function initBanner(root = document) {
  const banner = root.getElementById ? root.getElementById('banner') : document.getElementById('banner');
  const hero = document.querySelector('section.max-w-4xl');
  const bannerImg = document.getElementById('banner-img');
  const imageModal = document.getElementById('imageModal');

  const setBannerHeight = () => {
    if (!banner || !hero) return;
    const heroH = hero.offsetHeight || hero.getBoundingClientRect().height || 300;
    const target = Math.round(heroH * 0.8);
    banner.style.height = target + 'px';
    if (bannerImg) bannerImg.style.height = '100%';
  };

  // Modal functions
  window.showImageModal = () => {
    if (!imageModal) return;
    document.body.style.overflow = 'hidden';
    imageModal.classList.remove('hidden');
    imageModal.classList.add('flex');
    requestAnimationFrame(() => {
      const bg = imageModal.querySelector('.bg-black\\/90');
      const img = imageModal.querySelector('img');
      if (bg) bg.style.opacity = '0.4';  // Reduced opacity (darker, less transparent)
      if (img) img.style.transform = 'scale(1)';
    });
  };

  window.hideImageModal = () => {
    if (!imageModal) return;
    document.body.style.overflow = '';
    imageModal.classList.add('hidden');
    imageModal.classList.remove('flex');
  };

  // Close on escape
  if (!window._bannerEscBound) {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') window.hideImageModal?.();
    });
    window._bannerEscBound = true;
  }

  setBannerHeight();
  if (!window._bannerResizeBound) {
    window.addEventListener('resize', setBannerHeight);
    window._bannerResizeBound = true;
  }
};