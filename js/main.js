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
});



/* --- Added IntersectionObserver for nav active highlighting --- */
(function(){
  try {
    const sections = Array.from(document.querySelectorAll('main section[id]'));
    const navLinks = new Map(Array.from(document.querySelectorAll('.nav a[href^="#"]')).map(a => [a.getAttribute('href').slice(1), a]));
    if(sections.length && navLinks.size){
      const observer = new IntersectionObserver((entries)=>{
        entries.forEach(entry=>{
          const id = entry.target.id;
          const link = navLinks.get(id);
          if(!link) return;
          if(entry.isIntersecting){
            document.querySelectorAll('.nav a').forEach(a => a.classList.remove('active'));
            link.classList.add('active');
          }
        });
      }, { root: null, rootMargin: '-20% 0px -60% 0px', threshold: 0 });
      sections.forEach(s => observer.observe(s));
    }
  } catch(e){ console.warn('Observer init failed', e); }
})();

/* --- Simple mobile menu open/close with aria handling --- */
(function(){
  try {
    const menuToggle = document.querySelector('[data-menu-toggle]');
    const mobileMenu = document.querySelector('[data-mobile-menu]');
    if(menuToggle && mobileMenu){
      function openMobile(){
        mobileMenu.hidden = false;
        menuToggle.setAttribute('aria-expanded','true');
        const first = mobileMenu.querySelector('a, button');
        if(first) first.focus();
      }
      function closeMobile(){
        mobileMenu.hidden = true;
        menuToggle.setAttribute('aria-expanded','false');
        menuToggle.focus();
      }
      menuToggle.addEventListener('click', (e)=>{
        e.preventDefault();
        if(menuToggle.getAttribute('aria-expanded') === 'true') closeMobile();
        else openMobile();
      });
      // close on escape
      document.addEventListener('keydown', (e)=>{
        if(e.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') closeMobile();
      });
    }
  } catch(e){ console.warn('Mobile menu init failed', e); }
})();
