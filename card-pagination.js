(() => {
 'use strict';
 const batch=30,states=new WeakMap();let scheduled=false;
 const grids='.lr-home-country-grid,.ep-journey-grid,.ep-city-grid,.ep-stations';
 const cardSelector='.lr-country-card,.destination-city,.ep-city-card,.ep-station';
 const visibility=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;const state=entry.target._lrState;if(state&&state.limit<state.cards.length){state.limit=Math.min(state.cards.length,state.limit+batch);state.paint();}}},{rootMargin:'400px 0px'});
 function update(grid){
  if(grid.id==='route-card-grid')return;
  const cards=[...grid.children].filter(c=>c.matches(cardSelector));
  let state=states.get(grid);
  if(!state){state={cards:[],limit:batch,controls:null};states.set(grid,state)}
  const changed=cards.length!==state.cards.length||cards.some((c,i)=>c!==state.cards[i]);
  if(changed){state.cards=cards;state.limit=batch}
  if(cards.length<=batch){if(state.controls){visibility.unobserve(state.controls);state.controls.remove();state.controls=null}cards.forEach(c=>{c.hidden=false;c.removeAttribute('data-lr-card-hidden')});return}
  if(!state.controls){
   const status=document.createElement('div');status.className='lr-card-pagination lr-card-page-count';status.setAttribute('role','status');status.setAttribute('aria-live','polite');status._lrState=state;grid.after(status);state.controls=status;visibility.observe(status);
  }else if(state.controls.previousElementSibling!==grid){grid.after(state.controls)}
  state.paint=()=>{state.cards.forEach((c,i)=>{c.hidden=i>=state.limit;c.toggleAttribute('data-lr-card-hidden',i>=state.limit)});const done=state.limit>=state.cards.length;const label=done?`Showing all ${state.cards.length}`:`Showing ${state.limit} of ${state.cards.length} · More load as you scroll`;if(state.controls.textContent!==label)state.controls.textContent=label;if(done)visibility.unobserve(state.controls)};
  state.paint();
  if(changed&&state.limit<cards.length){visibility.unobserve(state.controls);visibility.observe(state.controls)}
 }
 const owned=new WeakMap();
 const ownedVisibility=new IntersectionObserver(entries=>{for(const e of entries){if(e.isIntersecting&&!e.target._button.hidden)e.target._button.click()}},{rootMargin:'400px 0px'});
 function updateOwned(button){
  let marker=owned.get(button);
  if(!marker){marker=document.createElement('div');marker.className='lr-auto-page-sentinel';marker.style.height='1px';marker.setAttribute('aria-hidden','true');marker._button=button;button.after(marker);button.style.display='none';owned.set(button,marker);ownedVisibility.observe(marker)}
  marker.hidden=button.hidden;
 }
 function scan(){scheduled=false;document.querySelectorAll(grids).forEach(update);document.querySelectorAll('#route-card-more,#station-directory-more,#destination-more').forEach(updateOwned)}
 const observer=new MutationObserver(()=>{if(!scheduled){scheduled=true;requestAnimationFrame(scan)}});observer.observe(document.body,{childList:true,subtree:true});window.LRRefreshCardPagination=scan;scan();
})();
