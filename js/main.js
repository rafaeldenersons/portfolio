// main__.js — interações leves, acessibilidade e ajuste dinâmico do footer (QR + botão)
// Versão revisada: mais defensiva, comentada e com pequenas melhorias de desempenho.

/* utility: debounce */
function debounce(fn, wait = 100){
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

/* ----------------------- MENU / MOBILE ----------------------- */
(function(){
  const menuToggle = document.getElementById('menuToggle');
  const nav = document.querySelector('.nav');
  const mobileMenu = document.getElementById('mobileMenu');

  if (!menuToggle) return;

  menuToggle.addEventListener('click', () => {
    const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
    const newVal = String(!expanded);
    menuToggle.setAttribute('aria-expanded', newVal);

    if (mobileMenu) {
      mobileMenu.hidden = expanded;
      mobileMenu.setAttribute('aria-hidden', String(expanded));
    } else if (nav) {
      nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
    }
  });

  if (mobileMenu && menuToggle) {
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mobileMenu.hidden = true;
        mobileMenu.setAttribute('aria-hidden', 'true');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }
})();

/* ----------------------- NAV HIGHLIGHT / PARALLAX / KEYBOARD ----------------------- */
(function(){
  const sections = Array.from(document.querySelectorAll('main section'));
  const navLinks = Array.from(document.querySelectorAll('.nav a'));

  if (sections.length && navLinks.length) {
    const getOffset = el => el.getBoundingClientRect().top + window.scrollY;

    function changeActive(){
      const scrollPos = window.scrollY + 140;
      let currentIndex = 0;
      for (let i = 0; i < sections.length; i++){
        if (getOffset(sections[i]) <= scrollPos) currentIndex = i;
      }
      navLinks.forEach(a => a.classList.remove('active'));
      if (navLinks[currentIndex]) navLinks[currentIndex].classList.add('active');
    }

    changeActive();
    window.addEventListener('scroll', debounce(changeActive, 80), { passive: true });
    window.addEventListener('resize', debounce(changeActive, 120));
  }

  // hero parallax (very light)
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg) {
    window.addEventListener('scroll', () => {
      const sc = Math.round(window.scrollY * 0.15);
      heroBg.style.transform = `translateY(${sc}px)`;
    }, { passive: true });
  }

  // keyboard 's' jump to main (accessible shortcut)
  document.addEventListener('keydown', (e) => {
    const tag = (document.activeElement && document.activeElement.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable) return;

    if (e.key === 's' || e.key === 'S') {
      const main = document.querySelector('main');
      if (main) main.scrollIntoView({ behavior: 'smooth' });
    }
  });
})();

/* ----------------------- SMOOTH ANCHORS + BACK TO TOP ----------------------- */
(function(){
  const backTop = document.getElementById('backTop');
  const topAnchor = document.getElementById('top');

  if (backTop && topAnchor) {
    backTop.addEventListener('click', (e) => {
      e.preventDefault();
      topAnchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
      try { history.replaceState(null, '', '#top'); } catch (err) { /* ignore */ }

      // focus management for accessibility
      topAnchor.setAttribute('tabindex', '-1');
      topAnchor.focus({ preventScroll: true });
      setTimeout(() => topAnchor.removeAttribute('tabindex'), 1000);
    });
  }

  // Delegate: smooth anchors across page
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(ev){
      const href = a.getAttribute('href');
      if (!href || href === '#' || href === '#!') return;
      const target = document.querySelector(href);
      if (target) {
        ev.preventDefault();
        const headerOffset = 72 + 12; // must match CSS scroll-padding-top approximate
        const elementPosition = target.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        try { history.pushState(null, '', href); } catch (err) { /* ignore */ }
      }
    });
  });
})();

/* ----------------------- FOOTER ALIGN: move .footer-right (caption+QR+button)
   Objetivo: subir em conjunto a legenda, a imagem do QR e o botão "Voltar ao topo"
   para que o centro do botão alinhe verticalmente com o centro de .footer-left
-------------------------------------------------------------------------- */
(function(){
  const docEl = document.documentElement;

  // parse CSS custom property safely into number (px or unitless)
  function parseCap(varName, fallback){
    const val = getComputedStyle(docEl).getPropertyValue(varName);
    if (!val) return fallback;
    const n = parseFloat(val);
    return Number.isFinite(n) ? Math.abs(n) : fallback;
  }

  // if footerInner stacks (column), we skip adjustments (mobile)
  function footerShouldSkip(footerInner){
    if (!footerInner) return true;
    const st = getComputedStyle(footerInner);
    return st.flexDirection === 'column' || st.display === 'block';
  }

  function alignFooterRight(){
    const footerInner = document.querySelector('.footer-inner');
    if (!footerInner) return;

    const left = footerInner.querySelector('.footer-left');
    const right = footerInner.querySelector('.footer-right');
    if (!left || !right) return;

    // when stacked (mobile), we don't transform
    if (footerShouldSkip(footerInner)) {
      right.style.transform = 'none';
      return;
    }

    // reset transform before measuring for clean values
    right.style.transform = 'none';

    const backBtn = right.querySelector('.back-top');
    if (!backBtn) return;

    // measure positions (defensive: ensure values exist)
    const leftRect = left.getBoundingClientRect();
    const backRect = backBtn.getBoundingClientRect();
    if (!leftRect || !backRect) return;

    const leftCenterY = leftRect.top + leftRect.height / 2;
    const backCenterY = backRect.top + backRect.height / 2;

    // If back is lower than left, delta positive => we need to move right upwards
    let delta = backCenterY - leftCenterY; // positive => back is lower

    // caps from CSS variables
    const capDesktop = parseCap('--qr-raise-cap-desktop', 40);
    const capTablet  = parseCap('--qr-raise-cap-tablet', 24);
    const capMobile  = parseCap('--qr-raise-cap-mobile', 12);

    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    let cap = capDesktop;
    if (vw <= 720) cap = capMobile;
    else if (vw <= 980) cap = capTablet;

    // clamp delta
    if (delta > cap) delta = cap;
    if (delta < -cap) delta = -cap;

    // translateY negative to move upwards when back is below left
    const translateY = -Math.round(delta);

    // apply via rAF for smoothness
    window.requestAnimationFrame(() => {
      right.style.transform = `translateY(${translateY}px)`;
    });
  }

  // Wait for fonts and images to be ready to get stable measurements
  function whenStable(cb){
    const tasks = [];

    // fonts ready (if supported)
    if (document.fonts && document.fonts.ready) {
      tasks.push(document.fonts.ready);
    }

    // wait for QR image (if present)
    const qr = document.querySelector('.qr-image');
    if (qr && !qr.complete) {
      tasks.push(new Promise(resolve => {
        qr.addEventListener('load', resolve, { once: true });
        qr.addEventListener('error', resolve, { once: true });
      }));
    }

    // short timeout to let layout settle
    tasks.push(new Promise(resolve => setTimeout(resolve, 120)));

    return Promise.all(tasks).then(cb).catch(cb);
  }

  // initial alignment once stable
  whenStable(alignFooterRight);

  // re-align on relevant events
  window.addEventListener('load', () => setTimeout(alignFooterRight, 140));
  window.addEventListener('orientationchange', () => setTimeout(alignFooterRight, 180));
  window.addEventListener('resize', debounce(alignFooterRight, 110), { passive: true });

  // observe footer mutations (lightweight)
  const footer = document.querySelector('.site-footer');
  if (footer && typeof MutationObserver !== 'undefined') {
    const mo = new MutationObserver(debounce(alignFooterRight, 160));
    mo.observe(footer, { childList: true, subtree: true, attributes: false });
  }
})();
