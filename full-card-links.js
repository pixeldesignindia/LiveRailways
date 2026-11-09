(()=>{'use strict';
 const selector='.ep-station,.ep-city-card,.lr-country-card,.lr-route-card,.lr-operator-card,.uk-directory-card,.ab-discovery-card,.ab-destination-card,.ab-video-card,.ep-journey-card,.lr-report-link-card,.ep-map-card,.jc-route,.destination-city,.jh-video-item,.ep-class';
 function enhance(){document.querySelectorAll(selector).forEach(card=>{
  if(card.matches('a,button')||card.closest('a,button')||card.querySelector(':scope > .lr-card-hit-area'))return;
  const links=[...card.querySelectorAll('a[href]')].filter(a=>a.getAttribute('href')&&!a.getAttribute('href').startsWith('#'));
  const station=card.matches('.ep-station')||card.querySelector('.uk-card-type')?.textContent==='STATION';
  const primary=(station?links.find(a=>a.getAttribute('href').includes('station-board')):null)||card.querySelector('h2 a[href],h3 a[href],[data-route-detail]')||links.find(a=>/^(view|explore|discover|open|watch|read|route details)/i.test(a.textContent.trim()))||links[0];
  if(!primary)return;
  const hit=document.createElement(primary.matches('a')?'a':'button');hit.className='lr-card-hit-area';
  const title=card.querySelector('h2,h3')?.textContent.trim()||primary.textContent.trim();hit.setAttribute('aria-label','Open '+title);
  if(primary.matches('a')){hit.href=primary.href;if(primary.target)hit.target=primary.target;if(primary.rel)hit.rel=primary.rel;}
  else{hit.type='button';hit.addEventListener('click',()=>primary.click());}
  card.classList.add('lr-whole-card');card.append(hit);
 });}
 let frame;const queue=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(enhance)};
 enhance();new MutationObserver(queue).observe(document.body,{childList:true,subtree:true});
})();
