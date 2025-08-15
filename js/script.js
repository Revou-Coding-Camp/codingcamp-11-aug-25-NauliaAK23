// Show current time
const nowEl = document.getElementById('now');
function renderTime() {
  const d = new Date();
  nowEl.textContent = 'Current time : ' + d.toString();
}
renderTime();
setInterval(renderTime, 1000);

// Format date to dd/mm/yyyy
function formatDateID(yyyyMmDd) {
  if (!yyyyMmDd) return '—';
  const [y, m, d] = yyyyMmDd.split('-');
  return `${d}/${m}/${y}`;
}

// Handle form submit
document.getElementById('msgForm').addEventListener('submit', (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const dob = document.getElementById('dob').value;
  const message = document.getElementById('message').value.trim();
  const gender = [...document.querySelectorAll('input[name="gender"]')]
    .find(r => r.checked)?.value || '—';

  document.getElementById('outName').textContent = name || '—';
  document.getElementById('outDob').textContent = formatDateID(dob);
  document.getElementById('outGender').textContent = gender;
  document.getElementById('outMsg').textContent = message || '—';
});



// ===== HERO SLIDER (animated) =====
(function initHeroSlider() {
  const track = document.getElementById('heroTrack');
  const viewport = document.getElementById('heroViewport');
  const prevBtn = document.getElementById('heroPrev');
  const nextBtn = document.getElementById('heroNext');
  const dotsWrap = document.getElementById('heroDots');
  if (!track || !viewport) return;

  const baseSlides = Array.from(track.children); // real slides only
  const realCount = baseSlides.length;
  if (realCount === 0) return;

  // Clone first & last for infinite loop
  const firstClone = baseSlides[0].cloneNode(true);
  const lastClone = baseSlides[realCount - 1].cloneNode(true);
  track.insertBefore(lastClone, baseSlides[0]);
  track.appendChild(firstClone);

  // State
  let index = 1; // start at first real slide
  const autoMs = 4000;
  let autoTimer = null;
  let isHovering = false;

  // Apply initial transform and transition classes
  function setTransition(on) {
    if (on) {
      track.classList.add('transition-transform', 'duration-700', 'ease-out');
    } else {
      track.classList.remove('transition-transform', 'duration-700', 'ease-out');
    }
  }

  function goTo(i, withAnim = true) {
    index = i;
    setTransition(withAnim);
    track.style.transform = `translateX(-${index * 100}%)`;
    updateDots();
  }

  // Build dots for real slides
  dotsWrap.innerHTML = '';
  for (let i = 0; i < realCount; i++) {
    const b = document.createElement('button');
    b.className =
      'h-2 w-2 rounded-full border border-white/70 bg-white/50 aria-[current=true]:bg-white aria-[current=true]:w-4 transition-all';
    b.setAttribute('aria-label', `Go to slide ${i + 1}`);
    b.addEventListener('click', () => goTo(i + 1)); // +1 because of leading clone
    dotsWrap.appendChild(b);
  }

  function updateDots() {
    // Map current index to real slide [0..realCount-1]
    let realIndex = index - 1;
    if (realIndex < 0) realIndex = realCount - 1;
    if (realIndex >= realCount) realIndex = 0;
    [...dotsWrap.children].forEach((d, i) => {
      if (i === realIndex) d.setAttribute('aria-current', 'true');
      else d.removeAttribute('aria-current');
    });
  }

  function next() { goTo(index + 1); }
  function prev() { goTo(index - 1); }

  // Seamless loop jump on edges
  track.addEventListener('transitionend', () => {
    if (index === 0) {
      // Jump to last real
      goTo(realCount, false);
    } else if (index === realCount + 1) {
      // Jump to first real
      goTo(1, false);
    }
  });

  // Buttons
  prevBtn?.addEventListener('click', prev);
  nextBtn?.addEventListener('click', next);

  // Autoplay
  function startAuto() {
    stopAuto();
    autoTimer = setInterval(() => {
      if (!isHovering) next();
    }, autoMs);
  }
  function stopAuto() {
    if (autoTimer) clearInterval(autoTimer);
    autoTimer = null;
  }

  // Pause on hover
  viewport.addEventListener('mouseenter', () => { isHovering = true; });
  viewport.addEventListener('mouseleave', () => { isHovering = false; });

  // Handle resize to keep alignment
  window.addEventListener('resize', () => {
    // Re-apply transform without animation
    const current = index;
    goTo(current, false);
  });

  // Basic swipe support
  let startX = 0;
  let dragging = false;

  function onPointerDown(e) {
    dragging = true;
    startX = e.clientX || e.touches?.[0]?.clientX || 0;
    stopAuto();
    setTransition(false);
  }
  function onPointerMove(e) {
    if (!dragging) return;
    const x = e.clientX || e.touches?.[0]?.clientX || 0;
    const dxPct = ((x - startX) / viewport.clientWidth) * 100;
    track.style.transform = `translateX(calc(-${index * 100}% + ${-dxPct}%))`;
  }
  function onPointerUp(e) {
    if (!dragging) return;
    dragging = false;
    const endX = e.clientX || e.changedTouches?.[0]?.clientX || 0;
    const dx = endX - startX;
    const threshold = viewport.clientWidth * 0.15; // 15% swipe
    setTransition(true);
    if (dx > threshold) prev();
    else if (dx < -threshold) next();
    else goTo(index); // snap back
    startAuto();
  }

  viewport.addEventListener('mousedown', onPointerDown);
  window.addEventListener('mousemove', onPointerMove);
  window.addEventListener('mouseup', onPointerUp);

  viewport.addEventListener('touchstart', onPointerDown, { passive: true });
  viewport.addEventListener('touchmove', onPointerMove, { passive: true });
  viewport.addEventListener('touchend', onPointerUp);

  // Init
  // Set starting transform without animation (we're on the first real slide)
  goTo(1, false);
  // Kick off autoplay
  startAuto();
})();

