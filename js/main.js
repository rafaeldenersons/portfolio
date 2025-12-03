// main.js — interações leves, acessibilidade e ajuste dinâmico do footer (QR + botão)
/* global document, window, history, getComputedStyle */

document.addEventListener('DOMContentLoaded', function () {

  /* --------------------------
     Menu / mobile toggle
     -------------------------- */
  const menuToggle = document.getElementById('menuToggle');
  const nav = document.querySelector('.nav');
  const mobileMenu = document.getElementById('mobileMenu');

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!expanded));
      if (mobileMenu) {
        mobileMenu.hidden = expanded; // toggle
      } else if (nav) {
        nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
      }
    });
  }

  // close mobile menu after click (single handler)
  if (mobileMenu && menuToggle) {
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mobileMenu.hidden = true;
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* --------------------------
     Highlight current nav item on scroll
     -------------------------- */
  const sections = Array.from(document.querySelectorAll('main section'));
  const navLinks = Array.from(document.querySelectorAll('.nav a'));
  const getOffset = el => el.getBoundingClientRect().top + window.scrollY;
  const changeActive = () => {
    const scrollPos = window.scrollY + 140;
    let currentIndex = 0;
    for (let i = 0; i < sections.length; i++) {
      if (getOffset(sections[i]) <= scrollPos) currentIndex = i;
    }
    navLinks.forEach(a => a.classList.remove('active'));
    if (navLinks[currentIndex]) navLinks[currentIndex].classList.add('active');
  };
  changeActive();
  window.addEventListener('scroll', changeActive, { passive: true });

  /* --------------------------
     Parallax subtle effect for hero background
     -------------------------- */
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg) {
    window.addEventListener('scroll', () => {
      const sc = window.scrollY * 0.15;
      heroBg.style.transform = `translateY(${sc}px)`;
    }, { passive: true });
  }

  /* --------------------------
     Keyboard: skip to content via "s"
     -------------------------- */
  document.addEventListener('keydown', (e) => {
    if (e.key === 's' || e.key === 'S') {
      const main = document.querySelector('main');
      if (main) main.scrollIntoView({ behavior: 'smooth' });
    }
  });

  /* -----------------------------------------------------------
     Smooth Back-to-top + Ajuste de âncoras com header fixo
     ----------------------------------------------------------- */
  const backTop = document.getElementById('backTop');
  const topAnchor = document.getElementById('top');
  if (backTop && topAnchor) {
    backTop.addEventListener('click', function (e) {
      e.preventDefault();
      topAnchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
      try { history.replaceState(null, '', '#top'); } catch (err) { /* silent */ }
      topAnchor.setAttribute('tabindex', '-1');
      topAnchor.focus({ preventScroll: true });
      setTimeout(function () { topAnchor.removeAttribute('tabindex'); }, 1000);
    });
  }

  // scroll suave com compensação da altura do header fixo para links de âncora
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function (ev) {
      const href = a.getAttribute('href');
      if (!href || href === '#' || href === '#!') return;

      const target = document.querySelector(href);
      if (target) {
        ev.preventDefault();
        const headerOffset = 72 + 12; // altura do header + folga
        const elementPosition = target.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - headerOffset;

        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        try { history.pushState(null, '', href); } catch (err) { /* silent */ }
      }
    });
  });

  /* -----------------------------------------------------------
     Ajuste dinâmico do footer (move .footer-right verticalmente)
     para alinhar o centro do botão "Voltar ao topo" com o centro
     vertical de .footer-left (RDRS + copyright).
     ----------------------------------------------------------- */

  function alignFooterRightToLeft() {
    const footerInner = document.querySelector('.footer-inner');
    if (!footerInner) return;

    const left = footerInner.querySelector('.footer-left');
    const right = footerInner.querySelector('.footer-right');
    const backBtn = right ? right.querySelector('.back-top') : null;
    if (!left || !right || !backBtn) return;

    // Se o footer está em layout de coluna (mobile), não aplicamos deslocamento
    const footerInnerStyle = getComputedStyle(footerInner);
    if (footerInnerStyle.flexDirection === 'column') {
      right.style.transform = 'none';
      return;
    }

    // Limpa transform antes de medir para evitar base contaminada
    right.style.transform = 'none';

    // Garante que layout/medidas já estabilizaram
    // (chamaremos essa função novamente no load e resize)
    const leftRect = left.getBoundingClientRect();
    const backRect = backBtn.getBoundingClientRect();

    // Centros verticais (relativos ao viewport)
    const leftCenterY = leftRect.top + leftRect.height / 2;
    const backCenterY = backRect.top + backRect.height / 2;

    // Delta: >0 se back está abaixo do left (queremos subir right)
    let delta = backCenterY - leftCenterY;

    // Cap the delta using CSS variables (absolute values)
    const rootStyle = getComputedStyle(document.documentElement);
    const capDesktop = Math.abs(parseFloat(rootStyle.getPropertyValue('--qr-raise-desktop')) || 18);
    const capTablet = Math.abs(parseFloat(rootStyle.getPropertyValue('--qr-raise-tablet')) || 12);
    const capMobile = Math.abs(parseFloat(rootStyle.getPropertyValue('--qr-raise-mobile')) || 8);

    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    let maxCap = capDesktop;
    if (vw <= 720) maxCap = capMobile;
    else if (vw <= 980) maxCap = capTablet;

    // Limit the delta so we don't move excessively (keeps layout safe)
    if (delta > maxCap) delta = maxCap;
    if (delta < -maxCap) delta = -maxCap;

    // translateY wants negative value to move the right block upwards when delta positive
    const translateY = -delta;

    // apply rounded transform
    right.style.transform = `translateY(${Math.round(translateY)}px)`;
  }

  // Run alignment after short delays (for fonts/images)
  setTimeout(alignFooterRightToLeft, 120);
  window.addEventListener('load', () => setTimeout(alignFooterRightToLeft, 150));

  // Recompute on resize / orientationchange with debounce
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(alignFooterRightToLeft, 120);
  }, { passive: true });

  window.addEventListener('orientationchange', () => setTimeout(alignFooterRightToLeft, 200));

});

