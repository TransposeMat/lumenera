(() => {
 'use strict';
 const business = JSON.parse(document.getElementById('business-config').textContent);
 const filters = document.querySelector('.filters');
 const cards = [...document.querySelectorAll('.model-card')];
 const count = document.getElementById('result-count');
 const empty = document.querySelector('.empty-state');
 const labels = { all: 'objects', gifts: 'gifts & wearables', desk: 'desk & tech objects', home: 'home & everyday objects', decor: 'decor & plant objects' };
 function filterCollection(category) {
  let visible = 0;
  cards.forEach(card => {
   const show = category === 'all' || card.dataset.category === category;
   card.hidden = !show;
   if (show) visible++;
  });
  filters.querySelectorAll('button').forEach(button => {
   const active = button.dataset.filter === category;
   button.classList.toggle('is-active', active);
   button.setAttribute('aria-pressed', String(active));
  });
  count.textContent = `${visible} ${labels[category] || 'objects'} to make your own`;
  empty.hidden = visible !== 0;
 }
 filters.hidden = false;
 filters.addEventListener('click', event => {
  const button = event.target.closest('button[data-filter]');
  if (button) filterCollection(button.dataset.filter);
 });
 document.querySelector('.reset-filters').addEventListener('click', () => {
  filterCollection('all');
  filters.querySelector('[data-filter="all"]').focus();
 });
 // Broken images preserve the card's footprint and offer the original model.
 function imageFailed(image) {
  image.hidden = true;
  image.closest('.feature-media, .card-media').querySelector('.image-fallback').hidden = false;
 }
 document.querySelectorAll('.feature-media img, .card-media img').forEach(image => {
  image.addEventListener('error', () => imageFailed(image));
  if (image.complete && image.naturalWidth === 0) imageFailed(image);
 });
 const form = document.getElementById('model-form');
 const input = document.getElementById('model-link');
 const error = document.getElementById('link-error');
 form.hidden = false;
 document.getElementById('own-fallback').hidden = true;
 input.addEventListener('input', () => { error.hidden = true; input.removeAttribute('aria-invalid'); });
 form.addEventListener('submit', event => {
  event.preventDefault();
  const value = input.value.trim();
  let model = '';
  if (value) {
   try {
    const url = new URL(value);
    if (!['https:', 'http:'].includes(url.protocol) || !url.hostname.includes('.') || url.username || url.password) throw new Error('Invalid link');
    model = value;
   } catch {
    error.textContent = 'Paste a full model link starting with https://, or leave this blank and share your idea in chat.';
    error.hidden = false; input.setAttribute('aria-invalid', 'true'); input.focus(); return;
   }
  }
  const message = model
   ? `Hi ${business.name}! I'd like to print this model:\n${model}\nPlease confirm the print price, available colours and delivery.\nMy city: `
   : `Hi ${business.name}! I'd like to print my own model. I'll send the link or file here. Please confirm the print price, colours and delivery.`;
  // Navigate directly in this tab: works without relying on pop-up permission.
  window.location.assign(`https://wa.me/${business.whatsapp}?text=${encodeURIComponent(message)}`);
 });
 const copy = document.getElementById('copy-number');
 const status = document.getElementById('copy-status');
 copy.hidden = false;
 copy.addEventListener('click', async () => {
  try {
   await navigator.clipboard.writeText(business.phone);
   status.textContent = 'Number copied. Paste it into WhatsApp.';
  } catch {
   status.textContent = `Copy ${business.phone} from the number above.`;
  }
 });
})();
