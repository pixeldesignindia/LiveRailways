(() => {
 'use strict';
 const main=document.createElement('main');main.className='ep-main';main.id='eurostar-profile';main.innerHTML='<p class="ep-loading">Eurostar…</p>';document.querySelector('.lr-banner').after(main);
 const originalShell=document.querySelector('.lr-search-shell');
 const searchDock=document.createElement('div');searchDock.className='ep-search-slot ep-hero-search';searchDock.id='ep-search';searchDock.hidden=true;originalShell.before(searchDock);searchDock.append(originalShell);
 const landmarks=window.LR_CITY_LANDMARKS||[];
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const lang='en'; // Multilingual rollout is deferred until the website is complete.
 const requestedTab=new URLSearchParams(location.search).get('tab');
 let data,locales,credits,mode=['journey','status','timetable','board'].includes(requestedTab)?requestedTab:'journey',mapObserver,mapWidth=0,aboutContent='';
 const state={origin:'London',destination:'Paris',date:'',datefrom:'',dateto:'',changes:'0',band:'any',station:new URLSearchParams(location.search).get('station')||'london-st-pancras',boardMode:'arrivals'};
 let selectedStation='london-st-pancras';
 const t=key=>({journey:'Plan a Journey',timetable:'Timetable',about:'About Eurostar',board:'Station Board',boardButton:'View Station Board',stationBoard:'Station Board'}[key])||locales?.[lang]?.[key]||locales?.en?.[key]||key;
 const num=(n,compact=false)=>new Intl.NumberFormat(lang,{notation:compact?'compact':'standard',maximumFractionDigits:compact?1:0}).format(n);
 const region=code=>{try{return new Intl.DisplayNames([lang],{type:'region'}).of(code)}catch{return code}};
 function readForm(){for(const key of Object.keys(state)){const field=document.getElementById('ep-'+key);if(field)state[key]=field.value}}
 function localizeHeader(){
  document.querySelectorAll('.public-navigation a').forEach(a=>{a.removeAttribute('aria-current');if(a.hasAttribute('data-trains-home'))a.setAttribute('aria-current','page')});
  const strip=[...document.querySelectorAll('.lr-black-strip span')];if(strip[0])strip[0].textContent=t('headerTag');if(strip[1])strip[1].textContent=t('headerNote');
  const preferences=document.getElementById('lr-preferences'),currency=localStorage.getItem('lr-currency')||'EUR';preferences.innerHTML=`${lang.toUpperCase()} / <span id="lr-currency-label">${esc(currency)}</span> ⌄`;preferences.setAttribute('aria-label',t('language')+' / '+t('currency'));
  const dialog=document.querySelector('.lr-preferences-dialog');if(!dialog)return;
  const labels=dialog.querySelectorAll('label'),selects=dialog.querySelectorAll('select'),paragraphs=dialog.querySelectorAll('p');
  dialog.querySelector('h2').textContent=t('currency');labels[0].childNodes[0].textContent=t('language');labels[1].childNodes[0].textContent=t('currency');
  selects[0].innerHTML='<option value="en">English</option>';selects[0].disabled=true;labels[0].hidden=true;paragraphs[0].hidden=true;paragraphs[1].textContent=t('currencyHint');dialog.querySelector('.lr-close').setAttribute('aria-label',t('close'));dialog.querySelector('.lr-find').textContent=t('done');
 }
 function fact(value,key){return `<div class="ep-fact"><strong>${value}</strong><span>${esc(t(key))}</span></div>`}
 function searchHTML(){
  const tabs=['journey','status','timetable','board'];
  return `<div class="lr-search-box"><div class="lr-tabs" role="tablist" aria-label="${esc(t('searchTitle'))}">${tabs.map(key=>`<button type="button" role="tab" id="ep-tab-${key}" aria-controls="ep-panel" aria-selected="${key===mode}" tabindex="${key===mode?0:-1}" data-mode="${key}">${esc(t(key))}</button>`).join('')}</div><div id="ep-panel" class="ep-search-body" role="tabpanel" aria-labelledby="ep-tab-${mode}">${formHTML()}</div></div>`;
 }
 function stationSelect(key,label,all=true){const stations=data.mapStations;return `<label for="ep-${key}">${esc(t(label))}<select id="ep-${key}">${all?`<option value="">${esc(t('all'))}</option>`:''}${stations.map(s=>`<option value="${esc(s.city)}" ${state[key]===s.city?'selected':''}>${esc(s.name)}</option>`).join('')}</select></label>`}
 function inputDate(key,label){return `<label for="ep-${key}">${esc(t(label))}<input id="ep-${key}" type="date" value="${esc(state[key])}"></label>`}
 function band(){return `<label for="ep-band">${esc(t('band'))}<select id="ep-band">${[['any',t('anyTime')],['00-06','00:00–06:00'],['06-12','06:00–12:00'],['12-18','12:00–18:00'],['18-24','18:00–24:00']].map(([v,label])=>`<option value="${v}" ${state.band===v?'selected':''}>${esc(label)}</option>`).join('')}</select></label>`}
 function formHTML(){
  if(mode==='timetable')return window.LREurostarTimetable.html(data.mapStations,state);
  if(mode==='status')return `<div class="ep-status-panel"><p>${esc(t('statusText'))}</p><a class="ep-find" href="https://www.eurostar.com/uk-en/travel-info/service-information" target="_blank" rel="noopener noreferrer">${esc(t('statusButton'))} ↗</a></div>`;
  if(mode==='board')return window.LREurostarBoard.html(data.mapStations,state);
  const ranges=mode!=='journey';
  return `<form id="ep-search-form"><div class="ep-search-grid">${stationSelect('origin','origin')}<button type="button" class="ep-swap" id="ep-swap" aria-label="${esc(t('swap'))}">⇄</button>${stationSelect('destination','destination')}${ranges?'':inputDate('date','date')}</div>${ranges?`<div class="ep-search-grid ep-extra-fields">${inputDate('datefrom','fromDate')}${inputDate('dateto','toDate')}${band()}</div>`:`<div class="ep-search-grid ep-extra-fields"><label for="ep-changes">${esc(t('changes'))}<select id="ep-changes"><option value="any" ${state.changes==='any'?'selected':''}>${esc(t('all'))}</option><option value="0" ${state.changes==='0'?'selected':''}>${esc(t('direct'))}</option></select></label>${band()}<button class="ep-find" type="submit">${esc(t('findTrains'))} →</button></div>`}${ranges?`<div style="margin-top:16px"><button class="ep-find" type="submit">${esc(t(mode==='schedule'?'findSchedule':'findTimetable'))} →</button></div>`:''}</form>`;
 }
 function bindSearch(){
  const shell=originalShell;searchDock.classList.toggle('ep-board-open',mode==='board');if(mode==='board')window.LREurostarBoard.bind(data.mapStations,state);else window.LREurostarBoard.dispose();
  if(mode==='timetable')window.LREurostarTimetable.bind(data.mapStations,state,data.cataloguePairs);
  const tabButtons=[...shell.querySelectorAll('[data-mode]')];
  function activate(key,focus=false){readForm();mode=key;const q=new URLSearchParams(location.search);q.set('tab',key);history.replaceState(null,'',location.pathname+'?'+q+location.hash);shell.innerHTML=searchHTML();bindSearch();if(focus)shell.querySelector('[aria-selected="true"]').focus()}
  tabButtons.forEach((b,i)=>{b.onclick=()=>activate(b.dataset.mode);b.onkeydown=e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?tabButtons.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabButtons.length)%tabButtons.length;activate(tabButtons[next].dataset.mode,true)}}});
  const swap=document.getElementById('ep-swap');if(swap)swap.onclick=()=>{readForm();[state.origin,state.destination]=[state.destination,state.origin];shell.innerHTML=searchHTML();bindSearch()};
  const from=document.getElementById('ep-datefrom'),to=document.getElementById('ep-dateto');if(from&&to){to.min=from.value;from.oninput=()=>to.min=from.value}
  const form=document.getElementById('ep-search-form');if(form)form.onsubmit=e=>{
   e.preventDefault();readForm();
   if(mode==='board'){const station=data.stations.find(s=>s.id===state.station);location.href='station-board.html?'+new URLSearchParams({searchtab:'board',station:station.name})+'#station-board';return}
   const q=new URLSearchParams({country:'all',operator:'Eurostar',scope:mode==='journey'&&state.changes==='0'?'streaming':'catalogue',searchtab:mode});
   if(state.origin)q.set('from',state.origin);if(state.destination)q.set('to',state.destination);
   if(mode==='journey'){q.set('changes',state.changes);if(state.date)q.set('date',state.date)}else{if(state.datefrom)q.set('datefrom',state.datefrom);if(state.dateto)q.set('dateto',state.dateto)}
   if(state.band!=='any'){q.set('timeband',state.band);q.set('timebasis','departures');q.set('scope','streaming')}
   location.href='routes.html?'+q;
  };
 }
 function routeCards(){
  const cities=['London','Paris','Brussels','Amsterdam','Rotterdam','Antwerp','Cologne','Lille'];
  const colours=['#173E75','#713154','#334E77','#70405C','#24536B','#4D3D78','#823B46','#29565A'];
  return `<section id="ep-routes" class="ep-section"><div class="ep-section-heading"><div><h2>Explore Eurostar destinations</h2><p>Choose a city to explore its Eurostar routes.</p></div></div><div class="ep-city-grid">${cities.map((city,i)=>{
   const station=data.stations.find(s=>s.city===city),photo=landmarks.find(p=>p.city===city),credit=photo;
   const url='destinations.html?'+new URLSearchParams({city,operator:'Eurostar'});
   return `<article class="ep-city-card" data-country="${esc(station.country)}"><a class="lr-country-card lr-scenic-card" style="--country-band:${colours[i]}" href="${esc(url)}" aria-label="Explore ${esc(city)} Eurostar routes"><div class="lr-country-media"><div class="lr-country-photo"><img src="${esc(photo.image)}" alt="${esc(photo.alt)}" style="object-position:${esc(photo.position)}" width="960" height="540" loading="lazy"></div><h3 class="lr-country-name">${esc(city)}</h3></div><div class="lr-country-copy"><p class="lr-country-places">${esc(photo.landmark)}</p><p class="lr-country-description">${esc(region(station.country))} · Eurostar destinations and routes</p><span>Explore ${esc(city)} <span aria-hidden="true">→</span></span></div></a><p class="ep-city-credit">Photo: <a href="${esc(credit.source)}" target="_blank" rel="noopener noreferrer">${esc(credit.author)}</a> · <a href="${esc(credit.licenseUrl||credit.source)}" target="_blank" rel="noopener noreferrer">${esc(credit.license)}</a></p></article>`;
  }).join('')}</div></section>`;
 }
 function eurostarRouteCards(){
  const order=[['London','Paris'],['London','Brussels'],['London','Amsterdam'],['Paris','Brussels'],['Paris','Amsterdam'],['Brussels','Amsterdam'],['Brussels','Cologne'],['Rotterdam','Brussels'],['Antwerp','Amsterdam']];
  const palette=['#173E75','#713154','#24536B','#4D3D78','#823B46','#334E77','#29565A','#70405C','#173E75'];
  const pairs=order.filter(([a,b])=>data.cataloguePairs.some(p=>p.includes(a)&&p.includes(b)));
  return `<section id="ep-rail-routes" class="ep-section"><div class="ep-section-heading"><div><h2>Explore Eurostar routes</h2><p>Choose a journey to explore the matching Eurostar route records.</p></div><a href="routes.html?country=all&scope=catalogue&operator=Eurostar">All Eurostar routes →</a></div><div class="ep-journey-grid">${pairs.map(([from,to],i)=>{
   const origin=data.stations.find(s=>s.city===from),destination=data.stations.find(s=>s.city===to),photo=landmarks.find(p=>p.city===to),url='routes.html?'+new URLSearchParams({country:'all',scope:'catalogue',operator:'Eurostar',from,to});
   return `<article class="ep-city-card ep-journey-card" data-country="${esc(origin.country)}"><a class="lr-country-card lr-scenic-card" style="--country-band:${palette[i]}" href="${esc(url)}" aria-label="Explore Eurostar route from ${esc(from)} to ${esc(to)}"><div class="lr-country-media"><div class="lr-country-photo"><img src="${esc(photo.image)}" alt="${esc(photo.alt)}" style="object-position:${esc(photo.position)}" width="960" height="540" loading="lazy"></div><h3 class="lr-country-name">${esc(from)} <span aria-hidden="true">→</span> ${esc(to)}</h3></div><div class="lr-country-copy"><p class="ep-journey-stations">${esc(origin.name)}<span aria-hidden="true">↓</span>${esc(destination.name)}</p><span>Explore route <span aria-hidden="true">→</span></span></div></a><p class="ep-city-credit">Photo: <a href="${esc(photo.source)}" target="_blank" rel="noopener noreferrer">${esc(photo.author)}</a> · <a href="${esc(photo.licenseUrl||photo.source)}" target="_blank" rel="noopener noreferrer">${esc(photo.license)}</a></p></article>`;
  }).join('')}</div><p class="ep-note">Routes shown are from the current LiveRailways catalogue. Confirm dated services and tickets with Eurostar.</p></section>`;
 }
 function footerHTML(){
  const menu=[['Home','index.html'],['Routes','routes.html'],['Destinations','destinations.html'],['Countries','countries.html'],['Operators','operators.html'],['Stations','stations.html'],['Live Videos','https://stream.liverailways.com/']];
  const operator=[['Plan a Journey','journey'],['Status','status'],['Timetable','timetable'],['Station Board','board'],['About Eurostar','about']];
  const routePairs=[['London','Paris'],['London','Brussels'],['London','Amsterdam'],['Paris','Brussels'],['Paris','Amsterdam'],['Brussels','Cologne']];
  return `<footer id="ep-site-footer" class="ep-site-footer" aria-label="Site footer"><div class="ep-footer-inner"><div class="ep-footer-grid"><div class="ep-footer-brand"><a href="index.html" aria-label="LiveRailways home"><img src="assets/liverailways-compact-matte-logo.webp" alt="LiveRailways" width="184" height="55" loading="lazy"></a><p>Explore European trains, routes and destinations.</p></div><nav aria-label="Footer explore"><h2>Explore</h2>${menu.map(([label,url])=>`<a href="${url}">${label}</a>`).join('')}</nav><nav aria-label="Footer Eurostar"><h2>Eurostar</h2>${operator.map(([label,tab])=>`<a href="eurostar.html?tab=${tab}#ep-search">${label}</a>`).join('')}</nav><nav aria-label="Footer popular routes"><h2>Popular routes</h2>${routePairs.map(([from,to])=>`<a href="routes.html?${new URLSearchParams({country:'all',scope:'catalogue',operator:'Eurostar',from,to})}">${from} <span aria-hidden="true">→</span> ${to}</a>`).join('')}</nav></div><div class="ep-footer-bottom"><span>© ${new Date().getFullYear()} LiveRailways</span><a href="#ep-sources">Sources &amp; image credits</a></div></div></footer>`;
 }
 function stationCard(s){return window.LRStations.card(s,{routeAction:'button',boardLabel:t('stationBoard'),routeLabel:t('findRoutes')})}
 function render(){
  mapObserver?.disconnect();mapWidth=0;document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';document.title='Eurostar | LiveRailways';main.dataset.language=lang;main.dataset.languageMode='english-only';
  const st=data.stats;
  aboutContent=`<div class="ep-about-panel ep-about-content"><h2>${esc(t('tagline'))}</h2><p class="ep-intro">${esc(t('intro'))}</p><div class="ep-countries">${['GB','FR','BE','NL','DE'].map(code=>`<span>${esc(region(code))}</span>`).join('')}</div><div class="ep-facts">${fact(num(st.started).replace(/[,٬.\s]/g,''),'started')}${fact(num(st.countries),'countries')}${fact(num(st.destinations),'destinations')}${fact(num(st.fleet),'fleet')}${fact(num(st.annualJourneys,true),'annual')}${fact(num(st.unified).replace(/[,٬.\s]/g,''),'unified')}</div><p class="ep-facts-note">${esc(t('factsNote'))} <a href="#ep-sources">${esc(t('sources'))} ↘</a></p><section class="ep-section" id="ep-classes"><div class="ep-section-heading"><h2>${esc(t('classesTitle'))}</h2><a href="https://www.eurostar.com/uk-en/travel-info/eurostar-experience/travel-classes" target="_blank" rel="noopener noreferrer">${esc(t('classDetails'))} ↗</a></div><div class="ep-classes">${[['Eurostar Standard','standardText'],['Eurostar Plus','plusText'],['Eurostar Premier','premierText']].map(([name,key])=>`<article class="ep-class"><h3>${name}</h3><p>${esc(t(key))}</p></article>`).join('')}</div><p class="ep-note">${esc(t('classesNote'))}</p></section><section class="ep-section" id="ep-statistics"><div class="ep-section-heading"><h2>${esc(t('statsTitle'))}</h2></div><div class="ep-stat-grid">${[[num(st.dailyAverage,true),'dailyAverage'],[num(st.catalogueDomesticPairs),'domestic'],[num(st.catalogueInternationalPairs),'international'],[num(st.verifiedEndpointPairs),'endpoint']].map(([value,key])=>`<div class="ep-stat"><strong>${value}</strong><span>${esc(t(key))}</span></div>`).join('')}</div><p class="ep-note">${esc(t('dailyNote'))}<br>${esc(t('catalogueNote'))}</p></section></div>`;
  main.innerHTML=`${eurostarRouteCards()}<section class="ep-section" id="ep-network"><div class="ep-section-heading"><div><h2>${esc(t('routeMap'))}</h2><p>${esc(t('mapNote'))}</p></div><a href="https://www.eurostar.com/uk-en/destinations/routemap" target="_blank" rel="noopener noreferrer">${esc(t('officialMap'))} ↗</a></div><div class="ep-map-card"><div class="ep-map-stage" id="ep-map-stage"><svg id="ep-map" role="img" aria-label="${esc(t('routeMap'))}"></svg><div class="ep-map-controls"><button type="button" id="ep-map-plus" aria-label="${esc(t('zoomIn'))}">+</button><button type="button" id="ep-map-minus" aria-label="${esc(t('zoomOut'))}">−</button><button type="button" id="ep-map-reset" aria-label="${esc(t('resetMap'))}">↺</button></div></div><div class="ep-map-bottom"><div class="ep-map-legend"><span><i></i>${esc(t('core'))}</span><span><i class="tunnel"></i>${esc(t('tunnel'))}</span></div><div class="ep-map-selected"><span id="ep-map-station" aria-live="polite">${esc(t('chooseStation'))}</span><button type="button" id="ep-map-origin" disabled>${esc(t('useOrigin'))}</button></div></div></div></section><section class="ep-section" id="ep-stations"><div class="ep-section-heading"><div><h2>${esc(t('stationsTitle'))}</h2><p>${esc(t('stationsIntro'))}</p></div></div><div class="ep-stations">${data.stations.map(stationCard).join('')}</div></section>${routeCards()}<details class="ep-sources" id="ep-about" ${requestedTab==='about'?'open':''}><summary>About Eurostar</summary>${aboutContent}</details><details class="ep-sources" id="ep-sources"><summary>${esc(t('sources'))}</summary><p class="ep-note">${esc(t('reviewed'))}: ${new Intl.DateTimeFormat(lang,{dateStyle:'long',timeZone:'Asia/Dubai'}).format(new Date(data.reviewed+'T12:00:00Z'))}</p><ul>${data.sources.map((s,i)=>`<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">Eurostar · ${esc(t(['sourceStats','sourceHistory','sourceNetwork','sourceMap'][i]))}</a></li>`).join('')}</ul><h3>Hero banner illustrations</h3><p class="ep-note">Two AI-generated scenic illustrations, created for a 3:1 banner. These are decorative scenes, not photographs of a specific service or route. Train reference: <a href="https://commons.wikimedia.org/wiki/File:Eurostar_Class_374_on_HS1.jpg" target="_blank" rel="noopener noreferrer">Kabelleger / David Gubler</a>, <a href="https://creativecommons.org/licenses/by-sa/4.0" target="_blank" rel="noopener noreferrer">CC BY-SA 4.0</a>. Banner adaptations are shared under the same licence.</p><h3>${esc(t('imageNote'))}</h3><ul>${credits.map(c=>`<li><a href="${esc(c.page)}" target="_blank" rel="noopener noreferrer">${esc(c.title)}</a> — ${esc(c.author)} · <a href="${esc(c.licenseUrl||c.page)}" target="_blank" rel="noopener noreferrer">${esc(c.license)}</a> · ${esc(c.changes)}</li>`).join('')}</ul></details>${footerHTML()}`;
  document.querySelector('body>.ep-site-footer')?.remove();main.after(main.querySelector('.ep-site-footer'));
  originalShell.innerHTML=searchHTML();searchDock.hidden=false;bindSearch();
  main.querySelectorAll('[data-origin]').forEach(b=>b.onclick=()=>useOrigin(b.dataset.origin));

  localizeHeader();drawMap();mapObserver=new ResizeObserver(()=>{const width=document.getElementById('ep-map-stage')?.clientWidth;if(width&&width!==mapWidth)drawMap()});mapObserver.observe(document.getElementById('ep-map-stage'));
 }
 function useOrigin(city){readForm();state.origin=city;mode='journey';originalShell.innerHTML=searchHTML();bindSearch();document.getElementById('ep-search').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});document.getElementById('ep-origin').focus({preventScroll:true})}
 function drawMap(){
  const stage=document.getElementById('ep-map-stage');if(!stage||!window.d3)return;
  const W=stage.clientWidth,H=stage.clientHeight;if(!W)return;mapWidth=W;
  const svg=d3.select('#ep-map');svg.selectAll('*').remove();svg.attr('viewBox',`0 0 ${W} ${H}`);
  const projection=d3.geoMercator().fitExtent([[28,30],[W-28,H-35]],{type:'MultiPoint',coordinates:[[-1.15,48.35],[8.3,52.75]]});
  const path=d3.geoPath(projection),g=svg.append('g');g.selectAll('path.country').data(data.geography.features).join('path').attr('class','ep-map-country').attr('d',path);
  const corridors=[[[2.3553,48.8809],[2.8,50.12],[3.16,50.52],[4.3364,50.8357]],[[3.0759,50.639],[3.16,50.52]],[[4.3364,50.8357],[4.4211,51.2172],[4.4696,51.924],[4.9,52.3791]],[[4.3364,50.8357],[5.566,50.624],[6.091,50.767],[6.958,50.943],[6.794,51.22],[7.459,51.517]],[[-.1261,51.5319],[.6,51.32],[1.17,51.09],[1.81,50.94],[3.0759,50.639]]];
  const line=d3.line().x(d=>projection(d)[0]).y(d=>projection(d)[1]);g.selectAll('path.route').data(corridors).join('path').attr('class','ep-map-route').attr('d',line);g.append('path').attr('class','ep-map-tunnel').attr('d',line([[1.17,51.09],[1.81,50.94]]));
  const offsets={'London':[-9,-13,'end'],'Paris':[9,18,'start'],'Brussels':[-10,16,'end'],'Amsterdam':[0,-13,'middle'],'Rotterdam':[-10,-8,'end'],'Antwerp':[-10,-7,'end'],'Lille':[-10,4,'end'],'Cologne':[10,16,'start'],'Liège':[0,23,'middle'],'Aachen':[0,-13,'middle'],'Düsseldorf':[8,-9,'start'],'Dortmund':[8,-8,'start']};
  function select(s){selectedStation=s.id;document.getElementById('ep-map-station').textContent=s.name;document.getElementById('ep-map-origin').disabled=false;g.selectAll('circle').classed('active',d=>d.id===s.id)}
  const circles=g.selectAll('circle').data(data.mapStations).join('circle').attr('class','ep-map-stop').attr('cx',d=>projection(d.coords)[0]).attr('cy',d=>projection(d.coords)[1]).attr('r',W<600?4:5).attr('tabindex',0).attr('role','button').attr('aria-label',d=>d.name).on('click',(_,s)=>select(s)).on('keydown',(e,s)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select(s)}});circles.append('title').text(d=>d.name);
  const labelStations=W<600?data.mapStations.filter(s=>['London','Paris','Brussels','Amsterdam','Cologne'].includes(s.city)):data.mapStations;
  g.selectAll('text.stop-label').data(labelStations).join('text').attr('class','ep-map-label').attr('x',s=>projection(s.coords)[0]+offsets[s.city][0]).attr('y',s=>projection(s.coords)[1]+offsets[s.city][1]).attr('text-anchor',s=>offsets[s.city][2]).text(s=>s.city);
  const zoom=d3.zoom().scaleExtent([1,4]).filter(e=>e.type!=='wheel'||e.ctrlKey).on('zoom',e=>g.attr('transform',e.transform));svg.call(zoom);
  document.getElementById('ep-map-plus').onclick=()=>svg.call(zoom.scaleBy,1.3);document.getElementById('ep-map-minus').onclick=()=>svg.call(zoom.scaleBy,1/1.3);document.getElementById('ep-map-reset').onclick=()=>svg.call(zoom.transform,d3.zoomIdentity);document.getElementById('ep-map-origin').onclick=()=>{const s=data.mapStations.find(s=>s.id===selectedStation);if(s)useOrigin(s.city)};
 }
 async function init(){
  try{
   const loaded=await Promise.all(['eurostar-data.json','eurostar-locales.json','eurostar-photo-credits.json'].map(url=>fetch(url).then(r=>{if(!r.ok)throw Error('Profile data');return r.json()})));[data,locales,credits]=loaded;
   const stations=await window.LRStations.load(),lookup=new Map(stations.map(s=>[s.id,s]));data.stations=data.stationIds.map(id=>lookup.get(id)).filter(Boolean).map(s=>({...s,city:s.routeCity||s.city}));credits=[...credits,...data.stations.map(s=>s.credit).filter(Boolean)];
   render();
  }catch{main.innerHTML=`<p class="ep-loading">${esc(t('loadingError'))}</p>`}
 }
 init();
})();
