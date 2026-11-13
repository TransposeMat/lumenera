(() => {
 'use strict';
 const workflow = document.querySelector('.modeling-workflow');
 if (!workflow || !('IntersectionObserver' in window)) return;
 const artwork = workflow.querySelector('.modeling-stages');
 const toggle = workflow.querySelector('.modeling-toggle');
 const label = toggle.querySelector('span');
 const motion = matchMedia('(prefers-reduced-motion: reduce)');
 let visible = false, paused = false;

 function updatePlayback() {
  artwork.classList.toggle('is-playing', visible && !document.hidden && !motion.matches && !paused);
 }
 new IntersectionObserver(([entry]) => {
  visible = entry.isIntersecting && entry.intersectionRatio >= .1;
  updatePlayback();
 }, {threshold:.1}).observe(artwork);
 toggle.addEventListener('click', () => {
  paused = !paused;
  label.textContent = paused ? 'Play' : 'Pause';
  toggle.setAttribute('aria-label', paused ? 'Play workflow animations' : 'Pause workflow animations');
  toggle.classList.toggle('is-paused', paused);
  updatePlayback();
 });
 document.addEventListener('visibilitychange', updatePlayback);
 function updateMotion() {
  toggle.hidden = motion.matches;
  updatePlayback();
 }
 motion.addEventListener('change', updateMotion);
 updateMotion();
})();
