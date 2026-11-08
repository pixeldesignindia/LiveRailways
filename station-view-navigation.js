/* One station identity and the same two views on every station page. */
(()=>{'use strict';
function setup(){
 const p=new URLSearchParams(location.search),isTimetable=/station-timetable(?:\.html)?\/?$/.test(location.pathname);
 const list=window.LRStationDirectory?.stations||[],normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
 const requested=p.get('station')||p.get('from')||'Amsterdam Centraal';
 const st=list.find(s=>s.id===p.get('stationId'))||list.find(s=>(!p.get('country')||p.get('country')===s.countryCode)&&[s.name,...(s.aliases||[])].some(n=>normalize(n)===normalize(requested)));
 const identity={station:st?.name||requested,...(st?{stationId:st.id,country:st.countryCode,...(st.code?{code:st.code}:{})}:Object.fromEntries(['stationId','country','code'].filter(k=>p.has(k)).map(k=>[k,p.get(k)])))};
 function url(view){const q=new URLSearchParams({...identity,searchtab:view==='board'?'board':'timetable'});if(p.get('date'))q.set('date',p.get('date'));return 'station-'+(view==='board'?'board':'timetable')+'.html?'+q+'#station-'+(view==='board'?'board':'timetable')}
 const nav=document.createElement('nav');nav.className='lr-station-views';nav.setAttribute('aria-label','Station information views');
 [['board','Station Board'],['timetable','TimeTable']].forEach(([view,label])=>{const a=document.createElement('a');a.href=url(view);a.textContent=label;if((view==='timetable')===isTimetable)a.setAttribute('aria-current','page');nav.append(a)});
 const main=document.querySelector('#station-timetable,#station-board');if(main)main.prepend(nav);
 const board=document.getElementById('lr-b-station'),origin=document.getElementById('lr-t-origin');if(board)board.value=identity.station;if(origin&&!origin.value)origin.value=identity.station;
 // Hero tabs switch forms; the fixed links above switch station views.
 const boardForm=document.getElementById('lr-board-form');if(boardForm){const original=boardForm.onsubmit;boardForm.onsubmit=e=>{if(normalize(board.value)===normalize(identity.station)){e.preventDefault();location.href=url('board')}else original?.(e)}}
 const timetableForm=document.getElementById('lr-timetable');if(timetableForm&&!isTimetable){const original=timetableForm.onsubmit;timetableForm.onsubmit=e=>{if(normalize(origin.value)!==normalize(identity.station)){original?.(e);return}e.preventDefault();const target=new URL(url('timetable'),location.href);for(const [id,key]of [['lr-t-destination','to'],['lr-t-datefrom','datefrom'],['lr-t-dateto','dateto'],['lr-t-band','timeband'],['lr-t-operator','operator'],['lr-t-changes','changes']]){const value=document.getElementById(id)?.value;if(value)target.searchParams.set(key,value)}location.href=target.href}}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
})();
