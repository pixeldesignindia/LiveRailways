/* Shared, accessible detail interactions for every station board. */
(()=>{'use strict';
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
function setup(){document.querySelectorAll('.ab-service').forEach(row=>{
 if(row.dataset.detailNavigation||row.querySelector('.lr-approved-detail'))return;row.dataset.detailNavigation='1';
 const panel=row.querySelector('.ab-detail'),summary=row.querySelector('summary');if(!panel||!summary)return;
 const back=document.createElement('button');back.type='button';back.className='lr-detail-back';back.textContent='← Back to station board';panel.prepend(back);
 let animation;
 function close(){if(!row.open)return;animation?.cancel();const finish=()=>{row.open=false;summary.focus({preventScroll:true});summary.scrollIntoView({block:'nearest',behavior:reduced()?'instant':'smooth'})};if(reduced())finish();else {animation=panel.animate([{opacity:1},{opacity:0,transform:'translateY(-4px)'}],{duration:140,easing:'ease-out'});animation.onfinish=finish;}}
 back.addEventListener('click',close);row.addEventListener('keydown',e=>{if(e.key==='Escape'&&row.open){e.preventDefault();close()}});
 row.addEventListener('toggle',()=>{if(row.open&&!reduced()){animation?.cancel();animation=panel.animate([{opacity:0,transform:'translateY(-6px)'},{opacity:1,transform:'translateY(0)'}],{duration:200,easing:'ease-out'})}});
});}
setup();new MutationObserver(setup).observe(document.body,{childList:true,subtree:true});
})();
