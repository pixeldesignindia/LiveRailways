(()=>{
 function destination(kind){
  if(kind==='videos')return 'https://stream.liverailways.com/';
  if(kind==='map')return 'route-maps.html';
  const current=new URLSearchParams(location.search),q=new URLSearchParams({searchtab:kind});
  const country=document.getElementById('rm-country')?.value||document.getElementById('atlas-country')?.value||current.get('country');
  const station=current.get('station')||document.getElementById('rm-from')?.value||document.getElementById('lr-b-station')?.value||document.getElementById('lr-origin')?.value;
  if(country&&country!=='all')q.set('country',(window.ATLAS_COUNTRIES||[]).find(c=>c.code===country||c.slug===country)?.code||country);
  if(station){q.set('station',station);if(kind==='journey')q.set('from',station)}
  for(const key of ['stationId','code'])if(current.has(key))q.set(key,current.get(key));
  if(kind==='board'||kind==='timetable')q.set('openview','1');
  return (kind==='journey'?'index.html':kind==='board'?'station-board.html':'station-timetable.html')+'?'+q+(kind==='board'?'#station-board':kind==='timetable'?'#station-timetable':'');
 }
 document.addEventListener('click',event=>{
  const tab=event.target.closest('.lr-tabs [role=tab]');if(!tab)return;
  document.querySelectorAll('#station-board>.ab-board,#station-timetable').forEach(el=>el.hidden=true);
  if(!['lr-timetable-tab','lr-board-tab'].includes(tab.id))return;
  const kind=tab.id==='lr-board-tab'?'board':'timetable';
  const target=document.getElementById(kind==='board'?'station-board':'station-timetable');
  if(target){target.hidden=false;const board=target.querySelector('.ab-board');if(board)board.hidden=false;requestAnimationFrame(()=>target.scrollIntoView({behavior:'smooth',block:'start'}));return}
  event.preventDefault();event.stopImmediatePropagation();location.href=destination(kind);
 },true);
 function initialiseViews(){
  if(location.pathname.includes('train-details'))return;
  document.querySelectorAll('#station-board>.ab-board,#station-timetable').forEach(el=>el.hidden=true);
  if(document.getElementById('station-board')||document.getElementById('station-timetable')){
   const tab=document.getElementById(location.pathname.includes('station-timetable')?'lr-timetable-tab':'lr-board-tab');tab?.click();
  }
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialiseViews);else initialiseViews();
 function mount(){
  document.querySelectorAll('.lr-directory-hero-filters,.rm-search').forEach(panel=>{
   if(panel.closest('.lr-search-box')||panel.querySelector('.lr-panel-page-links'))return;
   const menu=document.createElement('nav');menu.className='lr-panel-page-links';menu.setAttribute('aria-label','Station tools');
   for(const [kind,label] of [['journey','Plan a Journey'],['timetable','Timetable'],['board','Station Board'],['videos','Live Videos'],['map','Route Map']]){
    const link=document.createElement('a');link.textContent=label;link.href=destination(kind);
    link.addEventListener('click',()=>{link.href=destination(kind)});menu.append(link);
   }
   panel.prepend(menu);
  });
  document.querySelectorAll('.public-navigation a,.rm-site-header nav a').forEach(link=>{
   if(/^(Station Board|Timetable)$/i.test(link.textContent.trim()))link.remove();
  });
 }
 mount();new MutationObserver(mount).observe(document.body,{childList:true,subtree:true});
})();
