(() => {
 'use strict';
 function footerHTML(){
  const menu=[['Train Journey','index.html'],['Routes','routes.html'],['Destinations','destinations.html'],['Countries','countries.html'],['Trains','operators.html'],['Stations','stations.html'],['Live Videos','https://stream.liverailways.com/']];
  const operator=[['Plan a Journey','index.html'],['Status','status.html'],['Timetable','timetables.html'],['Station Board','station-board.html'],['Network Map','europe.html'],['Coverage & Sources','verification.html']];
  const query=new URLSearchParams(location.search);
  const page=location.pathname.split('/').pop().replace('.html','');
  const countries={uk:'uk',france:'fr',spain:'es',germany:'de',italy:'it',india:'in',portugal:'pt',switzerland:'ch',netherlands:'nl',belgium:'be'};
  const country=query.get('country')||(window.ATLAS_COUNTRIES||[]).find(c=>c.slug===page)?.code||countries[page]||'all';
  const pairs={uk:[['London','Manchester'],['London','Edinburgh'],['London','Glasgow']],fr:[['Paris','Lyon'],['Paris','Marseille'],['Paris','Bordeaux']],es:[['Madrid','Barcelona'],['Madrid','Sevilla'],['Madrid','Málaga']],de:[['Berlin','Munich'],['Frankfurt','Berlin'],['Hamburg','Munich']],it:[['Rome','Milan'],['Rome','Naples'],['Milan','Venice']],in:[['Mumbai','Delhi'],['Mumbai','Chennai'],['Delhi','Kolkata']],pt:[['Lisbon','Porto'],['Lisbon','Faro']],ch:[['Zurich','Geneva'],['Zurich','Basel']],nl:[['Amsterdam','Rotterdam'],['Amsterdam','Utrecht']],be:[['Brussels','Antwerp'],['Brussels','Bruges']]};
  const routePairs=pairs[country]||(country!=='all'?[]: [['London','Paris'],['Paris','Amsterdam'],['Madrid','Barcelona'],['Rome','Milan']]);
  const routeParams=(from,to)=>new URLSearchParams({country,scope:'catalogue',...(page==='eurostar'?{operator:'Eurostar'}:{}),from,to});
  const categories=[["scenic", "Europe’s Scenic Train Journeys"], ["high-speed", "Europe’s Fastest & High-Speed Trains"], ["night", "Europe’s Night & Sleeper Trains"], ["longest", "Longest European Train Journeys"], ["mountains", "Alpine & Mountain Railways"], ["winter", "Winter & Snow Inspiration"], ["coastal", "Coastal Train Journeys"], ["seasonal", "Seasonal Railway Experiences"], ["tourist", "Tourist Train Experiences"], ["heritage", "Heritage & Steam Railways"], ["luxury", "Luxury European Train Journeys"], ["international", "International Train Routes"]];
  const destinations=["Paris", "London", "Brussels", "Amsterdam", "Berlin", "Munich", "Frankfurt", "Cologne", "Zurich", "Geneva", "Vienna", "Milan", "Barcelona", "Madrid", "Lyon", "Marseille", "Copenhagen", "Stockholm", "Budapest", "Luxembourg"];
  return `<footer id="lr-site-footer" class="ep-site-footer" aria-label="Site footer"><div class="ep-footer-inner"><div class="ep-footer-grid"><div class="ep-footer-brand"><a href="index.html" aria-label="LiveRailways home"><img src="assets/liverailways-compact-matte-logo.webp" alt="LiveRailways" width="184" height="55" loading="lazy"></a><p>Explore European trains, routes and destinations.</p></div><nav aria-label="Footer explore"><h2>Explore</h2>${menu.map(([label,url])=>`<a href="${url}">${label}</a>`).join('')}</nav><nav aria-label="Footer rail information"><h2>Rail information</h2>${operator.map(([label,url])=>`<a href="${url}">${label}</a>`).join('')}</nav><nav aria-label="Footer popular routes"><h2>Explore routes</h2><a href="routes.html?country=${encodeURIComponent(country)}&scope=catalogue">Browse routes →</a>${routePairs.map(([from,to])=>`<a href="routes.html?${routeParams(from,to)}">${from} <span aria-hidden="true">→</span> ${to}</a>`).join('')}</nav></div><section class="ep-footer-discovery"><h2>Discover your next European train journey</h2><p>Explore scenery, train experiences and international connections.</p><nav class="ep-footer-category-links" aria-label="Journey categories">${categories.map(([id,label])=>`<a href="journey-collections.html?category=${id}">${label} →</a>`).join('')}</nav></section><section class="ep-footer-discovery"><h2>20 featured international destinations</h2><p>Explore catalogue connections to these cities. A discovery selection, not a popularity ranking.</p><nav class="ep-footer-destination-links" aria-label="International destinations">${destinations.map(city=>`<a href="journey-collections.html?category=international&destination=${encodeURIComponent(city)}">${city}</a>`).join('')}</nav></section><div class="ep-footer-bottom"><span>© ${new Date().getFullYear()} LiveRailways</span><a href="verification.html">Coverage &amp; sources</a></div></div></footer>`;
 }

 let scheduled=false;
 function sync(){
  scheduled=false;
  document.querySelector('#ep-site-footer')?.remove();
  let footer=document.getElementById('lr-site-footer');
  if(!footer){const holder=document.createElement('div');holder.innerHTML=footerHTML();footer=holder.firstElementChild;document.body.append(footer)}
  document.querySelectorAll('main footer,.workspace footer,footer.lr-home-footer,footer.results-footer').forEach(old=>{
   if(old===footer||old.classList.contains('sb-footer')||old.hasAttribute('data-lr-old-footer'))return;
   if(old.querySelector('a[href^="http"]')){
    let details=footer.querySelector('.lr-footer-references');
    if(!details){details=document.createElement('details');details.className='lr-footer-references';details.innerHTML='<summary>Page references</summary>';footer.querySelector('.ep-footer-bottom').before(details)}
    const copy=document.createElement('div');copy.innerHTML=old.innerHTML;details.append(copy);
   }
   old.setAttribute('data-lr-old-footer','');old.hidden=true;
  });
  if(footer.nextElementSibling)document.body.append(footer);
 }
 new MutationObserver(()=>{if(!scheduled){scheduled=true;requestAnimationFrame(sync)}}).observe(document.body,{childList:true,subtree:true});sync();
})();
