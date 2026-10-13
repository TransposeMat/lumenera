(() => {
 'use strict';
 // CSS pins the header; the native disclosure remains usable without scripts.
 const menu = document.querySelector('.mobile-menu');
 if (!menu) return;
 const toggle = menu.querySelector('summary');
 const panel = menu.querySelector('nav');
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 const mobile = matchMedia('(max-width:700px)');
 let expanded = menu.open, animation = null;
 function settle() {
  if (animation) {const previous = animation; animation = null; previous.cancel();}
  menu.open = expanded;
  panel.inert = !expanded;
  menu.classList.remove('is-closing');
  toggle.setAttribute('aria-expanded', String(expanded));
 }
 function setExpanded(next, {immediate = false, returnFocus = false} = {}) {
  if (next && !mobile.matches) return;
  if (next === expanded && !immediate) return;
  const wasOpen = menu.open;
  // Preserve the current visual position when a quick second tap reverses motion.
  const style = wasOpen ? getComputedStyle(panel) : null;
  const from = style ? {opacity: style.opacity, transform: style.transform} : {opacity:0, transform:'translateY(-6px)'};
  expanded = next;
  if (animation) {const previous = animation; animation = null; previous.cancel();}
  toggle.setAttribute('aria-expanded', String(expanded));
  panel.inert = !expanded;
  menu.classList.toggle('is-closing', !expanded);
  if (returnFocus) toggle.focus({preventScroll:true});
  if (immediate || reduced.matches || typeof panel.animate !== 'function') {settle(); return;}
  menu.open = true;
  const to = expanded ? {opacity:1, transform:'translateY(0)'} : {opacity:0, transform:'translateY(-4px)'};
  const current = panel.animate([from, to], {duration:expanded ? 180 : 120, easing:'cubic-bezier(.16,1,.3,1)', fill:'both'});
  animation = current;
  current.finished.then(() => {if (animation === current) settle();}).catch(() => {});
 }
 toggle.addEventListener('click', event => {
  event.preventDefault();
  setExpanded(!expanded);
 });
 menu.addEventListener('click', event => {
  if (event.target.closest('a')) setExpanded(false, {immediate:true});
 });
 menu.addEventListener('toggle', () => {
  // Keep native/assistive-technology disclosure actions in sync with enhancement.
  if (!animation && menu.open !== expanded) {expanded = menu.open; settle();}
 });
 document.addEventListener('pointerdown', event => {
  if (expanded && !menu.contains(event.target)) setExpanded(false);
 });
 document.addEventListener('click', event => {
  if (expanded && !menu.contains(event.target)) setExpanded(false);
 });
 document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && expanded) {
   setExpanded(false, {returnFocus:true});
  }
 });
 document.addEventListener('focusin', event => {
  if (expanded && !menu.contains(event.target)) setExpanded(false);
 });
 reduced.addEventListener('change', () => {if (reduced.matches) settle();});
 mobile.addEventListener('change', () => {if (!mobile.matches) setExpanded(false, {immediate:true});});
 document.addEventListener('visibilitychange', () => {if (document.hidden) setExpanded(false, {immediate:true});});
 settle();
})();
