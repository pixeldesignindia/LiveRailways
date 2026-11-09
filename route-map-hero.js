(()=>{
 const box=document.querySelector('.lr-search-box'),filters=document.querySelector('.rm-search'),link=document.getElementById('lr-route-map-link');if(!box||!filters||!link)return;
 document.body.classList.add('lr-route-map-hero');filters.querySelector('.lr-panel-page-links')?.remove();
 filters.id='rm-hero-filters';filters.setAttribute('role','tabpanel');filters.setAttribute('aria-labelledby',link.id);box.append(filters);
 const copy=document.querySelector('.lr-hero-copy');copy.querySelector('small').textContent='EXPLORE BY RAIL';copy.querySelector('h1').textContent='Your next journey, on the map.';copy.querySelector('p').textContent='Choose a country and discover routes, destinations and railway hubs.';
 link.setAttribute('aria-controls',filters.id);
 function show(){box.querySelectorAll('[role=tabpanel]').forEach(p=>p.hidden=p!==filters);box.querySelectorAll('[role=tab]').forEach(t=>t.setAttribute('aria-selected','false'));link.setAttribute('aria-current','page');}
 link.addEventListener('click',e=>{e.preventDefault();show()});
 box.querySelectorAll('[role=tab]').forEach(t=>t.addEventListener('click',()=>{filters.hidden=true;link.removeAttribute('aria-current')}));
 const date=document.getElementById('rm-travel-date'),to=document.getElementById('rm-to');
 const localISO=d=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
 const tomorrow=new Date();date.min=localISO(tomorrow);tomorrow.setDate(tomorrow.getDate()+1);date.value=localISO(tomorrow);
 document.getElementById('rm-search-submit').onclick=()=>{
  to.setCustomValidity(to.value?'':'Choose a destination to search this route.');if(!to.reportValidity()||!date.reportValidity())return;
  const from=document.getElementById('rm-from').value,slug=document.getElementById('rm-country').value;
  const country=(window.ATLAS_COUNTRIES||[]).find(c=>c.slug===slug)?.code||({france:'fr',uk:'uk',spain:'es',germany:'de',italy:'it',netherlands:'nl'})[slug]||slug;
  location.href='station-timetable.html?'+new URLSearchParams({station:from,from,to:to.value,country,date:date.value,searchtab:'timetable'})+'#station-timetable';
 };
 to.addEventListener('change',()=>to.setCustomValidity(''));
 date.required=true;
 show();
})();
