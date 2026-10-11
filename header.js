(() => {
 'use strict';
 const header = document.querySelector('.site-header');
 const anchor = document.querySelector('.header-anchor');
 if (!header || !anchor) return;
 let frame = 0, dirty = true, height = 0, floating = false;
 function update() {
  frame = 0;
  if (document.hidden) return;
  if (dirty) {height = anchor.offsetHeight; dirty = false;}
  // Small hysteresis prevents flickering when scrolling around the threshold.
  const next = floating ? scrollY > height : scrollY > height + 8;
  if (next !== floating) {
   floating = next;
   header.classList.toggle('is-floating', floating);
  }
 }
 function schedule() {if (!frame && !document.hidden) frame = requestAnimationFrame(update);}
 function resize() {dirty = true; schedule();}
 addEventListener('scroll', schedule, {passive:true});
 addEventListener('resize', resize, {passive:true});
 addEventListener('pageshow', resize);
 document.addEventListener('visibilitychange', () => {
  if (document.hidden) {cancelAnimationFrame(frame); frame = 0;} else resize();
 });
 if ('ResizeObserver' in window) new ResizeObserver(resize).observe(anchor);
 schedule();
})();
