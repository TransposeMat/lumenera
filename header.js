(() => {
 'use strict';
 // CSS pins the header, including when scripts fail. Only the menu needs enhancement.
 const menu = document.querySelector('.mobile-menu');
 if (!menu) return;
 const toggle = menu.querySelector('summary');
 menu.addEventListener('click', event => {
  if (event.target.closest('a')) menu.open = false;
 });
 document.addEventListener('click', event => {
  if (menu.open && !menu.contains(event.target)) menu.open = false;
 });
 document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.open) {
   menu.open = false;
   toggle.focus({preventScroll:true});
  }
 });
 // Close the popover when keyboard focus returns to the page.
 document.addEventListener('focusin', event => {
  if (menu.open && !menu.contains(event.target)) menu.open = false;
 });
})();
