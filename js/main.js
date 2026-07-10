// Scroll progress bar + nav shrink + hero scroll-cue
const progress = document.getElementById('progress');
const navbar = document.getElementById('navbar');
const scrollCue = document.querySelector('.scroll-cue');
let ticking = false;

function onScroll() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  progress.style.width = pct + '%';
  navbar.classList.toggle('scrolled', scrollTop > 40);
  if (scrollCue) scrollCue.classList.toggle('hide', scrollTop > 60);
  ticking = false;
}

window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(onScroll);
    ticking = true;
  }
}, { passive: true });
onScroll();

// Mobile nav toggle
const burger = document.getElementById('nav-burger');
const navLinks = document.getElementById('nav-links');

burger.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  burger.setAttribute('aria-expanded', open);
});

navLinks.querySelectorAll('.navlink').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    burger.setAttribute('aria-expanded', false);
  });
});

// Smooth scroll to sections
document.querySelectorAll('[data-goto]').forEach(el => {
  el.addEventListener('click', () => {
    const id = el.getAttribute('data-goto');
    if (id === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  });
});

// Reveal on scroll
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealEls.forEach(el => io.observe(el));

// Menu tabs
const tabs = document.querySelectorAll('.menu-tab');
const panels = document.querySelectorAll('.menu-panel');
const glider = document.querySelector('.menu-tab-glider');

function moveGlider(tab) {
  if (!glider || !tab) return;
  glider.style.width = tab.offsetWidth + 'px';
  glider.style.transform = `translateX(${tab.offsetLeft - 4}px)`;
}

function activateTab(tab) {
  tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
  panels.forEach(p => p.classList.remove('active'));
  tab.classList.add('active');
  tab.setAttribute('aria-selected', 'true');
  document.querySelector(`.menu-panel[data-panel="${tab.dataset.tab}"]`)?.classList.add('active');
  moveGlider(tab);
}

tabs.forEach(tab => tab.addEventListener('click', () => activateTab(tab)));
window.addEventListener('resize', () => moveGlider(document.querySelector('.menu-tab.active')));
if (tabs.length) requestAnimationFrame(() => moveGlider(document.querySelector('.menu-tab.active')));

// Gallery tilt-on-hover
document.querySelectorAll('.gallery-tile.tilt').forEach(tile => {
  const strength = 10;
  tile.addEventListener('mousemove', (e) => {
    const rect = tile.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    tile.style.transform = `perspective(700px) rotateY(${x * strength}deg) rotateX(${-y * strength}deg) scale(1.02)`;
  });
  tile.addEventListener('mouseleave', () => {
    tile.style.transform = '';
  });
});
