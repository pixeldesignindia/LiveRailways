// Keep India's shared homepage panel scoped to Indian railway enquiry.
document.addEventListener('DOMContentLoaded',()=>{
 const el=id=>document.getElementById(id),url='https://enquiry.indianrail.gov.in/mntes/';
 const note='India journey search: live services are not connected. Use Indian Railways enquiry to check trains and schedules.';
 document.querySelector('.lr-map-filters').hidden=true;
 const list=document.createElement('datalist');list.id='india-station-suggestions';document.body.append(list);
 ['lr-origin','lr-destination'].forEach(id=>{el(id).value='';el(id).setAttribute('list',list.id)});
 window.LRStations.load().then(rows=>{for(const s of rows.filter(s=>s.countryCode==='in')){const o=document.createElement('option');o.value=s.name+' ('+s.code+')';list.append(o)}});
 el('lr-search-note').textContent=note;
 el('lr-journey').addEventListener('submit',e=>{e.preventDefault();e.stopImmediatePropagation();el('lr-search-note').replaceChildren(document.createTextNode(note+' '));const a=document.createElement('a');a.href=url;a.target='_blank';a.rel='noopener noreferrer';a.textContent='Open official train enquiry ↗';el('lr-search-note').append(a)},true);
 for(const id of ['lr-status','lr-boards']){const panel=el(id);panel.querySelector('p').textContent='Live Indian Railways information is not connected here. Check the official train enquiry service.';const a=panel.querySelector('a');a.href=url;a.textContent='Indian Railways enquiry ↗';a.target='_blank';a.rel='noopener noreferrer'}
 for(const id of ['lr-journey-tab','lr-timetable-tab'])el(id).addEventListener('click',()=>{el('lr-search-note').textContent=note});
});
