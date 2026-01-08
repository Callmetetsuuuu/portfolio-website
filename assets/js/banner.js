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
  // Accept an optional image path to display in the modal
  window.showImageModal = (imgPath) => {
    if (!imageModal) return;
    const img = document.getElementById('imageModalImg') || imageModal.querySelector('img');
    const prevBtn = document.getElementById('imagePrevBtn');
    const nextBtn = document.getElementById('imageNextBtn');

    // Initialize gallery context if not present
    if (!window._currentGalleryImages || !Array.isArray(window._currentGalleryImages) || window._currentGalleryImages.length === 0) {
      window._currentGalleryImages = imgPath ? [imgPath] : [];
    }

    // Find index in current gallery
    const idx = window._currentGalleryImages.indexOf(imgPath);
    window._currentGalleryIndex = idx >= 0 ? idx : 0;

    if (imgPath && img) {
      img.src = imgPath;
      img.alt = imgPath.split('/').pop();
      img.style.maxHeight = '85vh';
    }

    // Ensure image modal sits above other modals
    try { imageModal.style.zIndex = '99999'; } catch (e) {}
    document.body.style.overflow = 'hidden';
    imageModal.classList.remove('hidden');
    imageModal.classList.add('flex');

    // Update prev/next button visibility
    if (prevBtn) prevBtn.classList.toggle('hidden', window._currentGalleryImages.length <= 1);
    if (nextBtn) nextBtn.classList.toggle('hidden', window._currentGalleryImages.length <= 1);

    requestAnimationFrame(() => {
      const bg = imageModal.querySelector('.bg-black\/90');
      if (bg) bg.style.opacity = '0.4';
      if (img) img.style.transform = 'scale(1)';
    });
  };

  window.hideImageModal = () => {
    if (!imageModal) return;
    document.body.style.overflow = '';
    imageModal.classList.add('hidden');
    imageModal.classList.remove('flex');
    try { imageModal.style.zIndex = ''; } catch (e) {}
    // clear gallery context
    window._currentGalleryImages = [];
    window._currentGalleryIndex = 0;
  };

  // Helper to navigate images
  function showImageAtIndex(index) {
    const imageEl = document.getElementById('imageModalImg');
    if (!imageEl || !window._currentGalleryImages || !window._currentGalleryImages.length) return;
    const len = window._currentGalleryImages.length;
    const i = ((index % len) + len) % len;
    window._currentGalleryIndex = i;
    const src = window._currentGalleryImages[i];
    imageEl.src = src;
    imageEl.alt = src.split('/').pop();
  }

  // Wire prev/next buttons immediately (initBanner is called on DOMContentLoaded)
  const prevBtn = document.getElementById('imagePrevBtn');
  const nextBtn = document.getElementById('imageNextBtn');
  if (prevBtn) prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    showImageAtIndex((window._currentGalleryIndex || 0) - 1);
  });
  if (nextBtn) nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    showImageAtIndex((window._currentGalleryIndex || 0) + 1);
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    const modal = document.getElementById('imageModal');
    if (!modal || modal.classList.contains('hidden')) return;
    if (e.key === 'ArrowLeft') showImageAtIndex((window._currentGalleryIndex || 0) - 1);
    if (e.key === 'ArrowRight') showImageAtIndex((window._currentGalleryIndex || 0) + 1);
  });

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