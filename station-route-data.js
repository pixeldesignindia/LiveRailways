(()=>{'use strict';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const duration=v=>v==null?'Not supplied':Math.floor(v/60)+'h '+Math.round(v%60)+'m';
const cached=fetch('station-route-catalogue.json').then(r=>{if(!r.ok)throw Error();return r.json()});
function mount(main){
 if(main.dataset.routeCatalogue||location.pathname.includes('train-details')||new URLSearchParams(location.search).get('embed')==='schedule')return;main.dataset.routeCatalogue='1';
 const isBoard=main.id==='station-board',q=new URLSearchParams(location.search),d=window.LRStationDirectory,requested=main.dataset.routeStation||q.get('station')||q.get('from')||document.getElementById('lr-b-station')?.value||'Amsterdam Centraal';
 const station=d?.stations.find(s=>s.id===(main.dataset.routeStationId||q.get('stationId')))||d?.stations.find(s=>norm(s.name)===norm(requested))||d?.stations.find(s=>norm(s.city)===norm(requested));
 const names=new Set([requested,station?.name,...(station?.aliases||[])].map(norm).filter(Boolean)),city=norm(station?.routeCity||station?.city||requested),country=station?.countryCode||q.get('country');
 let mode=main.querySelector('[data-mode][aria-pressed=true]')?.dataset.mode||'departures',records=[],limit=20;
 const section=document.createElement('section');section.className='lr-route-facts';section.innerHTML='<header><h2>Route schedules</h2><p>Loading stored route data…</p></header><div class="lr-fact-filters"><label>Route or operator<input type="search" placeholder="Search routes"></label><label>Data coverage<select><option value="station">Station reports</option><option value="city">City route references</option></select></label></div><div class="lr-fact-count" role="status"></div><div class="lr-fact-rows"></div><div class="lr-fact-more"></div>';
 if(isBoard){const board=main.querySelector('.ab-board');board.after(section);section.querySelector('header h2').textContent='Routes from this station';}
 else {main.querySelector('.tt-results').after(section);const toggle=document.createElement('label');toggle.className='lr-demo-switch';toggle.innerHTML='<input type="checkbox"> Show simulated development timetable';section.after(toggle);const result=main.querySelector('.tt-results'),input=toggle.querySelector('input');input.checked=q.get('preview')!=='0';if(result)result.hidden=!input.checked;input.onchange=()=>{const old=main.querySelector('#tt-preview');if(old){old.checked=input.checked;old.dispatchEvent(new Event('change'))}if(result)result.hidden=!input.checked;};}
 const search=section.querySelector('input'),coverage=section.querySelector('select');
 const stationMatch=(r,side)=>r[side+'Id']===station?.id&&!!station?.id||names.has(norm(r[side]));
 const factLink=r=>{const p=new URLSearchParams({station:station?.name||requested,from:r.origin,to:r.destination,searchtab:'timetable'});if(station?.id)p.set('stationId',station.id);if(country)p.set('country',country);return 'station-timetable.html?'+p+'#station-timetable'};
 function render(){const term=norm(search.value),scope=coverage.value;let list=records.filter(r=>r.scope===scope);
  if(isBoard&&scope==='station')list=list.filter(r=>stationMatch(r,mode==='arrivals'?'destination':'origin'));
  if(!isBoard){const shared=window.LRSharedTimetableSearch?.get(),from=shared?.from||document.getElementById('lr-t-origin')?.value||q.get('from')||requested,to=shared?.to||document.getElementById('lr-t-destination')?.value||q.get('to'),op=shared?.operator;
   const matches=(endpoint,value)=>norm(endpoint)===norm(value)||scope==='city'&&names.has(norm(value))&&norm(endpoint)===city;
   if(from)list=list.filter(r=>matches(r.origin,from)||!r.directional&&matches(r.destination,from));
   if(to)list=list.filter(r=>matches(r.destination,to)||!r.directional&&matches(r.origin,to));
   if(op&&op!=='all')list=list.filter(r=>r.operators.some(o=>o.name===op));
  }
  list=list.filter(r=>!term||norm(r.origin+r.destination+r.operators.map(o=>o.name).join('')).includes(term));
  section.querySelector('.lr-fact-count').textContent=list.length+' '+(scope==='station'?'reported directional routes':'city-level route references')+' · showing '+Math.min(limit,list.length);
  section.querySelector('.lr-fact-rows').innerHTML='<table class="lr-route-report-table"><thead><tr><th scope="col">Route / Train operator</th><th scope="col">Duration</th><th scope="col">Distance / Report count</th></tr></thead><tbody>'+list.slice(0,limit).map(r=>`<tr><td><details class="lr-fact-row"><summary><span><strong>${esc(r.origin)} ${r.directional?'→':'↔'} ${esc(r.destination)}</strong><small>${esc(r.operators.map(o=>o.name).join(' · '))}</small></span></summary><div class="lr-fact-detail"><p>${r.scope==='station'?'Exact station endpoint match. Counts apply only to the source report date; they are not today’s services or daily averages.':'City-level reference only. This does not confirm service at this station, a direct train, or operation on the selected date.'}</p><dl><dt>Scheduled departure / arrival</dt><dd>Not supplied</dd><dt>Train numbers / platforms / live status</dt><dd>Not supplied</dd><dt>Fastest / average / slowest</dt><dd>${duration(r.fastest)} / ${duration(r.average)} / ${duration(r.slowest)}</dd><dt>Operators and report counts</dt><dd>${esc(r.operators.map(o=>o.name+(o.trains!=null?' · '+o.trains+' trains':'')).join('; '))}</dd><dt>Source</dt><dd>${esc(r.source)}${r.reportDate?' · '+esc(r.reportDate):r.reviewed?' · reviewed '+esc(r.reviewed):''}</dd>${r.stops?'<dt>Intermediate stops in report</dt><dd>'+esc(r.stops)+'</dd>':''}</dl>${r.note?'<p>'+esc(r.note)+'</p>':''}<a href="${esc(factLink(r))}">Open route schedule →</a></div></details></td><td>${duration(r.fastest??r.duration)}</td><td>${r.km==null?'—':esc(r.km)+' km'}<small>${r.count==null?'Count unavailable':r.count+' trains in report'}</small></td></tr>`).join('')+'</tbody></table>'+(list.length?'':'<p class="lr-fact-empty">No matching '+(scope==='station'?'station report routes. Check City route references for broader coverage.':'city route references are stored yet.')+'</p>');
  section.querySelector('.lr-fact-more').textContent=list.length>limit?'Scroll for more routes':'';
  
 }
 if(!isBoard)window.LRSharedTimetableSearch?.subscribe(()=>{limit=20;render()});
 search.oninput=()=>{limit=20;render()};coverage.onchange=()=>{limit=20;render()};
 main.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.mode;limit=20;render()}));
 new IntersectionObserver(entries=>{if(entries[0].isIntersecting&&section.querySelector('.lr-fact-more').textContent){limit+=20;render()}},{rootMargin:'150px'}).observe(section.querySelector('.lr-fact-more'));
 cached.then(data=>{records=data.rows.filter(r=>r.scope==='station'?(stationMatch(r,'origin')||stationMatch(r,'destination')):(!country||r.country===country)&&(norm(r.origin)===city||norm(r.destination)===city));const hasExact=records.some(r=>r.scope==='station');coverage.value=hasExact?'station':'city';section.querySelector('header p').textContent='Stored routes · live times unavailable.';render()}).catch(()=>{section.querySelector('header p').textContent='Route data could not load. Please refresh to retry.'});
}
function scan(){document.querySelectorAll('#station-board,#station-timetable').forEach(mount)}scan();new MutationObserver(scan).observe(document.body,{childList:true,subtree:true});
})();