/* ---------- PATCH JS: alinhar apenas os 3 itens do rodapé (legenda + QR + botão) ---------- */
/* Colar AO FINAL do js/main.js */

(function(){
  // debounce util
  function debounce(fn, wait){ let t; return function(){ clearTimeout(t); t = setTimeout(fn, wait); }; }

  function shouldDisableAdjust(footerInner){
    if(!footerInner) return true;
    const style = getComputedStyle(footerInner);
    // quando o footer empilhar (flex-direction: column) desativamos
    return style.flexDirection === 'column';
  }

  function alignFooterThreeItems(){
    const footerInner = document.querySelector('.footer-inner');
    if(!footerInner) return;
    const left = footerInner.querySelector('.footer-left');
    const right = footerInner.querySelector('.footer-right');
    if(!left || !right) return;

    // preferimos não atuar se o layout empilha (mobile)
    if(shouldDisableAdjust(footerInner)){
      right.style.transform = 'none';
      return;
    }

    const backBtn = right.querySelector('.back-top');
    if(!backBtn) return;

    // reset para medições precisas
    right.style.transform = 'none';

    const leftRect = left.getBoundingClientRect();
    const backRect = backBtn.getBoundingClientRect();

    // centro vertical de cada um
    const leftCenterY = leftRect.top + leftRect.height / 2;
    const backCenterY = backRect.top + backRect.height / 2;

    // desejamos que backCenterY se aproxime de leftCenterY
    let delta = backCenterY - leftCenterY; // >0 se back está abaixo de left
    // se delta positivo => precisamos subir (translateY negativo)

    // caps: obter dos CSS (ou fallback)
    const root = getComputedStyle(document.documentElement);
    const capDesktop = Math.abs(parseFloat(root.getPropertyValue('--qr-raise-cap-desktop')) || 28);
    const capTablet  = Math.abs(parseFloat(root.getPropertyValue('--qr-raise-cap-tablet'))  || 18);
    const capMobile  = Math.abs(parseFloat(root.getPropertyValue('--qr-raise-cap-mobile'))  || 10);

    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    let cap = capDesktop;
    if(vw <= 720) cap = capMobile;
    else if(vw <= 980) cap = capTablet;

    // limitar o delta (evita movimentos exagerados)
    if(delta > cap) delta = cap;
    if(delta < -cap) delta = -cap;

    // traduzir: subir => translateY negativo
    const translateY = -Math.round(delta);

    // aplicar transform animado
    right.style.transform = `translateY(${translateY}px)`;
  }

  // inicial e nos eventos relevantes
  document.addEventListener('DOMContentLoaded', function(){
    // aguardar um pequeno tempo para imagens e fontes carregarem
    setTimeout(alignFooterThreeItems, 160);
  });

  window.addEventListener('load', function(){ setTimeout(alignFooterThreeItems, 180); });
  window.addEventListener('resize', debounce(alignFooterThreeItems, 100));
  window.addEventListener('orientationchange', function(){ setTimeout(alignFooterThreeItems, 200); });

})();
/* ---------- fim do patch JS ---------- */
