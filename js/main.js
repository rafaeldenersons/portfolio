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

  const backTop = document.getElementById('backTop');
  if (backTop) {
    backTop.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

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

});
