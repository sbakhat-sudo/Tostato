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
function bindTilt(tile) {
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
}
document.querySelectorAll('.gallery-tile.tilt').forEach(bindTilt);

// ---------- Area manager ----------
// ⚠️ cambia questa password prima di pubblicare
const MANAGER_PASSWORD = 'tostato2026';

const loginOverlay = document.getElementById('login-overlay');
const loginPass = document.getElementById('login-pass');

function apriLogin() {
  loginOverlay.classList.add('aperto');
  loginPass.value = '';
  setTimeout(() => loginPass.focus(), 100);
}
document.getElementById('apri-login').addEventListener('click', apriLogin);
document.getElementById('login-annulla').addEventListener('click', () => {
  loginOverlay.classList.remove('aperto');
});
loginOverlay.addEventListener('click', (e) => {
  if (e.target === loginOverlay) loginOverlay.classList.remove('aperto');
});

const SEL_EDITABILI = ['.menu-panel li span', '.info-editabile'];

function attivaManager() {
  document.body.classList.add('manager');
  SEL_EDITABILI.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      el.setAttribute('contenteditable', 'true');
      el.classList.add('editabile');
    });
  });
}
function disattivaManager() {
  document.body.classList.remove('manager');
  document.querySelectorAll('[contenteditable]').forEach(el => {
    el.removeAttribute('contenteditable');
    el.classList.remove('editabile');
  });
}
function tentaLogin() {
  if (loginPass.value === MANAGER_PASSWORD) {
    loginOverlay.classList.remove('aperto');
    attivaManager();
  } else {
    loginPass.classList.add('errore');
    setTimeout(() => loginPass.classList.remove('errore'), 450);
  }
}
document.getElementById('login-entra').addEventListener('click', tentaLogin);
loginPass.addEventListener('keydown', (e) => { if (e.key === 'Enter') tentaLogin(); });
document.getElementById('mb-esci').addEventListener('click', disattivaManager);

// modifica rapida dei prezzi del menu
const prezzoOverlay = document.getElementById('prezzo-overlay');
const prezzoInput = document.getElementById('prezzo-input');
let prezzoTarget = null;

function chiudiPrezzo() {
  prezzoOverlay.classList.remove('aperto');
  prezzoTarget = null;
}
document.getElementById('menu').addEventListener('click', (e) => {
  const btn = e.target.closest('.prezzo-edit');
  if (!btn) return;
  prezzoTarget = btn.previousElementSibling;
  prezzoInput.value = prezzoTarget.textContent.trim();
  prezzoOverlay.classList.add('aperto');
  setTimeout(() => { prezzoInput.focus(); prezzoInput.select(); }, 100);
});
document.getElementById('prezzo-salva').addEventListener('click', () => {
  const valore = prezzoInput.value.trim();
  if (prezzoTarget && valore) prezzoTarget.textContent = valore;
  chiudiPrezzo();
});
document.getElementById('prezzo-annulla').addEventListener('click', chiudiPrezzo);
prezzoOverlay.addEventListener('click', (e) => { if (e.target === prezzoOverlay) chiudiPrezzo(); });
prezzoInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') document.getElementById('prezzo-salva').click(); });

// gestione foto (cambia / elimina / aggiungi) — riusata per Galleria e Lo spazio
const imgInput = document.getElementById('img-input');
let bgTarget = null;
imgInput.addEventListener('change', () => {
  const file = imgInput.files[0];
  if (!file || !bgTarget) return;
  const reader = new FileReader();
  reader.onload = () => { bgTarget.style.backgroundImage = `url('${reader.result}')`; };
  reader.readAsDataURL(file);
  imgInput.value = '';
  bgTarget = null;
});

function setupPhotoGrid(gridSelector, addBtnId, addInputId) {
  const grid = document.querySelector(gridSelector);
  if (!grid) return;

  grid.addEventListener('click', (e) => {
    const cambiaBtn = e.target.closest('.g-cambia');
    const eliminaBtn = e.target.closest('.g-elimina');
    if (cambiaBtn) {
      e.preventDefault(); e.stopPropagation();
      bgTarget = cambiaBtn.closest('.gallery-tile').querySelector('.tile-bg');
      imgInput.click();
      return;
    }
    if (eliminaBtn) {
      e.preventDefault(); e.stopPropagation();
      if (confirm('Sei sicuro di voler eliminare questa foto?')) {
        eliminaBtn.closest('.gallery-tile').remove();
      }
    }
  });

  const addBtn = document.getElementById(addBtnId);
  const addInput = document.getElementById(addInputId);
  if (!addBtn || !addInput) return;
  addBtn.addEventListener('click', () => addInput.click());
  addInput.addEventListener('change', () => {
    const file = addInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const nome = prompt('Didascalia della foto (facoltativo):') || '';
      const tile = document.createElement('div');
      tile.className = 'gallery-tile tile-photo tilt';
      tile.innerHTML = `<div class="tile-bg" style="background-image:url('${reader.result}')"></div>`
        + `<span>${nome}</span>`
        + `<div class="g-manager"><button type="button" class="g-cambia" aria-label="Cambia foto">✏️</button><button type="button" class="g-elimina" aria-label="Elimina foto">🗑️</button></div>`;
      grid.appendChild(tile);
      bindTilt(tile);
    };
    reader.readAsDataURL(file);
    addInput.value = '';
  });
}
setupPhotoGrid('#galleria .gallery-grid', 'g-aggiungi', 'g-nuova-input');
setupPhotoGrid('#spazio .spazio-grid', 's-aggiungi', 's-nuova-input');

// salva: genera il file HTML aggiornato e lo scarica
document.getElementById('mb-salva').addEventListener('click', () => {
  const clone = document.documentElement.cloneNode(true);
  clone.querySelector('body').classList.remove('manager');
  const ov = clone.querySelector('#login-overlay'); if (ov) ov.classList.remove('aperto');
  const po = clone.querySelector('#prezzo-overlay'); if (po) po.classList.remove('aperto');
  const nv = clone.querySelector('#navbar'); if (nv) nv.classList.remove('scrolled');
  const pg = clone.querySelector('#progress'); if (pg) pg.style.width = '0';
  clone.querySelectorAll('.reveal').forEach(el => el.classList.remove('in'));
  clone.querySelectorAll('.gallery-tile').forEach(el => { el.style.transform = ''; });
  clone.querySelectorAll('[contenteditable]').forEach(el => {
    el.removeAttribute('contenteditable');
    el.classList.remove('editabile');
  });

  const contenuto = '<!DOCTYPE html>\n' + clone.outerHTML;
  const blob = new Blob([contenuto], { type: 'text/html' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'tostato.html';
  document.body.appendChild(a);
  a.click();
  a.remove();
});
