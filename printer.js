(() => {
 'use strict';
 const clamp = value => Math.min(1, Math.max(0, value));
 // Bed at 102, 48-unit print, nozzle two units above the growing surface.
 function stateForProgress(progress) {
  const p = clamp(Number.isFinite(progress) ? progress : 0);
  const build = clamp((p - .08) / .84);
  const layer = build * 40;
  const sweep = 1 - Math.abs((layer % 2) - 1);
  const halfWidth = 19 + 7 * build;
  let x = 90 + (sweep * 2 - 1) * halfWidth;
  if (p < .08) x = 43 + 28 * p / .08;
  if (p >= .92) x = 64 - 21 * (p - .92) / .08;
  return {build, layer, x, y:100 - build * 48, extruding:p > .08 && p < .92};
 }
 if (typeof module === 'object' && module.exports) {module.exports = {stateForProgress}; return;}
 const corner = document.querySelector('.printer-corner');
 const bar = document.querySelector('.mobile-order');
 const mobilePrinter = document.querySelector('.printer-mobile');
 const fallback = document.querySelector('.mobile-order-prompt');
 const input = document.getElementById('model-link');
 if (!corner || !bar || !mobilePrinter) return;
 const mobile = matchMedia('(max-width: 700px)');
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 const scenes = [corner, mobilePrinter].map(root => ({
  root, reveal:root.querySelector('[data-printer-reveal]'),
  gantry:root.querySelector('[data-printer-gantry]'),
  head:root.querySelector('[data-printer-head]'), extrusion:root.querySelector('[data-printer-extrusion]')
 }));
 let frame = 0, dismissed = false, target = 0, current = 0, changedAt = 0, lastTime = null;
 let geometryDirty = true, presentationDirty = true, maxScroll = 0;
 let isMobile = false, isReduced = false, editing = false, lastPresentation = '';
 let initialized = false, lastScene = -1, lastProgress = -1;
 function write(scene, key, node, attribute, value) {
  if (scene[key] === value) return;
  node.setAttribute(attribute, value); scene[key] = value;
 }
 function draw(sceneIndex, progress) {
  if (sceneIndex === lastScene && progress === lastProgress) return;
  const s = stateForProgress(progress), scene = scenes[sceneIndex];
  write(scene, 'revealValue', scene.reveal, 'transform', `translate(0 102) scale(1 ${s.build.toFixed(5)}) translate(0 -102)`);
  write(scene, 'gantryValue', scene.gantry, 'transform', `translate(0 ${s.y.toFixed(3)})`);
  write(scene, 'headValue', scene.head, 'transform', `translate(${s.x.toFixed(3)} ${s.y.toFixed(3)})`);
  write(scene, 'extrusionValue', scene.extrusion, 'opacity', s.extruding ? '1' : '0');
  lastScene = sceneIndex; lastProgress = progress;
 }
 // Read geometry before writing styles. No background sampling or idle loop.
 function tick(time) {
  frame = 0;
  if (document.hidden) return;
  if (geometryDirty) {
   maxScroll = Math.max(0, document.documentElement.scrollHeight - innerHeight);
   geometryDirty = false;
  }
  if (presentationDirty) {
   isMobile = mobile.matches; isReduced = reduced.matches;
   editing = document.activeElement === input;
   const presentation = `${isMobile}:${editing}:${dismissed}`;
   if (presentation !== lastPresentation) {
    bar.hidden = isMobile && editing;
    mobilePrinter.hidden = dismissed;
    fallback.hidden = !dismissed;
    bar.classList.toggle('has-printer', !dismissed);
    corner.classList.toggle('is-visible', !isMobile && !dismissed);
    corner.inert = isMobile || dismissed;
    lastPresentation = presentation;
   }
   presentationDirty = false;
  }
  const next = maxScroll ? clamp(scrollY / maxScroll) : 0;
  if (!initialized) {current = target = next; initialized = true;}
  if (next !== target) {target = next; changedAt = time;}
  const animate = !isReduced && !dismissed && !(isMobile && editing);
  // Advance on every scrolling frame; changing the target never restarts movement.
  const dt = lastTime === null ? 1000 / 60 : Math.min(64, Math.max(0, time - lastTime));
  if (!animate || time - changedAt >= 120 || Math.abs(target - current) < .00001) current = target;
  else current += (target - current) * (1 - Math.exp(-dt / 32));
  if (!dismissed && !(isMobile && editing)) draw(isMobile ? 1 : 0, isReduced ? 1 : current);
  if (current !== target && animate) {lastTime = time; schedule();}
  else lastTime = null;
 }
 function schedule() {if (!frame && !document.hidden) frame = requestAnimationFrame(tick);}
 function invalidateGeometry() {geometryDirty = true; schedule();}
 function invalidatePresentation() {presentationDirty = true; schedule();}
 function responsiveChange() {presentationDirty = true; invalidateGeometry();}
 function scrollChanged() {if (!dismissed && !isReduced && !(isMobile && editing)) schedule();}
 corner.querySelector('.printer-dismiss').addEventListener('click', () => {
  dismissed = true;
  const section = [...document.querySelectorAll('main section')].find(node => node.getBoundingClientRect().bottom > 0);
  const heading = section?.querySelector('h2, h1');
  if (heading) {
   heading.setAttribute('tabindex','-1'); heading.focus({preventScroll:true});
   heading.addEventListener('blur', () => heading.removeAttribute('tabindex'), {once:true});
  }
  invalidatePresentation();
 });
 addEventListener('scroll', scrollChanged, {passive:true});
 addEventListener('resize', responsiveChange, {passive:true});
 addEventListener('pageshow', responsiveChange);
 document.addEventListener('focusin', invalidatePresentation);
 document.addEventListener('focusout', invalidatePresentation);
 document.addEventListener('toggle', invalidateGeometry, true);
 document.addEventListener('visibilitychange', () => {
  if (document.hidden) {cancelAnimationFrame(frame); frame = 0; lastTime = null;} else responsiveChange();
 });
 mobile.addEventListener('change', responsiveChange);
 reduced.addEventListener('change', invalidatePresentation);
 window.visualViewport?.addEventListener('resize', invalidateGeometry, {passive:true});
 if ('ResizeObserver' in window) new ResizeObserver(invalidateGeometry).observe(document.body);
 corner.hidden = false;
 schedule();
})();
