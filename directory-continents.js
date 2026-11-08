(()=>{
 'use strict';
 const zones=[['north','Northern Europe',['uk','ie','dk','no','se','fi','ee','lv','lt']],['west','Western Europe',['fr','nl','be','lu']],['central','Central Europe',['de','ch','at','cz','pl','hu','sk','si']],['south','Southern Europe',['es','it','pt','gr','tr','hr','ba','me','mk','rs','xk']],['east','Eastern Europe',['ro','bg','md','by','ru','ua']],['caucasus','Caucasus',['am','az','ge']]];
 const regions=[['asia-pacific','Asia Pacific'],['africa','Africa'],['europe','Europe'],['americas','Americas']];
 window.LRDirectoryContinents=({form,id,onChange,enabledContinents=['europe'],zonesByContinent={}})=>{
  let selected='europe';
  const currentZones=()=>zonesByContinent[selected]||(selected==='europe'?zones:[]);
  form.className='lr-home-country-filters lr-directory-shared-filters';
  const country=form.querySelector('select[id*=country]');
  const zoneLabel=document.createElement('label');zoneLabel.textContent='Europe zone';const zone=document.createElement('select');zone.id=id+'-zone';zone.setAttribute('aria-label','Europe zone');zone.innerHTML='<option value="all">All zones</option>'+zones.map(([key,name])=>'<option value="'+key+'">'+name+'</option>').join('');zoneLabel.append(zone);form.prepend(zoneLabel);if(country)zoneLabel.after(country.closest('label'));
  function updateOptions(){if(!country)return;[...country.options].forEach((option,i)=>{const visible=i===0||zone.value==='all'||(currentZones().find(z=>z[0]===zone.value)?.[2]||[]).includes(option.value);option.hidden=!visible;option.disabled=!visible});if(country.selectedOptions[0]?.hidden)country.value='all'}
  zone.onchange=()=>{updateOptions();form.dispatchEvent(new Event('lr:regionchange'))};
  form.addEventListener('reset',()=>{zone.value='all';updateOptions()});
  const tabs=document.createElement('div');tabs.className='lr-home-continent-tabs';tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','Choose '+id+' continent');
  tabs.innerHTML=regions.map(([key,label])=>`<button type="button" role="tab" id="${id}-continent-${key}" data-continent="${key}" aria-controls="${id}-continent-panel" aria-selected="${key===selected}" tabindex="${key===selected?0:-1}">${label}</button>`).join('');
  const panel=document.createElement('section');panel.id=id+'-continent-panel';panel.className='lr-directory-continent-panel';panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby',id+'-continent-europe');
  form.before(tabs,panel);panel.append(form);
  const buttons=[...tabs.querySelectorAll('button')];
  function choose(key,focus=false){selected=key;zoneLabel.firstChild.textContent=key==='europe'?'Europe zone':key==='asia-pacific'?'Asia Pacific zone':'Zone';zone.setAttribute('aria-label',zoneLabel.firstChild.textContent);zone.innerHTML='<option value="all">All zones</option>'+currentZones().map(([key,name])=>'<option value="'+key+'">'+name+'</option>').join('');zone.value='all';if(country)country.value='all';updateOptions();buttons.forEach(b=>{b.setAttribute('aria-selected',String(b.dataset.continent===key));b.tabIndex=b.dataset.continent===key?0:-1});panel.setAttribute('aria-labelledby',id+'-continent-'+key);form.querySelectorAll('input,select,button').forEach(el=>el.disabled=!enabledContinents.includes(key));onChange(key,regions.find(r=>r[0]===key)[1]);if(focus)buttons.find(b=>b.dataset.continent===key).focus()}
  buttons.forEach((b,i)=>{b.onclick=()=>choose(b.dataset.continent);b.onkeydown=e=>{let index=e.key==='ArrowRight'?(i+1)%4:e.key==='ArrowLeft'?(i+3)%4:e.key==='Home'?0:e.key==='End'?3:-1;if(index>=0){e.preventDefault();choose(buttons[index].dataset.continent,true)}}});
  return {select:choose,get continent(){return selected},get zone(){return zone.value},matchesCountry(codes){return enabledContinents.includes(selected)&&(zone.value==='all'||codes.some(code=>(currentZones().find(z=>z[0]===zone.value)?.[2]||[]).includes(code)))}};
 };
})();
