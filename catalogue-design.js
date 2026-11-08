// Shared primary menu uses direct links without dropdown controls.
(()=>{
function setup(){
 const nav=document.querySelector('.lr-primary-links');if(!nav)return;
 nav.querySelectorAll(':scope > a').forEach(a=>{
  const file=new URL(a.href,location.href).pathname.split('/').pop();
  if(file==='countries.html')a.textContent='Countries';
  if(a.textContent.trim()==='Live Video')a.textContent='Live Videos';
 });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
})();

/* One country palette, including cards inserted by filters and pagination. */
(()=>{
const palette={"uk": "#173E75", "fr": "#A32346", "de": "#623C91", "nl": "#70305F", "be": "#075E6B", "es": "#373A82", "it": "#772B42", "ch": "#3D536B", "at": "#A32346", "tr": "#173E75", "pt": "#373A82", "gr": "#623C91", "cz": "#3D536B", "no": "#772B42", "se": "#70305F", "pl": "#075E6B", "dk": "#623C91", "hu": "#3D536B", "ie": "#A32346", "fi": "#373A82", "am": "#173E75", "az": "#A32346", "by": "#623C91", "ba": "#70305F", "bg": "#075E6B", "hr": "#373A82", "ee": "#772B42", "ge": "#3D536B", "xk": "#173E75", "lv": "#A32346", "lt": "#623C91", "lu": "#70305F", "md": "#075E6B", "me": "#373A82", "mk": "#772B42", "ro": "#3D536B", "ru": "#173E75", "rs": "#A32346", "sk": "#623C91", "si": "#70305F", "ua": "#075E6B", "in": "#173E75"};
const selector='.lr-country-card,.ep-station';
function apply(card){
 const parent=card.closest('[data-country]');
 let country=parent?.dataset.country?.toLowerCase();
 if(!country&&card.getAttribute('href')){const u=new URL(card.getAttribute('href'),location.href);country=u.searchParams.get('country');if(u.pathname.endsWith('/india.html'))country='in'}
 const colour=palette[country]||card.style.getPropertyValue('--country-band')||'#173E75';
 if(card.style.getPropertyValue('--lr-uniform-band')!==colour)card.style.setProperty('--lr-uniform-band',colour);
 const band=card.querySelector('.lr-operator-name');const photo=card.querySelector('.lr-country-photo');
 if(band&&photo&&band.nextElementSibling===photo)photo.after(band);
 card.querySelectorAll('.lr-country-name,.lr-route-card-title,.lr-operator-name,.lr-station-name').forEach(e=>{if(!e.title)e.title=e.textContent.trim()});
}
function scan(root){if(root.matches?.(selector))apply(root);root.querySelectorAll?.(selector).forEach(apply)}
scan(document);
new MutationObserver(records=>records.forEach(r=>r.addedNodes.forEach(n=>{if(n.nodeType===1)scan(n)}))).observe(document.body,{childList:true,subtree:true});
})();
