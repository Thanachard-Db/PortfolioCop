/* ==========================================================
   SETUP
========================================================== */
const isTouch = window.matchMedia('(hover: none)').matches;
const isMobile = window.innerWidth < 900;
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ==========================================================
   LOADER
========================================================== */
const loader = document.getElementById('loader');
const loaderPct = document.getElementById('loaderPct');
let pct = 0;
const loaderInterval = setInterval(() => {
  pct += Math.floor(Math.random() * 18) + 6;
  if (pct >= 100) {
    pct = 100;
    loaderPct.textContent = pct;
    clearInterval(loaderInterval);
    setTimeout(() => {
      loader.classList.add('done');
      document.body.style.overflow = '';
      initWordReveal();
    }, 300);
  } else {
    loaderPct.textContent = pct;
  }
}, 120);
document.body.style.overflow = 'hidden';
setTimeout(() => { document.body.style.overflow = ''; }, 2000);

/* ==========================================================
   CUSTOM CURSOR
========================================================== */
const cursorGlow = document.getElementById('cursorGlow');
const cursorDot = document.getElementById('cursorDot');
let mouseX = 0, mouseY = 0, glowX = 0, glowY = 0;

if (!isTouch) {
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX; mouseY = e.clientY;
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top = mouseY + 'px';
  });

  function animateGlow() {
    glowX += (mouseX - glowX) * 0.12;
    glowY += (mouseY - glowY) * 0.12;
    cursorGlow.style.left = glowX + 'px';
    cursorGlow.style.top = glowY + 'px';
    requestAnimationFrame(animateGlow);
  }
  animateGlow();

  document.querySelectorAll('a, button, .slide-card').forEach(el => {
    el.addEventListener('mouseenter', () => cursorDot.classList.add('big'));
    el.addEventListener('mouseleave', () => cursorDot.classList.remove('big'));
  });
} else {
  cursorGlow.style.display = 'none';
  cursorDot.style.display = 'none';
}

/* ==========================================================
   NAV
========================================================== */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

const navBurger = document.getElementById('navBurger');
const mobileMenu = document.getElementById('mobileMenu');
navBurger.addEventListener('click', () => {
  navBurger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
});
mobileMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navBurger.classList.remove('open');
    mobileMenu.classList.remove('open');
  });
});

/* ==========================================================
   MAGNETIC BUTTONS
========================================================== */
if (!isTouch && !prefersReduced) {
  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${x * 0.28}px, ${y * 0.35}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = 'translate(0,0)'; });
  });
}

/* ==========================================================
   SCROLL REVEAL (IntersectionObserver)
========================================================== */
const revealTargets = document.querySelectorAll('.reveal-up, .reveal-fade');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
revealTargets.forEach(el => revealObserver.observe(el));

/* Word-by-word hero title reveal, staggered */
function initWordReveal() {
  const words = document.querySelectorAll('.reveal-word');
  words.forEach((w, i) => {
    setTimeout(() => w.classList.add('in-view'), 120 * i);
  });
  document.querySelectorAll('.reveal-line').forEach((l, i) => {
    setTimeout(() => l.classList.add('in-view'), 100 + 80 * i);
  });
}

/* ==========================================================
   TIMELINE PROGRESS FILL
========================================================== */
const timelineFill = document.getElementById('timelineFill');
const timelineEl = document.querySelector('.timeline');
if (timelineFill && timelineEl) {
  window.addEventListener('scroll', () => {
    const rect = timelineEl.getBoundingClientRect();
    const vh = window.innerHeight;
    const total = rect.height;
    const visible = Math.min(Math.max(vh * 0.8 - rect.top, 0), total);
    const ratio = total > 0 ? (visible / total) * 100 : 0;
    timelineFill.style.height = Math.min(ratio, 100) + '%';
  }, { passive: true });
}

/* ==========================================================
   3D PERSPECTIVE SLIDER
========================================================== */
(function slider() {
  const slides = Array.from(document.querySelectorAll('.slide'));
  const total = slides.length;
  let current = 0;
  let autoTimer;

  const prevBtn = document.getElementById('prevSlide');
  const nextBtn = document.getElementById('nextSlide');
  const slideNow = document.getElementById('slideNow');
  const slideMax = document.getElementById('slideMax');
  const progressBar = document.getElementById('progressBar');
  const stage = document.getElementById('sliderStage');

  slideMax.textContent = String(total).padStart(2, '0');

  function render() {
    slides.forEach((slide, i) => {
      slide.classList.remove('active', 'prev', 'next-hidden');
      if (i === current) slide.classList.add('active');
      else if (i === (current - 1 + total) % total) slide.classList.add('prev');
      else if (i === (current + 1) % total) slide.classList.add('next-hidden');
    });
    slideNow.textContent = String(current + 1).padStart(2, '0');
    progressBar.style.width = ((current + 1) / total) * 100 + '%';
  }

  function goTo(index) {
    current = (index + total) % total;
    render();
    resetAuto();
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function resetAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(next, 6500);
  }

  nextBtn.addEventListener('click', next);
  prevBtn.addEventListener('click', prev);

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
  });

  // Touch swipe
  let touchStartX = 0;
  stage.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) { dx < 0 ? next() : prev(); }
  }, { passive: true });

  // Mouse wheel navigation (horizontal-ish intent while hovering the slider)
  let wheelLock = false;
  stage.addEventListener('wheel', (e) => {
    if (wheelLock) return;
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 20) {
      e.preventDefault();
      wheelLock = true;
      e.deltaX > 0 ? next() : prev();
      setTimeout(() => { wheelLock = false; }, 700);
    }
  }, { passive: false });

  // Mouse tilt + spotlight per active card (desktop only, respects reduced motion)
  if (!isTouch && !isMobile && !prefersReduced) {
    slides.forEach(slide => {
      const card = slide.querySelector('.slide-card');
      const spot = slide.querySelector('.spotlight');
      slide.addEventListener('mousemove', (e) => {
        if (!slide.classList.contains('active')) return;
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const rotY = (px - 0.5) * 14;
        const rotX = (0.5 - py) * 10;
        card.style.transform = `rotateY(${rotY}deg) rotateX(${rotX}deg) scale(1.01)`;
        spot.style.setProperty('--sx', (px * 100) + '%');
        spot.style.setProperty('--sy', (py * 100) + '%');
      });
      slide.addEventListener('mouseleave', () => {
        card.style.transform = 'rotateY(0deg) rotateX(0deg) scale(1)';
      });
    });
  }

  render();
  resetAuto();
})();

/* ==========================================================
   ACTIVITY PHOTO GALLERY (crossfade)
========================================================== */
(function activityGallery() {
  const photos = document.querySelectorAll('.activity-photo');
  if (!photos.length) return;
  let idx = 0;
  setInterval(() => {
    photos[idx].classList.remove('active');
    idx = (idx + 1) % photos.length;
    photos[idx].classList.add('active');
  }, 3200);
})();

/* ==========================================================
   HERO PARALLAX BLOBS (subtle, desktop only)
========================================================== */
if (!isTouch && !isMobile && !prefersReduced) {
  const blobs = document.querySelectorAll('.aurora-blob');
  window.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5);
    const y = (e.clientY / window.innerHeight - 0.5);
    blobs.forEach((b, i) => {
      const depth = (i + 1) * 10;
      b.style.marginLeft = `${x * depth}px`;
      b.style.marginTop = `${y * depth}px`;
    });
  });
}