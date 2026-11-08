'use strict';
const FR_COLOURS=[null,'#287cb5','#c98c25','#199b87','#d35e64','#8b66b6','#819539','#515ca4','#b67e56'];
let frData,frEdges=[],frDegrees={},frSelected='all',frGroup=null,frZoom=d3.zoomIdentity;
const frStage=document.getElementById('map-stage'),frSvg=d3.select('#rail-map'),frSelect=document.getElementById('route-select'),frTip=document.getElementById('map-tooltip');
const frKey=(a,b)=>[a,b].sort().join('|');
function frPath(a,b){
 const dist={[a]:0},prev={},todo=new Set(Object.keys(frDegrees));
 while(todo.size){const here=[...todo].sort((x,y)=>(dist[x]??Infinity)-(dist[y]??Infinity))[0];if(!Number.isFinite(dist[here]))break;todo.delete(here);if(here===b)break;
  frEdges.filter(e=>e.a===here||e.b===here).forEach(e=>{const next=e.a===here?e.b:e.a;if(!todo.has(next))return;const cost=d3.geoDistance(frData.cities[here],frData.cities[next]);if(dist[here]+cost<(dist[next]??Infinity)){dist[next]=dist[here]+cost;prev[next]=here;}});
 }
 if(!Number.isFinite(dist[b]))return [a,b];const path=[b];while(path[0]!==a)path.unshift(prev[path[0]]);return path;
}
function frRoute(){return frData.routes.find(r=>r.id===frSelected);}
function frPanel(){
 const r=frRoute(),path=r?frPath(r.a,r.b):[],groups=r?[...new Set(path.slice(1).map((n,i)=>frEdges.find(e=>e.key===frKey(n,path[i]))?.group).filter(Boolean))]:frGroup?[frGroup]:[1,2,3,4,5,6,7,8];
 document.getElementById('route-title').textContent=r?r.a+' ↔ '+r.b:frGroup?frData.groups[frGroup]:'France’s main connections';
 document.getElementById('route-km').textContent=r?'≈ '+r.km.toLocaleString()+' km':frGroup?'Group '+frGroup:'39 routes';
 document.querySelector('.route-distance small').textContent=r?r.distanceKind.toUpperCase():'SELECTED ROUTES IN THE DIRECTORY';
 const sequence=document.getElementById('group-sequence');sequence.replaceChildren();groups.forEach((g,i)=>{if(r&&i){let arrow=document.createElement('span');arrow.className='sequence-arrow';arrow.textContent='→';sequence.append(arrow);}let chip=document.createElement('span');chip.className='group-chip';chip.style.background=FR_COLOURS[g];chip.textContent=g;sequence.append(chip);});
 document.querySelector('.route-group-label').textContent=r?'MAP CORRIDOR GROUPS':'COLOUR KEY';document.querySelector('.route-stops-label').textContent=r?'MAP CONNECTION CHAIN':'MAIN CONNECTION POINTS';
 const list=document.getElementById('route-stops');list.replaceChildren();const points=r?path:frGroup?[...new Set(frData.network.filter(x=>x[0]===frGroup).flatMap(x=>x[1]))]:['Paris','Lille','Strasbourg','Lyon','Marseille','Bordeaux','Rennes','Toulouse'];
 points.forEach(n=>{const li=document.createElement('li');li.textContent=n;li.style.setProperty('--stop-color',FR_COLOURS[frGroup||6]);list.append(li);});list.classList.toggle('network-summary',!r);
 const note=document.querySelector('.route-disclaimer');note.replaceChildren();
 if(r){const time=document.createElement('p');time.textContent='From '+Math.floor(r.minutes/60)+'h '+String(r.minutes%60).padStart(2,'0')+'m · indicative journey time';note.append(time);const ops=document.createElement('p');ops.textContent=r.operators.join(' · ');ops.style.marginTop='10px';note.append(ops);const link=document.createElement('a');link.href=r.url;link.textContent='Route details & operator sources ↗';link.style.display='block';link.style.marginTop='12px';note.append(link);const disclaimer=document.createElement('p');disclaimer.textContent='Map connection points are illustrative, not a train’s stopping pattern. Published city-pair distances are not certified track mileage.';disclaimer.style.marginTop='12px';note.append(disclaimer);}else note.textContent='Choose a route to see its distance, indicative journey time and operators. Coloured links are planning groups, not official operating zones.';
 document.querySelectorAll('.corridor-button').forEach(b=>{const yes=+b.dataset.group===frGroup;b.classList.toggle('active',yes);b.setAttribute('aria-pressed',String(yes));});
}
function frDraw(){
 if(!frData)return;const w=frStage.clientWidth,h=Math.max(w<420?430:470,Math.min(700,w*.85));frSvg.attr('viewBox',`0 0 ${w} ${h}`).attr('width',w).attr('height',h);frSvg.selectAll('*').remove();
 frSvg.append('title').text('France main railway connections: eight coloured planning groups');frSvg.append('desc').text('Selected mainland France connections, with international route examples. Geographic locations, simplified links; not exact track geometry.');
 frSvg.append('defs').append('clipPath').attr('id','france-map-bounds').append('rect').attr('width',w).attr('height',h);
 const layer=frSvg.append('g').attr('clip-path','url(#france-map-bounds)').append('g'),r=frRoute(),path=r?frPath(r.a,r.b):[],selectedKeys=new Set(path.slice(1).map((n,i)=>frKey(n,path[i])));
 const bounds=[[-5.2,42],[8.35,51.55]];if(r)bounds.push(frData.cities[r.a],frData.cities[r.b]);
 const projection=d3.geoMercator().fitExtent([[22,25],[w-22,h-25]],{type:'MultiPoint',coordinates:bounds});const geo=d3.geoPath(projection);
 layer.selectAll('path.land').data(frData.geography.features).join('path').attr('class','land').attr('d',geo).attr('fill',d=>d.properties.name==='France'?'#f2f4ef':'#f9faf7').attr('stroke','#e1e6df').attr('stroke-width',1);
 const active=e=>frGroup?e.group===frGroup:!r||selectedKeys.has(e.key),line=d3.line().x(p=>p[0]).y(p=>p[1]);
 layer.selectAll('path.rail-link').data(frEdges).join('path').attr('class','rail-link').attr('d',e=>line([projection(frData.cities[e.a]),projection(frData.cities[e.b])])).attr('stroke',e=>FR_COLOURS[e.group]).attr('stroke-width',e=>active(e)?(r||frGroup?4.5:3):1.5).attr('opacity',e=>active(e)?1:.18);
 if(r&&path.length===2&&!frEdges.some(e=>e.key===frKey(r.a,r.b)))layer.append('path').attr('class','rail-link map-international').attr('d',line(path.map(n=>projection(frData.cities[n])))).attr('stroke','#586c8c').attr('stroke-width',3.5);
 const places=new Set(Object.keys(frDegrees));if(r){places.add(r.a);places.add(r.b);}const selectedPlaces=r?new Set(path):frGroup?new Set(frEdges.filter(active).flatMap(e=>[e.a,e.b])):places;
 for(const n of places){const p=projection(frData.cities[n]);layer.append('circle').attr('cx',p[0]).attr('cy',p[1]).attr('r',n==='Paris'?6:frDegrees[n]>2?4:2.8).attr('fill',n==='Paris'?'#142c3b':frDegrees[n]>2?'#fff':FR_COLOURS[frEdges.find(e=>e.a===n||e.b===n)?.group||6]).attr('stroke','#637b85').attr('stroke-width',1.1).attr('opacity',selectedPlaces.has(n)?1:.3);}
 const major=['Paris','Lyon','Marseille','Bordeaux','Toulouse','Strasbourg','Lille','Rennes','Nantes','Nice','Brest','Caen','Rouen','Limoges','Clermont-Ferrand','Montpellier','London','Brussels','Geneva','Zurich'];
 const labelNames=[...places].filter(n=>w>550||major.includes(n)||r&&path.includes(n));labelNames.sort((a,b)=>(major.includes(a)?major.indexOf(a):99)-(major.includes(b)?major.indexOf(b):99));
 const boxes=[],nodes=[...places].map(n=>({n,p:projection(frData.cities[n])}));
 for(const n of labelNames){const [x,y]=projection(frData.cities[n]),text=layer.append('text').attr('class','map-label'+(n==='Paris'?' hub':'')).text(n);const tw=text.node().getComputedTextLength();let fit;
  for(const [dx,dy] of [[9,-10],[-9,-10],[9,18],[-9,18],[0,-23],[0,29],[18,0],[-18,0],[0,-35],[0,41]]){const anchor=dx>3?'start':dx< -3?'end':'middle',tx=x+dx,ty=y+dy,left=anchor==='end'?tx-tw:anchor==='middle'?tx-tw/2:tx,b={l:left-2,r:left+tw+2,t:ty-11,b:ty+3};if(b.l<5||b.r>w-5||b.t<4||b.b>h-25||boxes.some(z=>b.l<z.r&&b.r>z.l&&b.t<z.b&&b.b>z.t)||nodes.some(z=>z.n!==n&&z.p[0]>b.l-2&&z.p[0]<b.r+2&&z.p[1]>b.t-2&&z.p[1]<b.b+2))continue;fit={tx,ty,anchor,b,dx,dy};break;}
  if(!fit){text.remove();continue;}boxes.push(fit.b);text.attr('x',fit.tx).attr('y',fit.ty).attr('text-anchor',fit.anchor).attr('opacity',selectedPlaces.has(n)?1:.4);if(Math.abs(fit.dy)>21||Math.abs(fit.dx)>15)layer.insert('path','.map-label').attr('class','label-leader').attr('d',`M${x},${y}L${fit.tx},${fit.ty-4}`);
 }
 [['ATLANTIC',[-3.8,45.8]],['MEDITERRANEAN',[5.7,42.35]],['GERMANY',[7,50.5]]].forEach(([n,c])=>{let p=projection(c);layer.append('text').attr('class','map-country-label').attr('x',p[0]).attr('y',p[1]).attr('text-anchor','middle').text(n);});
 const zoom=d3.zoom().scaleExtent([1,5]).extent([[0,0],[w,h]]).translateExtent([[-w,-h],[2*w,2*h]]).on('zoom',e=>{layer.attr('transform',e.transform);frZoom=e.transform;});frSvg.call(zoom).call(zoom.transform,frZoom);
 document.getElementById('zoom-in').onclick=()=>frSvg.transition().duration(180).call(zoom.scaleBy,1.4);document.getElementById('zoom-out').onclick=()=>frSvg.transition().duration(180).call(zoom.scaleBy,1/1.4);document.getElementById('reset-map').onclick=()=>frSvg.transition().duration(180).call(zoom.transform,d3.zoomIdentity);
 document.getElementById('map-instruction').textContent=r?r.a+' ↔ '+r.b:frGroup?frData.groups[frGroup]:'Select a coloured corridor or choose a route';
}
fetch('france-map-data.json').then(r=>{if(!r.ok)throw Error('France map unavailable');return r.json();}).then(d=>{
 frData=d;const seen=new Set();for(const [group,path]of d.network)path.slice(1).forEach((b,i)=>{const a=path[i],key=frKey(a,b);if(!seen.has(key)){seen.add(key);frEdges.push({a,b,key,group});frDegrees[a]=(frDegrees[a]||0)+1;frDegrees[b]=(frDegrees[b]||0)+1;}});
 document.querySelector('#country-stamp>span').textContent='FR';document.querySelector('#country-stamp small').textContent='FRANCE';document.getElementById('map-meta').textContent='8 planning groups · 39 selected routes';
 frSelect.replaceChildren();const all=document.createElement('option');all.value='all';all.textContent='All France connections';frSelect.append(all);d.routes.sort((a,b)=>(a.a+' '+a.b).localeCompare(b.a+' '+b.b)).forEach(r=>{const o=document.createElement('option');o.value=r.id;o.textContent=r.a+' ↔ '+r.b;frSelect.append(o);});
 frSelect.onchange=()=>{frSelected=frSelect.value;frGroup=null;frZoom=d3.zoomIdentity;frPanel();frDraw();};
 const legend=document.getElementById('corridor-legend');for(let g=1;g<=8;g++){const b=document.createElement('button');b.className='corridor-button';b.dataset.group=g;b.setAttribute('aria-pressed','false');b.innerHTML=`<span class="swatch" style="background:${FR_COLOURS[g]}"></span><span class="num">${g}</span><span>${d.groups[g]}</span>`;b.onclick=()=>{frGroup=frGroup===g?null:g;frSelected='all';frSelect.value='all';frZoom=d3.zoomIdentity;frPanel();frDraw();};legend.append(b);}
 document.getElementById('show-all').onclick=()=>{frGroup=null;frSelected='all';frSelect.value='all';frZoom=d3.zoomIdentity;frPanel();frDraw();};new ResizeObserver(()=>{frZoom=d3.zoomIdentity;frDraw();}).observe(frStage);frPanel();frDraw();
}).catch(e=>{console.error(e);document.getElementById('load-error').hidden=false;});
