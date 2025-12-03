// main.js — interações leves, acessibilidade e ajuste dinâmico do footer (QR + botão)
// Substitua todo o conteúdo de js/main.js por este arquivo.

// utils
function debounce(fn, wait = 100){ let t; return (...args)=>{ clearTimeout(t); t = setTimeout(()=>fn(...args), wait); }; }

/* ----------------------- MENU / MOBILE ----------------------- */
(function(){
  const menuToggle = document.getElementById('menuToggle');
  const nav = document.querySelector('.nav');
  const mobileMenu = document.getElementById('mobileMenu');

  if(menuToggle){
    menuToggle.addEventListener('click', ()=>{
      const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!expanded));
      if(mobileMenu){
        mobileMenu.hidden = expanded;
      } else if(nav){
        nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
      }
    });
  }

  if(mobileMenu && menuToggle){
    mobileMenu.querySelectorAll('a').forEach(a=>{
      a.addEventListener('click', ()=>{ mobileMenu.hidden = true; menuToggle.setAttribute('aria-expanded','false'); });
    });
  }
})();

/* ----------------------- NAV HIGHLIGHT / PARALLAX / KEYBOARD ----------------------- */
(function(){
  // highlight nav on scroll
  const sections = Array.from(document.querySelectorAll('main section'));
  const navLinks = Array.from(document.querySelectorAll('.nav a'));
  const getOffset = el => el.getBoundingClientRect().top + window.scrollY;
  function changeActive(){
    const scrollPos = window.scrollY + 140;
    let currentIndex = 0;
    for(let i=0;i<sections.length;i++){
      if(getOffset(sections[i]) <= scrollPos) currentIndex = i;
    }
    navLinks.forEach(a=>a.classList.remove('active'));
    if(navLinks[currentIndex]) navLinks[currentIndex].classList.add('active');
  }
  changeActive();
  window.addEventListener('scroll', changeActive, { passive: true });

  // hero parallax
  const heroBg = document.querySelector('.hero-bg');
  if(heroBg){
    window.addEventListener('scroll', ()=>{ const sc = window.scrollY * 0.15; heroBg.style.transform = `translateY(${sc}px)`; }, { passive: true });
  }

  // keyboard 's' jump to main
  document.addEventListener('keydown', (e)=>{ if(e.key === 's' || e.key === 'S'){ const main = document.querySelector('main'); if(main) main.scrollIntoView({behavior:'smooth'}); } });
})();

/* ----------------------- SMOOTH ANCHORS + BACK TO TOP ----------------------- */
(function(){
  const backTop = document.getElementById('backTop');
  const topAnchor = document.getElementById('top');
  if(backTop && topAnchor){
    backTop.addEventListener('click', (e)=>{
      e.preventDefault();
      topAnchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
      try{ history.replaceState(null, '', '#top'); }catch(err){}
      topAnchor.setAttribute('tabindex', '-1');
      topAnchor.focus({ preventScroll: true });
      setTimeout(()=> topAnchor.removeAttribute('tabindex'), 1000);
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', function(ev){
      const href = a.getAttribute('href');
      if(!href || href === '#' || href === '#!') return;
      const target = document.querySelector(href);
      if(target){
        ev.preventDefault();
        const headerOffset = 72 + 12;
        const elementPosition = target.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        try{ history.pushState(null, '', href); }catch(err){}
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

  function parseCap(varName, fallback){
    const val = getComputedStyle(docEl).getPropertyValue(varName);
    if(!val) return fallback;
    const n = parseFloat(val);
    return isNaN(n) ? fallback : Math.abs(n);
  }

  function footerShouldSkip(footerInner){
    if(!footerInner) return true;
    const st = getComputedStyle(footerInner);
    return st.flexDirection === 'column' || st.display === 'block';
  }

  function alignFooterRight(){
    const footerInner = document.querySelector('.footer-inner');
    if(!footerInner) return;

    const left = footerInner.querySelector('.footer-left');
    const right = footerInner.querySelector('.footer-right');
    if(!left || !right) return;

    // in column layout (mobile) skip adjustments
    if(footerShouldSkip(footerInner)){
      right.style.transform = 'none';
      return;
    }

    // clear before measuring
    right.style.transform = 'none';

    const backBtn = right.querySelector('.back-top');
    if(!backBtn) return;

    // measure
    const leftRect = left.getBoundingClientRect();
    const backRect = backBtn.getBoundingClientRect();

    const leftCenterY = leftRect.top + leftRect.height / 2;
    const backCenterY = backRect.top + backRect.height / 2;

    let delta = backCenterY - leftCenterY; // positive => back is lower than left

    // caps from CSS variables
    const capDesktop = parseCap('--qr-raise-cap-desktop', 40);
    const capTablet  = parseCap('--qr-raise-cap-tablet', 24);
    const capMobile  = parseCap('--qr-raise-cap-mobile', 12);

    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    let cap = capDesktop;
    if(vw <= 720) cap = capMobile;
    else if(vw <= 980) cap = capTablet;

    // clamp delta
    if(delta > cap) delta = cap;
    if(delta < -cap) delta = -cap;

    // translateY negative to move upwards when back is below left
    const translateY = -Math.round(delta);

    // apply via rAF for smoothness
    window.requestAnimationFrame(()=> {
      right.style.transform = `translateY(${translateY}px)`;
    });
  }

  // Wait for fonts AND images to be ready to get stable measurements
  function whenStable(cb){
    const tasks = [];

    // fonts ready (if supported)
    if(document.fonts && document.fonts.ready){
      tasks.push(document.fonts.ready);
    }

    // wait for QR image (if present)
    const qr = document.querySelector('.qr-image');
    if(qr && !qr.complete){
      tasks.push(new Promise(resolve => { qr.addEventListener('load', resolve); qr.addEventListener('error', resolve); }));
    }

    // also wait a short time to let layout settle
    tasks.push(new Promise(resolve => setTimeout(resolve, 120)));

    return Promise.all(tasks).then(cb).catch(cb);
  }

  // initial alignment after stable
  whenStable(alignFooterRight);

  // re-align on load (safety), resize and orientationchange (debounced)
  window.addEventListener('load', () => setTimeout(alignFooterRight, 140));
  window.addEventListener('orientationchange', () => setTimeout(alignFooterRight, 180));
  window.addEventListener('resize', debounce(alignFooterRight, 110), { passive: true });

  // In case content changes dynamically, re-run on mutation (lightweight)
  const footer = document.querySelector('.site-footer');
  if(footer){
    const mo = new MutationObserver(debounce(alignFooterRight, 160));
    mo.observe(footer, { childList: true, subtree: true, attributes: false });
  }

})();
