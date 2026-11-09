(() => {
 'use strict';
 const q=new URLSearchParams(location.search);
 if(q.get('view')==='table'||q.has('from')||q.has('to')||q.has('searchtab'))return;
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const norm=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/['’]/g,'').toLowerCase();
 const continents=[['asia-pacific','Asia Pacific'],['africa','Africa'],['europe','Europe'],['americas','Americas']];
 const zones=[['north','Northern Europe',['uk','ie','dk','no','se','fi','ee','lv','lt']],['west','Western Europe',['fr','nl','be','lu']],['central','Central Europe',['de','ch','at','cz','pl','hu','sk','si']],['south','Southern Europe',['es','it','pt','gr','tr','hr','ba','me','mk','rs','xk','al','mt','sm','va','cy']],['east','Eastern Europe',['ro','bg','md','by','ru','ua']],['caucasus','Caucasus',['am','az','ge']]];
 const featured=['uk','fr','de','nl','be','es','it','ch','at','tr','pt','gr','cz','no','se','pl','dk','hu','ie','fi'];
 const state={continent:'europe',zone:'all',country:q.get('country')||'all',scope:['streaming','catalogue','reports'].includes(q.get('scope'))?q.get('scope'):'reports',operator:q.get('operator')||'',query:'',sort:['durationDesc','durationAsc','distanceDesc','distanceAsc','featured'].includes(q.get('sort'))?q.get('sort'):'durationAsc',limit:30};
 let terminalData,catalogue,endpoints,photos,operators,countries=[],rows=[],matches=[];
 document.body.classList.add('lr-route-cards-view','lr-home-view');
 document.querySelector('.workspace').hidden=true;
 const main=document.createElement('main');main.className='lr-home lr-route-cards-home';main.id='route-cards-home';main.innerHTML='<div class="lr-home-container"><p role="status">Loading European routes…</p></div>';document.querySelector('.lr-banner').after(main);
 main.addEventListener('click',e=>{const card=e.target.closest('[data-route-id]');if(!card||e.ctrlKey||e.metaKey)return;const r=rows.find(r=>r.id===card.dataset.routeId);if(r&&window.LRApprovedDetail){e.preventDefault();e.stopPropagation();window.LRApprovedDetail.open(window.LRApprovedDetail.route(r));}},true);
 const time=m=>m<60?m+'m':Math.floor(m/60)+'h '+String(m%60).padStart(2,'0')+'m';
 const duration=r=>r.durationText||(!r.minutes?'Duration not supplied':r.minutes[1]&&r.minutes[1]!==r.minutes[0]?`${time(r.minutes[0])}–${time(r.minutes[1])}`:time(r.minutes[0]));
 const shortStation=name=>({
  'London St Pancras International':'London Pancras',
  "London St Pancras Int'l":'London Pancras',
  'London St Pancras':'London Pancras',
  'London Liverpool Street':'London Liverpool St',
  'Paris Gare du Nord':'Paris Nord',
  'Paris-Nord':'Paris Nord',
  'Paris Gare de Lyon':'Paris Lyon',
  'Paris Gare Montparnasse':'Paris Montparnasse'
 }[name]||name);
 function stationLabel(r,key){
  if(r[key]!=='London')return r[key];
  const known=r.operators.map(op=>terminalData.operators[op]?.terminal),terminals=[...new Set(known.filter(Boolean))];
  return known.every(Boolean)&&terminals.length===1?terminals[0]:'London (All Stations)';
 }
 function countryOptions(){return '<option value="all">All countries</option>'+countries.filter(c=>state.zone==='all'||zones.find(z=>z[0]===state.zone)[2].includes(c.code)).map(c=>`<option value="${c.code}" ${c.code===state.country?'selected':''}>${esc(c.name)}</option>`).join('')}
 function picture(r){const shared=(r.country==='uk'||r.report)?window.LRRouteOperatorImage?.(r,state.operator):null;if(shared)return {...shared,position:'50% 50%'};
  const place=norm(r.destination),photo=photos.find(p=>place===norm(p.city)||place.startsWith(norm(p.city)+' '));
  if(photo)return {...photo,credit:true};
  const scene=window.LR_SCENIC_RAIL?.[r.country];if(scene)return {image:'assets/'+scene.card,alt:scene.cardAlt||scene.alt,position:'50% 50%'};
  const op=operators.find(o=>o.ready&&o.countries.length===1&&o.countries[0]===r.country)||operators.find(o=>o.ready&&o.countries.includes(r.country));
  return op?{image:op.image,alt:op.imageAlt||op.label+' train illustration',position:'50% 50%'}:{image:'assets/landwasser.jpg',alt:'Rail journey inspiration, not a photograph of this route',position:'50% 50%'};
 }
 function importedCard(r){
  const v=r.report,photo=picture(r),ops=v.operators.filter(o=>!state.operator||o.name===state.operator),count=ops.reduce((n,o)=>n+o.trains,0),report=v.reportPage||'uk-route-report.html',details=report+'?'+new URLSearchParams({from:v.origin,to:v.destination,...(state.operator?{operator:state.operator}:{})}),tt='station-timetable.html?'+new URLSearchParams({station:v.origin,stationId:v.originId,from:v.origin,to:v.destination,country:r.country});
  return `<article class="lr-route-card uk-directory-card" style="--card-band:#173b5c" data-route-id="${esc(r.id)}" data-distance-km="${v.distanceKm??''}"><div class="uk-card-visual"><img src="${esc(photo.image)}" alt="${esc(photo.alt)}" loading="lazy" width="960" height="720"><span class="uk-card-type">DIRECT ROUTE</span><small class="uk-image-label">${esc(photo.name||v.providerLabel||'Operator')} · shared illustration</small></div><div class="uk-card-band"><h3 title="${esc(v.origin+' → '+v.destination)}"><span>${esc(v.originDisplay||v.origin)}</span><b>→</b><span>${esc(v.destinationDisplay||v.destination)}</span></h3></div><div class="uk-card-body"><div class="uk-card-metrics"><div><strong>${count}</strong><small>Trains / report day</small></div><div><strong>${time(v.fastestMinutes)}</strong><small>Fastest · route-wide</small></div><div><strong>${ops.length}</strong><small>Operators</small></div></div><p class="uk-card-copy">${v.distanceKm==null?'Distance not supplied':v.distanceKm+' km · '+esc(v.distanceBasis)}<br>${ops.map(o=>`<a href="${report}?${new URLSearchParams({operator:o.name})}">${esc(o.name)}</a>`).join(' · ')}</p><div class="uk-card-actions"><a href="${esc(details)}">Route details →</a><a href="${esc(tt)}">Timetable ↗</a></div><small class="uk-card-date">Report · 5 Nov 2026 · one direction</small></div></article>`;
 }
 function card(r){if(r.report)return importedCard(r);
  const photo=picture(r),country=countries.find(c=>c.code===r.country),href='routes.html?'+new URLSearchParams({view:'table',scope:state.scope,country:r.country,from:r.origin,to:r.destination,...(state.operator?{operator:state.operator}:{})}),distance=Number.isFinite(r.distance?.km)?`${/estimate/i.test(r.distance.kind)?'Est. ':''}${r.distance.km.toLocaleString()} km`:'Distance not supplied';
  return `<article class="lr-route-card" data-country="${esc(r.country)}" data-route-id="${esc(r.id)}" data-distance-km="${Number.isFinite(r.distance?.km)?r.distance.km:''}" data-duration-min="${durationValue(r,false)??''}" data-duration-max="${durationValue(r,true)??''}"><a class="lr-country-card lr-scenic-card" href="${esc(href)}" aria-label="Explore route ${esc(r.cardOriginFull)} to ${esc(r.cardDestinationFull)}"><div class="lr-country-photo"><img src="${esc(photo.image)}" alt="${esc(photo.alt)}" style="object-position:${esc(photo.position)}" width="960" height="540" loading="lazy"><span class="lr-route-country">${esc(country?.name||r.country)}</span></div><h2 class="lr-route-card-title" title="${esc(r.cardOriginFull+' → '+r.cardDestinationFull)}">${esc(r.report?.originDisplay||r.cardOrigin)} <span aria-hidden="true">→</span> ${esc(r.report?.destinationDisplay||r.cardDestination)}</h2><div class="lr-country-copy"><p class="lr-route-operators" title="${esc(r.operators.join(' · '))}">${esc(r.operators.join(' · '))}</p><div class="lr-route-metrics"><span>${esc(duration(r))}</span><span title="${esc(r.distance?.note||'')}">${esc(distance)}${r.distance?.kind?`<small style="display:block;font-size:11px">${esc(r.distance.kind)}</small>`:''}</span></div>${r.report?`<p class="uk-coverage-date"><strong>${state.operator?r.report.operators.find(o=>o.name===state.operator)?.trains??0:r.report.trainsOnReportDate} trains</strong> · 5 Nov 2026 · one direction</p>`:''}<span>Explore route <span aria-hidden="true">→</span></span></div></a><p class="lr-route-credit"><a href="station-timetable.html?${new URLSearchParams({station:r.origin,from:r.origin,to:r.destination,country:r.country})}">Timetable →</a> · ${photo.credit?`Photo: <a href="${esc(photo.source)}" target="_blank" rel="noopener noreferrer">${esc(photo.author)}</a> · <a href="${esc(photo.licenseUrl||photo.source)}" target="_blank" rel="noopener noreferrer">${esc(photo.license)}</a>`:`${esc(country?.name||'Scenic')} railway image · route illustration`}</p></article>`;
 }
 function tableLink(){return 'routes.html?'+new URLSearchParams({view:'table',scope:state.scope==='reports'?'streaming':state.scope,country:state.country,...(state.operator?{operator:state.operator}:{}),...(state.query?{city:state.query}:{}),...(state.sort!=='featured'?{sort:state.sort}:{})})}
 const durationValue=(r,longest)=>{const values=(r.minutes||[]).filter(Number.isFinite);return values.length?(longest?Math.max(...values):Math.min(...values)):null};
 function sortMatches(){
  if(state.sort==='featured')return;
  const descending=state.sort.endsWith('Desc'),distance=state.sort.startsWith('distance');
  matches.sort((a,b)=>{const av=distance?a.distance?.km:durationValue(a,descending),bv=distance?b.distance?.km:durationValue(b,descending),ak=Number.isFinite(av),bk=Number.isFinite(bv);return ak&&bk?(descending?bv-av:av-bv):ak?-1:bk?1:0});
 }
 function draw(){
  const europe=state.continent==='europe',name=continents.find(c=>c[0]===state.continent)[1],query=norm(state.query.trim());
  matches=europe?rows.filter(r=>(state.country==='all'||(r.countries||[r.country]).includes(state.country))&&(state.zone==='all'||zones.find(z=>z[0]===state.zone)[2].includes(r.country))&&(!state.operator||r.operators.includes(state.operator))&&(!query||norm([r.origin,r.destination,r.cardOrigin,r.cardDestination,r.cardOriginFull,r.cardDestinationFull,...r.operators,...(r.brands||[])].join(' ')).includes(query))):[];
  const opSelect=document.querySelector('#route-card-operator');const available=[...new Set(rows.filter(r=>state.country==='all'||(r.countries||[r.country]).includes(state.country)).flatMap(r=>r.operators))].sort();opSelect.innerHTML='<option value="">All operators</option>'+available.map(o=>`<option value="${esc(o)}">${esc(o)}</option>`).join('');opSelect.value=state.operator;
  sortMatches();
  document.querySelector('#route-card-grid').innerHTML=matches.slice(0,state.limit).map(card).join('')||`<div class="lr-home-country-empty">${europe?'No matching routes in the available catalogue. Try another country or route search.':esc(name)+' route cards are planned for a later phase.'}</div>`;
  document.querySelector('#route-card-heading').textContent=europe?'Explore Europe and neighbouring countries by rail':`Explore ${name} by rail`;
  document.querySelector('#route-card-total').textContent=europe?matches.length.toLocaleString()+(state.scope==='reports'?' imported directional routes · 5 Nov 2026':' routes'):'Coming soon';
  document.querySelector('#route-card-more').hidden=state.limit>=matches.length;
  document.querySelector('#route-card-page-count').textContent=matches.length?`Showing ${Math.min(state.limit,matches.length)} of ${matches.length.toLocaleString()} routes`:'';
  document.querySelector('#route-card-table-link').href=tableLink();document.querySelector('#route-card-table-link').hidden=!europe||(state.zone!=='all'&&state.country==='all');
  document.querySelector('#route-card-applied-operator').textContent=state.operator?'Operated by '+state.operator:'';
  document.querySelector('#route-card-panel').setAttribute('aria-labelledby','route-continent-'+state.continent);
  document.querySelectorAll('[data-route-continent]').forEach(b=>{b.setAttribute('aria-selected',String(b.dataset.routeContinent===state.continent));b.tabIndex=b.dataset.routeContinent===state.continent?0:-1});
  main.querySelectorAll('.lr-route-filter-input,.lr-route-reset').forEach(el=>el.disabled=!europe);
  document.querySelector('#route-zone-label').textContent=europe?'Europe zone':'Zone';
 }
 function render(){
  main.innerHTML=`<div class="lr-home-container"><div class="lr-home-continent-tabs" role="tablist" aria-label="Choose route continent">${continents.map(([id,label])=>`<button type="button" role="tab" id="route-continent-${id}" data-route-continent="${id}" aria-controls="route-card-panel" aria-selected="${id===state.continent}" tabindex="${id===state.continent?0:-1}">${label}</button>`).join('')}</div><section id="route-card-panel" role="tabpanel" aria-labelledby="route-continent-europe"><form class="lr-home-country-filters lr-route-filter-panel" aria-label="Filter route cards"><label for="route-card-zone"><span id="route-zone-label">Europe zone</span><select class="lr-route-filter-input" id="route-card-zone" aria-label="Europe zone"><option value="all">All zones</option>${zones.map(([id,label])=>`<option value="${id}">${label}</option>`).join('')}</select></label><label for="route-card-country">Country<select class="lr-route-filter-input" id="route-card-country" aria-label="Route country">${countryOptions()}</select></label><button type="reset" class="lr-route-reset">Reset</button></form><div class="lr-route-browse-heading"><div><h1 id="route-card-heading">Explore Europe and neighbouring countries by rail</h1><p><span id="route-card-total" role="status" aria-live="polite"></span><span id="route-card-applied-operator"></span></p></div><a id="route-card-table-link" href="${esc(tableLink())}">Table view ↗</a></div><div class="lr-route-search-row"><label for="route-card-query">Search routes<input class="lr-route-filter-input" id="route-card-query" type="search" placeholder="City, station or operator" value="${esc(state.query)}"></label><label for="route-card-scope">Route list<select class="lr-route-filter-input" id="route-card-scope"><option value="reports" ${state.scope==='reports'?'selected':''}>Imported routes · UK, Spain, Germany, France</option><option value="catalogue" ${state.scope==='catalogue'?'selected':''}>All listed station pairs</option><option value="streaming" ${state.scope==='streaming'?'selected':''}>Direct endpoint routes</option></select></label><label for="route-card-operator">Operator<select class="lr-route-filter-input" id="route-card-operator"><option value="">All operators</option></select></label><label for="route-card-sort">Sort by<select class="lr-route-filter-input" id="route-card-sort" aria-label="Sort route cards">${[['durationDesc','Duration: longest first'],['durationAsc','Duration: shortest first'],['distanceDesc','Longest distance first'],['distanceAsc','Shortest distance first'],['featured','Featured order']].map(([value,label])=>`<option value="${value}" ${state.sort===value?'selected':''}>${label}</option>`).join('')}</select></label></div><div class="lr-home-country-grid lr-route-card-grid" id="route-card-grid"></div><div class="lr-route-pagination"><button class="lr-load-more" id="route-card-more" style="display:none" type="button" aria-controls="route-card-grid">Load more</button><span id="route-card-page-count" role="status" aria-live="polite"></span></div><p class="lr-route-coverage">Imported cards use the same design as the UK route cards. Counts cover 5 November 2026 only. Shared operator illustrations are placeholders. Distances retain their reported track or straight-line basis. Use Route list to browse the older catalogue.</p></section></div>`;
  const form=main.querySelector('form');
  form.className='lr-home-country-filters lr-directory-shared-filters';
  const reset=form.querySelector('[type=reset]');
  reset.before(document.querySelector('#route-card-query').closest('label'),document.querySelector('#route-card-sort').closest('label'));
  const bottomRow=main.querySelector('.lr-route-search-row');
  bottomRow.className='lr-route-filter-bottom';
  form.append(bottomRow);
  document.querySelector('#route-card-panel').classList.add('lr-directory-continent-panel');
  main.querySelector('.lr-home-continent-tabs').before(main.querySelector('.lr-route-browse-heading'));
  const tabs=[...document.querySelectorAll('[data-route-continent]')];
  function choose(id,focus=false){state.continent=id;state.zone='all';state.country='all';state.query='';state.limit=30;document.querySelector('#route-card-zone').value='all';document.querySelector('#route-card-country').innerHTML=id==='europe'?countryOptions():'<option value="all">All countries</option>';document.querySelector('#route-card-query').value='';draw();if(focus)tabs.find(b=>b.dataset.routeContinent===id).focus()}
  tabs.forEach((b,i)=>{b.onclick=()=>choose(b.dataset.routeContinent);b.onkeydown=e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();choose(tabs[e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length].dataset.routeContinent,true)}}});
  document.querySelector('#route-card-zone').onchange=e=>{state.zone=e.target.value;state.country='all';state.limit=30;document.querySelector('#route-card-country').innerHTML=countryOptions();draw()};
  document.querySelector('#route-card-country').onchange=e=>{state.country=e.target.value;state.operator='';state.limit=30;draw()};
  document.querySelector('#route-card-query').oninput=e=>{state.query=e.target.value;state.limit=30;draw()};
  document.querySelector('#route-card-operator').onchange=e=>{state.operator=e.target.value;state.limit=30;draw()};
  document.querySelector('#route-card-sort').onchange=e=>{state.sort=e.target.value;state.limit=30;draw()};
  document.querySelector('#route-card-scope').onchange=e=>{state.scope=e.target.value;state.limit=30;prepareRows();draw()};
  main.querySelector('form').onsubmit=e=>e.preventDefault();main.querySelector('form').onreset=e=>{e.preventDefault();state.operator='';state.sort='durationAsc';state.scope='reports';document.querySelector('#route-card-sort').value=state.sort;document.querySelector('#route-card-scope').value=state.scope;prepareRows();choose(state.continent)};
  document.querySelector('#route-card-more').onclick=()=>{const previous=state.limit;state.limit+=30;document.querySelector('#route-card-grid').insertAdjacentHTML('beforeend',matches.slice(previous,state.limit).map(card).join(''));document.querySelector('#route-card-more').hidden=state.limit>=matches.length;document.querySelector('#route-card-page-count').textContent=`Showing ${Math.min(state.limit,matches.length)} of ${matches.length.toLocaleString()} routes`;};draw();
 }
 function prepareRows(){
  const groups=new Map(),source=state.scope==='reports'?catalogue.routes.filter(r=>r.report):state.scope==='streaming'?endpoints.routes:catalogue.routes;
  for(const r of source){if(!groups.has(r.country))groups.set(r.country,[]);groups.get(r.country).push({...r,cardOriginFull:stationLabel(r,'origin'),cardDestinationFull:stationLabel(r,'destination'),cardOrigin:shortStation(stationLabel(r,'origin')),cardDestination:shortStation(stationLabel(r,'destination'))})}
  for(const group of groups.values())group.sort((a,b)=>Number(b.main)-Number(a.main)||a.origin.localeCompare(b.origin)||a.destination.localeCompare(b.destination));
  const codes=[...groups.keys()].sort((a,b)=>(featured.includes(a)?featured.indexOf(a):100)-(featured.includes(b)?featured.indexOf(b):100)||a.localeCompare(b));rows=[];
  const max=Math.max(...[...groups.values()].map(x=>x.length));for(let i=0;i<max;i++)for(const code of codes)if(groups.get(code)[i])rows.push(groups.get(code)[i]);
 }
 Promise.all(['atlas-routes-data.json','streaming-routes-data.json','city-landmarks.json','operators-data.json','london-route-terminals.json'].map(url=>fetch(url).then(r=>{if(!r.ok)throw Error('Route data unavailable');return r.json()}))).then(([a,b,c,d,e])=>{terminalData=e;catalogue=a;endpoints=b;photos=c;operators=d;const codes=new Set([...a.routes,...b.routes].map(r=>r.country));countries=a.countries.filter(c=>codes.has(c.code)).sort((a,b)=>a.name.localeCompare(b.name));if(!countries.some(c=>c.code===state.country))state.country='all';prepareRows();render()}).catch(()=>{main.innerHTML='<div class="lr-home-container"><p role="alert">Route cards could not load. Please refresh or <a href="routes.html?view=table">open the route table</a>.</p></div>'});
})();
