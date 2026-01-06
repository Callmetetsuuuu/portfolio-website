window.initMetrics = function initMetrics(root = document) {
  const get = root.getElementById ? root.getElementById.bind(root) : document.getElementById.bind(document);

  const likeBtn = get('likeBtn');
  const likeIcon = get('likeIcon');
  const likeCountEl = get('likeCount');
  const shareBtn = get('shareBtn');
  const shareIcon = get('shareIcon');
  const shareCountEl = get('shareCount');
  const shareFeedback = get('shareFeedback');
  const likeFeedback = get('likeFeedback');

  if (!likeBtn || !likeIcon || !likeCountEl || !shareBtn || !shareIcon || !shareCountEl) {
    return;
  }

  const storedLiked = localStorage.getItem('jl_liked');
  const storedLikes = localStorage.getItem('jl_likes');
  const storedShares = localStorage.getItem('jl_shares');

  let liked = storedLiked === '1';
  let likes = storedLikes ? parseInt(storedLikes, 10) : parseInt(likeCountEl.textContent.replace(/[^0-9]/g, ''), 10) || 0;
  let shares = storedShares ? parseInt(storedShares, 10) : parseInt(shareCountEl.textContent.replace(/[^0-9]/g, ''), 10) || 0;

  likeCountEl.textContent = likes;
  shareCountEl.textContent = shares;
  if (liked) {
    likeIcon.classList.add('metric-active');
    likeIcon.classList.add('ph-fill');
    likeBtn.setAttribute('aria-pressed', 'true');
  }

  function flash(element) {
    element.classList.add('metric-pulse');
    setTimeout(() => element.classList.remove('metric-pulse'), 600);
  }

  function toggleLike() {
    liked = !liked;
    if (liked) {
      likes += 1;
      likeIcon.classList.add('metric-active');
      likeIcon.style.opacity = '0';
      setTimeout(() => {
        likeIcon.classList.add('ph-fill');
        likeIcon.style.opacity = '1';
      }, 100);
      likeBtn.setAttribute('aria-pressed', 'true');
      if (likeFeedback) {
        likeFeedback.classList.remove('hidden');
        setTimeout(() => likeFeedback.classList.add('hidden'), 1200);
      }
    } else {
      likes = Math.max(0, likes - 1);
      likeIcon.classList.remove('metric-active');
      likeIcon.style.opacity = '0';
      setTimeout(() => {
        likeIcon.classList.remove('ph-fill');
        likeIcon.style.opacity = '1';
      }, 100);
      likeBtn.setAttribute('aria-pressed', 'false');
      if (likeFeedback) likeFeedback.classList.add('hidden');
    }
    likeCountEl.textContent = likes;
    localStorage.setItem('jl_liked', liked ? '1' : '0');
    localStorage.setItem('jl_likes', String(likes));
    flash(likeBtn);
  }

  function handleKeyActivate(e, handler) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handler(); }
  }

  likeBtn.addEventListener('click', toggleLike);
  likeBtn.addEventListener('keydown', (e) => handleKeyActivate(e, toggleLike));

  if (shareBtn) {
    async function shareAction() {
      shares += 1;
      shareCountEl.textContent = shares;
      localStorage.setItem('jl_shares', String(shares));
      flash(shareBtn);

      const url = window.location.href;
      try {
        await navigator.clipboard.writeText(url);
        if (shareFeedback) shareFeedback.textContent = 'Copied!';
        if (shareFeedback) shareFeedback.classList.remove('hidden');
        shareIcon.classList.remove('ph-copy');
        shareIcon.classList.add('ph-check');
        setTimeout(() => {
          shareIcon.classList.remove('ph-check');
          shareIcon.classList.add('ph-copy');
          if (shareFeedback) shareFeedback.classList.add('hidden');
        }, 5000);
      } catch (err) {
        if (shareFeedback) {
          shareFeedback.textContent = 'Unable to copy';
          shareFeedback.classList.remove('hidden');
          setTimeout(() => {
            shareFeedback.classList.add('hidden');
            shareFeedback.textContent = 'Copied!';
          }, 1200);
        }
      }
    }

    shareBtn.addEventListener('click', shareAction);
    shareBtn.addEventListener('keydown', (e) => handleKeyActivate(e, shareAction));
  }
};