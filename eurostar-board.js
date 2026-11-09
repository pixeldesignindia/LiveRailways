(()=>{
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let boardInstance;
 function selected(stations,state){return stations.find(s=>s.id===state.station)||stations[0]}
 window.LREurostarBoard={
  html(stations,state){const current=selected(stations,state);return `<section class="ep-inline-board"><div class="ep-board-heading"><h2>Live Eurostar Board</h2><span class="ep-board-preview">Board preview · Illustrative data</span></div><span class="ep-board-selection-status" id="ep-board-current" aria-live="polite">${esc(current.name)}</span><div class="ep-board-layout"><aside class="ep-board-ad" aria-label="Left advertisement banner"><span>ADVERTISEMENT</span><small>Banner space</small></aside><div class="ep-board-frame-panel sb-refined" id="ep-board-frame-panel" role="region" aria-label="Eurostar station information board"><div id="ep-eurostar-board-host"></div></div><aside class="ep-board-ad" aria-label="Right advertisement banner"><span>ADVERTISEMENT</span><small>Banner space</small></aside></div></section>`},
  dispose(){boardInstance?.destroy();boardInstance=null},
  bind(stations,state){const host=document.getElementById('ep-eurostar-board-host');if(!host)return;
   function show(station,focus=false){boardInstance?.destroy();boardInstance=window.LRStationBoard.mount({host,embedded:true,params:new URLSearchParams({operator:'Eurostar',station:station.name,city:station.city,mode:state.boardMode||'arrivals'}),onMode:mode=>state.boardMode=mode});const toolbar=host.querySelector('.ab-station-title');const label=document.createElement('label');label.className='ep-board-destination';label.htmlFor='ep-board-destination';label.innerHTML=`<span>Destination</span><select id="ep-board-destination" aria-label="Destination Station">${stations.map(s=>`<option value="${esc(s.id)}" ${s.id===station.id?'selected':''}>${esc(s.name)}</option>`).join('')}</select>`;toolbar.querySelector('h1').after(label);const dropdown=label.querySelector('select');dropdown.onchange=()=>choose(dropdown.value);if(focus)dropdown.focus({preventScroll:true})}
   function choose(id){const station=stations.find(s=>s.id===id);if(!station)return;state.station=id;const query=new URLSearchParams(location.search);query.set('tab','board');query.set('station',id);history.replaceState(null,'',location.pathname+'?'+query+location.hash);document.getElementById('ep-board-current').textContent=station.name;show(station,true)}
   show(selected(stations,state));
  }
 };
})();
