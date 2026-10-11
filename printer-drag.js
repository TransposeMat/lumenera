(() => {
 'use strict';
 const corner = document.querySelector('.printer-corner');
 const grab = corner?.querySelector('.printer-grab');
 if (!grab) return;
 let frame = 0, drag = null, moved = false, dirty = true;
 let x = 0, y = 0, appliedX = 0, appliedY = 0, bounds;
 const constrain = (value, min, max) => Math.max(min, Math.min(max, value));
 function measure() {
  const rect = corner.getBoundingClientRect(), style = getComputedStyle(corner);
  const viewport = window.visualViewport;
  const left = viewport?.offsetLeft || 0, top = viewport?.offsetTop || 0;
  const width = viewport?.width || document.documentElement?.clientWidth || innerWidth, height = viewport?.height || document.documentElement?.clientHeight || innerHeight;
  const inset = side => Math.max(8, parseFloat(style.getPropertyValue(`--drag-safe-${side}`)) || 0);
  const baseLeft = rect.left - appliedX, baseTop = rect.top - appliedY;
  const minX = left + inset('left') - baseLeft, minY = top + inset('top') - baseTop;
  bounds = {minX, minY,
   maxX:Math.max(minX, left + width - inset('right') - rect.width - baseLeft),
   maxY:Math.max(minY, top + height - inset('bottom') - rect.height - baseTop)};
  dirty = false;
 }
 function paint() {
  frame = 0;
  if (document.hidden) return;
  if (dirty) measure();
  x = constrain(x, bounds.minX, bounds.maxX);
  y = constrain(y, bounds.minY, bounds.maxY);
  if (x === appliedX && y === appliedY) return;
  corner.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  appliedX = x; appliedY = y;
 }
 function schedule() {if (!frame && !document.hidden) frame = requestAnimationFrame(paint);}
 function finish(event) {
  if (!drag || (event && event.pointerId !== drag.id)) return;
  const pointer = drag.id; drag = null;
  corner.classList.remove('is-dragging');
  if (grab.hasPointerCapture(pointer)) grab.releasePointerCapture(pointer);
 }
 grab.addEventListener('pointerdown', event => {
  if (event.isPrimary === false || event.button !== 0 || drag || corner.inert) return;
  measure();
  drag = {id:event.pointerId, startX:event.clientX, startY:event.clientY, x, y};
  grab.setPointerCapture(event.pointerId);
  corner.classList.add('is-dragging');
  event.preventDefault();
 });
 grab.addEventListener('pointermove', event => {
  if (!drag || event.pointerId !== drag.id) return;
  x = constrain(drag.x + event.clientX - drag.startX, bounds.minX, bounds.maxX);
  y = constrain(drag.y + event.clientY - drag.startY, bounds.minY, bounds.maxY);
  moved = moved || x !== 0 || y !== 0;
  schedule();
 });
 for (const event of ['pointerup','pointercancel','lostpointercapture']) grab.addEventListener(event, finish);
 grab.addEventListener('keydown', event => {
  if (event.altKey || event.ctrlKey || event.metaKey) return;
  const step = event.shiftKey ? 40 : 16;
  const directions = {ArrowLeft:[-step,0], ArrowRight:[step,0], ArrowUp:[0,-step], ArrowDown:[0,step]};
  if (event.key === 'Escape') {finish(); return;}
  if (event.key !== 'Home' && !directions[event.key]) return;
  event.preventDefault(); finish(); measure();
  if (event.key === 'Home') {x = 0; y = 0; moved = false;}
  else {x += directions[event.key][0]; y += directions[event.key][1]; moved = true;}
  schedule();
 });
 function resize() {
  finish(); dirty = true;
  if (moved) schedule();
 }
 addEventListener('resize', resize, {passive:true});
 addEventListener('pageshow', resize);
 window.visualViewport?.addEventListener('resize', resize, {passive:true});
 window.visualViewport?.addEventListener('scroll', resize, {passive:true});
 corner.querySelector('.printer-dismiss').addEventListener('click', () => {finish();});
 document.addEventListener('visibilitychange', () => {
  if (document.hidden) {finish(); cancelAnimationFrame(frame); frame = 0;}
  else resize();
 });
})();
