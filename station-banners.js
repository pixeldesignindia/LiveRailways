// Station-inspired AI ambience illustrations, not documentary photographs or wayfinding guides.
(()=>{
 const station=new URLSearchParams(location.search).get('station')||'Amsterdam Centraal';
 const entries=[
  {match:/london|st[ .-]*pancras|euston/i,key:'london',city:'London',scene:'Victorian train hall'},
  {match:/paris|gare du nord|paris nord/i,key:'paris',city:'Paris',scene:'High-speed platforms'},
  {match:/brussel|bruxelles|brussels|midi|zuid/i,key:'brussels',city:'Brussels',scene:'International platforms'},
  {match:/amsterdam/i,key:'amsterdam',city:'Amsterdam',scene:'Historic platform canopy'},
  {match:/rotterdam/i,key:'rotterdam',city:'Rotterdam',scene:'Modern station platforms'},
  {match:/antwerp|antwerpen/i,key:'antwerp',city:'Antwerp',scene:'Grand railway hall'},
  {match:/cologne|köln|koln/i,key:'cologne',city:'Cologne',scene:'Daylight platforms'},
  {match:/lille/i,key:'lille',city:'Lille',scene:'Modern high-speed station'}
 ];
 const entry=entries.find(e=>e.match.test(station));
 const scenes=entry?[entry]:[{key:'lille',city:'Station ambience',scene:'Modern platforms'}];
 window.LR_PROFILE_GALLERY=scenes.map(e=>['station-heroes/'+e.key+'-panorama.webp','AI-generated '+e.city+'-inspired station ambience illustration with trains and platforms',e.city+' · AI ILLUSTRATION','50% 50%',e.city,'AI illustration','50% 50%',e.key]);
 document.body.classList.add('lr-station-hero-view');
 document.addEventListener('DOMContentLoaded',()=>{
  const banner=document.querySelector('.lr-banner');if(!banner)return;
  banner.setAttribute('aria-label','Station ambience illustration and train search');
  const note=document.createElement('p');note.className='lr-station-image-note';note.textContent='AI-generated station ambience · Layouts, trains and platform details are illustrative.';banner.append(note);
 });
})();
