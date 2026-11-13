(() => {
 'use strict';
 const workflow = document.querySelector('.modeling-workflow');
 if (!workflow || !('IntersectionObserver' in window)) return;
 const artwork = workflow.querySelector('.modeling-stages');
 const replay = workflow.querySelector('.modeling-replay');
 const motion = matchMedia('(prefers-reduced-motion: reduce)');
 let seen = false, visible = false, ready = false, requested = false;

 const stop = () => artwork.classList.remove('is-playing');
 function play() {
  if (!visible || document.hidden || motion.matches) return;
  if (artwork.classList.contains('is-playing')) {
   stop();
   // Commit the static state once so an intentional replay restarts the CSS timeline.
   void artwork.offsetWidth;
  }
  artwork.classList.add('is-playing');
  seen = true;
  requested = false;
 }
 const startOnce = () => { if (ready && !seen) play(); };
 new IntersectionObserver(([entry]) => {
  visible = entry.isIntersecting && entry.intersectionRatio > 0;
  ready = visible && entry.intersectionRatio >= .45;
  if (!visible) stop();
  else if (requested) play();
  else startOnce();
 }, {threshold:[0, .45]}).observe(artwork);
 replay.addEventListener('click', () => {
  if (motion.matches || document.hidden) return;
  if (visible) play();
  else {
   requested = true;
   artwork.scrollIntoView({block:'nearest'});
  }
 });
 artwork.addEventListener('animationend', event => {
  if (event.animationName === 'modeling-print') stop();
 });
 document.addEventListener('visibilitychange', () => {
  if (document.hidden) { requested = false; stop(); }
  else startOnce();
 });
 function updateMotion() {
  replay.hidden = motion.matches;
  if (motion.matches) { requested = false; stop(); }
  else startOnce();
 }
 motion.addEventListener('change', updateMotion);
 updateMotion();
})();
