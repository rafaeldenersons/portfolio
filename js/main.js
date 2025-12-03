// main.js — interações leves and accessibility improvements
document.addEventListener('DOMContentLoaded', function(){
  const menuToggle = document.getElementById('menuToggle');
  const nav = document.querySelector('.nav');
  const mobileMenu = document.getElementById('mobileMenu');
  if(menuToggle){
    menuToggle.addEventListener('click', ()=>{
      const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!expanded));
      if(mobileMenu){
        if(expanded){
          mobileMenu.hidden = true;
        } else {
          mobileMenu.hidden = false;
        }
      } else {
        nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
      }
    });
  }

  // highlight nav item on scroll
  const sections = Array.from(document.querySelectorAll('main section'));
  const navLinks = Array.from(document.querySelectorAll('.nav a'));
  const getOffset = el => el.getBoundingClientRect().top + window.scrollY;
  const changeActive = ()=>{
    const scrollPos = window.scrollY + 140;
    let currentIndex = 0;
    for(let i=0;i<sections.length;i++){
      if(getOffset(sections[i]) <= scrollPos) currentIndex = i;
    }
    navLinks.forEach(a=>a.classList.remove('active'));
    if(navLinks[currentIndex]) navLinks[currentIndex].classList.add('active');
  };
  changeActive();
  window.addEventListener('scroll', changeActive, {passive:true});

  // parallax subtle effect for hero background
  const heroBg = document.querySelector('.hero-bg');
  if(heroBg){
    window.addEventListener('scroll', ()=>{
      const sc = window.scrollY * 0.15;
      heroBg.style.transform = `translateY(${sc}px)`;
    }, {passive:true});
  }

  // keyboard: skip to content via "s"
  document.addEventListener('keydown',(e)=>{
    if(e.key === 's' || e.key === 'S'){ document.querySelector('main').scrollIntoView({behavior:'smooth'}); }
  });

  // close mobile menu after click
  if(mobileMenu){
    mobileMenu.querySelectorAll('a').forEach(a=>{
      a.addEventListener('click', ()=>{ mobileMenu.hidden = true; menuToggle.setAttribute('aria-expanded','false'); });
    });
  }
    if(mobileMenu){
    mobileMenu.querySelectorAll('a').forEach(a=>{
      a.addEventListener('click', ()=>{ 
        mobileMenu.hidden = true; 
        menuToggle.setAttribute('aria-expanded','false'); 
      });
    });
  }

  /* -----------------------------------------------------------
     Smooth Back-to-top + Ajuste de âncoras com header fixo
     ----------------------------------------------------------- */

  // Back-to-top smooth (versão com ajuste de hash opcional)
// main.js — interações leves and accessibility improvements
document.addEventListener('DOMContentLoaded', function(){
  const menuToggle = document.getElementById('menuToggle');
  const nav = document.querySelector('.nav');
  const mobileMenu = document.getElementById('mobileMenu');

  if(menuToggle){
    menuToggle.addEventListener('click', ()=>{
      const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!expanded));
      if(mobileMenu){
        mobileMenu.hidden = expanded; // toggle
      } else if (nav) {
        nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
      }
    });
  }

  // highlight nav item on scroll
  const sections = Array.from(document.querySelectorAll('main section'));
  const navLinks = Array.from(document.querySelectorAll('.nav a'));
  const getOffset = el => el.getBoundingClientRect().top + window.scrollY;
  const changeActive = ()=>{
    const scrollPos = window.scrollY + 140;
    let currentIndex = 0;
    for(let i=0;i<sections.length;i++){
      if(getOffset(sections[i]) <= scrollPos) currentIndex = i;
    }
    navLinks.forEach(a=>a.classList.remove('active'));
    if(navLinks[currentIndex]) navLinks[currentIndex].classList.add('active');
  };
  changeActive();
  window.addEventListener('scroll', changeActive, {passive:true});

  // parallax subtle effect for hero background
  const heroBg = document.querySelector('.hero-bg');
  if(heroBg){
    window.addEventListener('scroll', ()=>{
      const sc = window.scrollY * 0.15;
      heroBg.style.transform = `translateY(${sc}px)`;
    }, {passive:true});
  }

  // keyboard: skip to content via "s"
  document.addEventListener('keydown',(e)=>{
    if(e.key === 's' || e.key === 'S'){
      const main = document.querySelector('main');
      if(main) main.scrollIntoView({behavior:'smooth'});
    }
  });

  // close mobile menu after click (single handler; removed duplicate)
  if(mobileMenu && menuToggle){
    mobileMenu.querySelectorAll('a').forEach(a=>{
      a.addEventListener('click', ()=>{
        mobileMenu.hidden = true;
        menuToggle.setAttribute('aria-expanded','false');
      });
    });
  }

  /* -----------------------------------------------------------
     Smooth Back-to-top + Ajuste de âncoras com header fixo
     ----------------------------------------------------------- */

  // Improved Back-to-top: smooth + focus accessibility + history update
  const backTop = document.getElementById('backTop');
  const topAnchor = document.getElementById('top');
  if (backTop && topAnchor) {
    backTop.addEventListener('click', function (e) {
      e.preventDefault();
      // use scrollIntoView for consistent focusing
      topAnchor.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // update history to reflect the anchor (optional)
      try {
        history.replaceState(null, '', '#top');
      } catch (err) { /* silent */ }

      // move focus for keyboard users and screen readers
      topAnchor.setAttribute('tabindex', '-1');           // make focusable if not
      topAnchor.focus({ preventScroll: true });           // focus without jump
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
        try {
          history.pushState(null, '', href);
        } catch (err) { /* silent */ }
      }
    });
  });

});


  // scroll suave com compensação da altura do header fixo
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
        history.pushState(null, '', href);
      }
    });
  });

});
