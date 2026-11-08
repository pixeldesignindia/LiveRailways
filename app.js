'use strict';
const GROUPS=[null,'Northeast','East','Southeast & Mediterranean','South / Andalusia','Northwest / Galicia','North / shared approach','Northern & Ebro','West / Extremadura'];
const COLOURS=[null,'#287cb5','#c98c25','#199b87','#d35e64','#8b66b6','#819539','#515ca4','#b67e56'];
const NETWORK=[
 [1,['Madrid','Zaragoza','Lleida','Tarragona','Barcelona','Figueres']],
 [2,['Madrid','Cuenca','Albacete','Villena','Alicante']],
 [2,['Cuenca','Valencia']],
 [3,['Barcelona','Tarragona','Castellón','Valencia','Alicante','Elche','Murcia']],
 [3,['Villena','Elche']],
 [4,['Madrid','Ciudad Real','Córdoba','Seville','Cádiz']],
 [4,['Córdoba','Málaga']], [4,['Córdoba','Granada']],
 [6,['Madrid','Segovia','Olmedo','Valladolid','Palencia','León','Oviedo','Gijón']],
 [6,['Palencia','Santander']],
 [5,['Olmedo','Zamora','Ourense','Santiago','A Coruña']], [5,['Santiago','Vigo']],
 [5,['León','Ponferrada','Monforte','Ourense','Vigo']],
 [7,['Palencia','Burgos','Miranda','Bilbao']], [7,['Miranda','Vitoria','San Sebastián']],
 [7,['Zaragoza','Pamplona','Vitoria']], [7,['Zaragoza','Logroño','Miranda']],
 [8,['Madrid','Cáceres','Mérida','Badajoz']]
];
const JOURNEYS={
 all:{label:'All Spain connections',title:'One connected network',km:'8 groups',groups:[1,2,3,4,5,6,7,8],stops:['Madrid','Barcelona','Valencia','Seville','Bilbao','Vigo']},
 bcnvigo:{label:'Barcelona ↔ Vigo',km:'≈ 1,350 km',groups:[1,7,6,5],stops:['Barcelona','Tarragona','Lleida','Zaragoza','Pamplona','Vitoria','Miranda','Burgos','Palencia','León','Ponferrada','Monforte','Ourense','Vigo']},
 madridbarcelona:{label:'Madrid ↔ Barcelona',km:'≈ 620 km',groups:[1],stops:['Madrid','Zaragoza','Lleida','Tarragona','Barcelona']},
 madridmurcia:{label:'Madrid ↔ Murcia',km:'≈ 530 km',groups:[2,3],stops:['Madrid','Cuenca','Albacete','Villena','Elche','Murcia']},
 madridcoruna:{label:'Madrid ↔ A Coruña',km:'≈ 620 km',groups:[6,5],stops:['Madrid','Segovia','Olmedo','Zamora','Ourense','Santiago','A Coruña']},
 madridvigo:{label:'Madrid ↔ Vigo · via Santiago',km:'≈ 650 km',groups:[6,5],stops:['Madrid','Segovia','Olmedo','Zamora','Ourense','Santiago','Vigo']},
 madridbilbao:{label:'Madrid ↔ Bilbao',km:'≈ 480 km',groups:[6,7],stops:['Madrid','Segovia','Olmedo','Valladolid','Palencia','Burgos','Miranda','Bilbao']},
 madridsanseb:{label:'Madrid ↔ San Sebastián',km:'≈ 570 km',groups:[6,7],stops:['Madrid','Segovia','Olmedo','Valladolid','Palencia','Burgos','Miranda','Vitoria','San Sebastián']},
 madridmalaga:{label:'Madrid ↔ Málaga',km:'≈ 515 km',groups:[4],stops:['Madrid','Ciudad Real','Córdoba','Málaga']},
 madridseville:{label:'Madrid ↔ Seville',km:'≈ 470 km',groups:[4],stops:['Madrid','Ciudad Real','Córdoba','Seville']},
 madridbadajoz:{label:'Madrid ↔ Badajoz',km:'≈ 460 km',groups:[8],stops:['Madrid','Cáceres','Mérida','Badajoz']}
};
const displayName=n=>({'Santiago':'Santiago de Compostela','Monforte':'Monforte de Lemos','Miranda':'Miranda de Ebro','Figueres':'Figueres-Vilafant'}[n]||n);
const edgeKey=(a,b)=>[a,b].sort().join('|');
let data,edges=[],degrees={},view=location.hash==='#europe'?'europe':'spain',journey='all',selectedGroup=null,zoomState=d3.zoomIdentity;
const svg=d3.select('#rail-map'),stage=document.getElementById('map-stage'),select=document.getElementById('route-select'),tooltip=document.getElementById('map-tooltip');
Object.entries(JOURNEYS).forEach(([key,item])=>{const option=document.createElement('option');option.value=key;option.textContent=item.label;select.append(option);});
for(let g=1;g<=8;g++){
 const button=document.createElement('button');button.className='corridor-button';button.dataset.group=g;button.setAttribute('aria-pressed','false');button.innerHTML=`<span class="swatch" style="background:${COLOURS[g]}"></span><span class="num">${g}</span><span>${GROUPS[g]}</span>`;
 button.onclick=()=>{selectedGroup=selectedGroup===g?null:g;journey='all';select.value='all';zoomState=d3.zoomIdentity;updateRoutePanel();draw();};document.getElementById('corridor-legend').append(button);
}
select.onchange=()=>{journey=select.value;selectedGroup=null;zoomState=d3.zoomIdentity;updateRoutePanel();draw();};
document.getElementById('show-all').onclick=()=>{journey='all';selectedGroup=null;select.value='all';zoomState=d3.zoomIdentity;updateRoutePanel();draw();};
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>setView(b.dataset.view));
document.querySelector('.brand').onclick=()=>setView('spain');
function setView(next){view=next;location.hash=next;zoomState=d3.zoomIdentity;draw();}
window.addEventListener('hashchange',()=>{view=location.hash==='#europe'?'europe':'spain';zoomState=d3.zoomIdentity;draw();});
function updateRoutePanel(){
 const r=JOURNEYS[journey],all=journey==='all';
 document.getElementById('route-title').textContent=selectedGroup?`${selectedGroup}. ${GROUPS[selectedGroup]}`:r.title||r.label;
 document.getElementById('route-km').textContent=selectedGroup?'Group '+selectedGroup:r.km;
 document.querySelector('.route-distance small').textContent=all?'PLANNING CORRIDOR GROUPS':'APPROXIMATE RAIL DISTANCE';
 document.querySelector('.route-group-label').textContent=all?'COLOUR KEY':'PLANNING GROUPS SHARED';
 const sequence=document.getElementById('group-sequence');sequence.replaceChildren();
 (selectedGroup?[selectedGroup]:r.groups).forEach((g,i)=>{if(i&&!all){let arrow=document.createElement('span');arrow.className='sequence-arrow';arrow.textContent='→';sequence.append(arrow);}let chip=document.createElement('span');chip.className='group-chip';chip.style.background=COLOURS[g];chip.textContent=g;chip.title=GROUPS[g];sequence.append(chip);});
 document.querySelector('.route-stops-label').textContent=all?(selectedGroup?'SELECTED LOCATIONS':'MAJOR HUBS'):'MAIN LOCATIONS';
 const stops=selectedGroup?[...new Set(NETWORK.filter(r=>r[0]===selectedGroup).flatMap(r=>r[1]))]:r.stops;
 const list=document.getElementById('route-stops');list.replaceChildren();list.classList.toggle('network-summary',all);
 stops.forEach((stop,i)=>{let item=document.createElement('li');item.textContent=displayName(stop);const edge=edges.find(e=>e.key===edgeKey(stop,stops[i+1]||stops[i-1]));item.style.setProperty('--stop-color',COLOURS[selectedGroup||edge?.group||r.groups[0]]);list.append(item);});
 document.querySelector('.route-disclaimer').textContent=all?'Choose a journey to trace its route and see which planning groups it shares. These groups organise this atlas; they are not official Renfe zones.':'Selected locations, not every stop. Service routing and stopping patterns vary. Distances are rounded planning estimates, not verified train-specific mileages.';
 document.querySelectorAll('.corridor-button').forEach(b=>{let yes=+b.dataset.group===selectedGroup;b.classList.toggle('active',yes);b.setAttribute('aria-pressed',String(yes));});
}
function showTip(event,text){tooltip.textContent=text;tooltip.hidden=false;const rect=stage.getBoundingClientRect();tooltip.style.left=Math.max(8,Math.min(event.clientX-rect.left+12,rect.width-235))+'px';tooltip.style.top=Math.max(8,event.clientY-rect.top-42)+'px';}
function draw(){
 if(!stage.clientWidth)return;
 if(!data)return;
 const overview=view==='europe';document.body.classList.toggle('europe-view',overview);
 document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===view));
 document.getElementById('breadcrumb').textContent=overview?'EUROPE / NETWORK ATLAS':'EUROPE / SPAIN';
 document.getElementById('page-title').textContent=overview?'Europe, one journey at a time.':'Spain, connected.';
 document.getElementById('page-subtitle').textContent=overview?'Explore 51 country editions, including rail status pages, Caucasus and transcontinental networks.':'Explore the main railway corridors, from Madrid to the coast.';
 document.querySelector('#country-stamp>span').textContent=overview?'EU':'ES';document.querySelector('#country-stamp small').textContent=overview?'51 COUNTRIES':'SPAIN';
 document.getElementById('map-caption').innerHTML='<i class="status-dot"></i> '+(overview?'EUROPE OVERVIEW':'MAINLAND RAIL NETWORK');
 document.getElementById('map-meta').textContent=overview?'51 country editions':'8 groups · selected connections';
 document.getElementById('map-instruction').textContent=overview?'Select a highlighted country to open its railway map':selectedGroup?`Group ${selectedGroup} · ${GROUPS[selectedGroup]}`:journey==='all'?'Select a corridor or route to explore':JOURNEYS[journey].label;
 document.querySelector('.under-map>div:first-child p').textContent=overview?'Choose a highlighted country to open its map and route directory. Country editions show selected corridors or an explicit passenger rail status; these are independent atlas groups, not official operating zones.':'Colours organise the network into our eight planning groups. A journey can share tracks with several groups; these are not official Renfe operating zones.';
 const w=stage.clientWidth,h=overview?Math.max(430,Math.min(860,w*.82)):Math.max(w<420?410:450,Math.min(660,w*.82));
 svg.attr('viewBox',`0 0 ${w} ${h}`).attr('width',w).attr('height',h);svg.selectAll('*').remove();tooltip.hidden=true;
 svg.append('title').text(overview?'Europe railway atlas: 51 country maps available':'Spain railway connections: eight planning corridor groups');
 svg.append('desc').text('Geographic locations with simplified rail connections. Selected mainland long-distance links, not exact railway alignments or live service information.');
 svg.append('defs').append('clipPath').attr('id','map-bounds').append('rect').attr('width',w).attr('height',h);
 const viewport=svg.append('g').attr('clip-path','url(#map-bounds)'),layer=viewport.append('g');
 const projection=d3.geoMercator().fitExtent([[20,25],[w-20,h-25]],{type:'MultiPoint',coordinates:overview?[[-25,34],[56,71.5]]:[[-9.6,35.7],[3.8,43.9]]});
 const path=d3.geoPath(projection);
 if(overview){
  const lookup=d=>window.ATLAS_COUNTRIES.find(c=>c.geographyName===d.properties.name);
  layer.selectAll('path').data(data.europe.features).join('path').attr('class','overview-country').attr('d',path).attr('fill',d=>lookup(d)?'#b7c8a4':'#e7edeb').style('cursor',d=>lookup(d)?'pointer':'default').attr('tabindex',d=>lookup(d)?0:null).attr('role',d=>lookup(d)?'link':null).attr('aria-label',d=>lookup(d)?lookup(d).name+' railway map':d.properties.name).on('click',(_,d)=>{const c=lookup(d);if(c)location.href=c.map;}).on('keydown',(e,d)=>{if(e.key==='Enter'&&lookup(d))location.href=lookup(d).map;}).on('mousemove',(e,d)=>showTip(e,lookup(d)?lookup(d).name+' · open country map':d.properties.name)).on('mouseleave',()=>tooltip.hidden=true);
  const countries=[['SPAIN',[-3.7,40.3]],['PORTUGAL',[-8.2,39.4]],['FRANCE',[2.5,46.5]],['ITALY',[12.5,42.8]],['GERMANY',[10.4,51]],['UNITED KINGDOM',[-2,54]],['POLAND',[19,52]],['NORWAY',[9,61]],['SWEDEN',[16,63]],['FINLAND',[26.5,64.5]],['AUSTRIA',[14,47.5]],['NETHERLANDS',[5.4,52.4]],['BELGIUM',[4.6,50.2]],['SWITZERLAND',[8.3,46.6]],['IRELAND',[-8,53.2]],['DENMARK',[9.8,56.2]],['HUNGARY',[19.3,47.15]],['ROMANIA',[25,46]],['BULGARIA',[25.3,42.8]],['ALBANIA',[19.7,41.6]],['GREECE',[23,38.5]],['TÜRKİYE',[35.4,39.3]]];
  countries.filter((_,i)=>w>500||[0,2,3,4,5,6].includes(i)).forEach(([name,c])=>{let xy=projection(c);layer.append('text').attr('class','overview-label').attr('x',xy[0]).attr('y',xy[1]).attr('text-anchor','middle').style('cursor',['SPAIN','FRANCE','GERMANY','UNITED KINGDOM','NETHERLANDS','BELGIUM','SWITZERLAND','ITALY','IRELAND','DENMARK','PORTUGAL','AUSTRIA','POLAND','HUNGARY','ROMANIA','BULGARIA','ALBANIA','GREECE','TÜRKİYE','NORWAY','SWEDEN','FINLAND'].includes(name)?'pointer':'default').text(name).on('click',()=>{if(name==='SPAIN')setView('spain');else if(name==='FRANCE')location.href='france.html';else if(name==='GERMANY')location.href='germany.html';else if(name==='UNITED KINGDOM')location.href='uk.html';else if(name==='NETHERLANDS')location.href='netherlands.html';else if(name==='BELGIUM')location.href='belgium.html';else if(name==='SWITZERLAND')location.href='switzerland.html';else if(name==='ITALY')location.href='italy.html';else if(name==='IRELAND')location.href='ireland.html';else if(name==='DENMARK')location.href='denmark.html';else if(name==='PORTUGAL')location.href='portugal.html';else if(name==='AUSTRIA')location.href='austria.html';else if(name==='POLAND')location.href='poland.html';else if(name==='HUNGARY')location.href='hungary.html';else if(name==='ROMANIA')location.href='romania.html';else if(name==='BULGARIA')location.href='bulgaria.html';else if(name==='ALBANIA')location.href='albania.html';else if(name==='GREECE')location.href='greece.html';else if(name==='TÜRKİYE')location.href='turkey.html';else if(name==='NORWAY')location.href='norway.html';else if(name==='SWEDEN')location.href='sweden.html';else if(name==='FINLAND')location.href='finland.html';});});
  const p=projection([-3.7,38.7]);layer.append('text').attr('class','overview-label').attr('x',p[0]).attr('y',p[1]).attr('text-anchor','middle').text('OPEN MAP ↗').style('cursor','pointer').on('click',()=>setView('spain'));
 }else{
  layer.selectAll('path.land').data(data.geography.features).join('path').attr('class','land').attr('d',path).attr('fill',d=>d.properties.name==='Spain'?'#f2f4ef':'#f9faf7').attr('stroke','#e2e7df').attr('stroke-width',1);
  const r=JOURNEYS[journey],routeEdges=new Set(r.stops.slice(1).map((v,i)=>edgeKey(v,r.stops[i])));
  const active=e=>selectedGroup?e.group===selectedGroup:journey==='all'||routeEdges.has(e.key);
  const line=d3.line().x(d=>d[0]).y(d=>d[1]);
  layer.selectAll('path.rail-link').data(edges).join('path').attr('class','rail-link').attr('d',e=>line([projection(data.cities[e.a]),projection(data.cities[e.b])])).attr('stroke',e=>COLOURS[e.group]).attr('stroke-width',e=>active(e)?(journey==='all'&&!selectedGroup?3:4.6):1.4).attr('opacity',e=>active(e)?1:.2).on('mousemove',(event,e)=>showTip(event,`${displayName(e.a)} ↔ ${displayName(e.b)} · Group ${e.group}`)).on('mouseleave',()=>tooltip.hidden=true);
  const selectedNodes=new Set(edges.filter(active).flatMap(e=>[e.a,e.b])),names=Object.keys(degrees);
  names.forEach(n=>{const p=projection(data.cities[n]),e=edges.find(e=>e.a===n||e.b===n),hub=n==='Madrid';layer.append('circle').attr('cx',p[0]).attr('cy',p[1]).attr('r',hub?6:degrees[n]>2?4:2.8).attr('fill',hub?'#142c3b':degrees[n]>2?'#fff':COLOURS[e.group]).attr('stroke',hub?'#142c3b':degrees[n]>2?'#536976':COLOURS[e.group]).attr('stroke-width',1.3).attr('opacity',selectedNodes.has(n)?1:.35).on('mousemove',event=>showTip(event,displayName(n))).on('mouseleave',()=>tooltip.hidden=true);});
  [['PORTUGAL',[-8.1,39.2]],['FRANCE',[.5,43.55]],['MEDITERRANEAN SEA',[1.3,38.5]]].forEach(([n,c])=>{let p=projection(c);layer.append('text').attr('class','map-country-label').attr('x',p[0]).attr('y',p[1]).attr('text-anchor','middle').text(n);});
  const main=['Madrid','Barcelona','Vigo','Valencia','Seville','Málaga','A Coruña','Bilbao','San Sebastián','Gijón','Santander','Murcia','Badajoz','Zaragoza','Granada','Cádiz','León','Burgos','Ourense','Valladolid'];
  let labelNames=names.filter(n=>w>540||main.includes(n)||((selectedGroup||journey!=='all')&&selectedNodes.has(n)));
  labelNames.sort((a,b)=>(main.includes(a)?main.indexOf(a):99)-(main.includes(b)?main.indexOf(b):99));
  const boxes=[],nodes=names.map(n=>({name:n,p:projection(data.cities[n])}));
  const preferred={'Madrid':[9,16],'Barcelona':[10,13],'Vigo':[-8,15],'A Coruña':[-8,-12],'Ourense':[0,20],'León':[0,-14],'Santander':[0,-14],'Gijón':[-8,-14],'Bilbao':[0,-13],'San Sebastián':[8,-14],'Burgos':[2,19],'Palencia':[-9,15],'Vitoria':[0,18],'Lleida':[0,-12],'Tarragona':[10,20],'Alicante':[9,0],'Murcia':[12,14],'Málaga':[0,18]};
  for(const n of labelNames){const [x,y]=projection(data.cities[n]);const text=layer.append('text').attr('class','map-label'+(n==='Madrid'?' hub':'')).text(n==='Miranda'?'Miranda de Ebro':n);const tw=text.node().getComputedTextLength(),opts=[preferred[n]||[9,-10],[9,-12],[-9,-12],[9,18],[-9,18],[0,-25],[0,30],[18,1],[-18,1],[0,-37],[0,42]];let fit;
   for(const [dx,dy] of opts){const anchor=dx>3?'start':dx< -3?'end':'middle',tx=x+dx,ty=y+dy,left=anchor==='end'?tx-tw:anchor==='middle'?tx-tw/2:tx,b={l:left-2,r:left+tw+2,t:ty-11,b:ty+3};if(b.l<5||b.r>w-5||b.t<5||b.b>h-25)continue;if(boxes.some(z=>b.l<z.r&&b.r>z.l&&b.t<z.b&&b.b>z.t))continue;if(nodes.some(z=>z.name!==n&&z.p[0]>b.l-2&&z.p[0]<b.r+2&&z.p[1]>b.t-2&&z.p[1]<b.b+2))continue;fit={tx,ty,anchor,b,dx,dy};break;}
   if(!fit){text.remove();continue;}boxes.push(fit.b);text.attr('x',fit.tx).attr('y',fit.ty).attr('text-anchor',fit.anchor).attr('opacity',selectedNodes.has(n)?1:.5);if(Math.abs(fit.dy)>21||Math.abs(fit.dx)>15)layer.insert('path','.map-label').attr('class','label-leader').attr('d',`M${x},${y}L${fit.tx},${fit.ty-4}`);
  }
 }
 const zoom=d3.zoom().scaleExtent([1,5]).extent([[0,0],[w,h]]).translateExtent([[-w,-h],[2*w,2*h]]).on('zoom',event=>{layer.attr('transform',event.transform);zoomState=event.transform;tooltip.hidden=true;});
 svg.call(zoom).call(zoom.transform,zoomState);
 document.getElementById('zoom-in').onclick=()=>svg.transition().duration(180).call(zoom.scaleBy,1.4);
 document.getElementById('zoom-out').onclick=()=>svg.transition().duration(180).call(zoom.scaleBy,1/1.4);
 document.getElementById('reset-map').onclick=()=>svg.transition().duration(180).call(zoom.transform,d3.zoomIdentity);
}
fetch('map-data.json').then(r=>{if(!r.ok)throw Error('Map data unavailable');return r.json();}).then(d=>{
 data=d;data.cities.Villena=[-.865,38.635];data.cities.Elche=[-.698,38.267];
 const seen=new Set();NETWORK.forEach(([group,stops])=>stops.slice(1).forEach((b,i)=>{const a=stops[i],key=edgeKey(a,b);if(!data.cities[a]||!data.cities[b])throw Error('Missing location');if(!seen.has(key)){seen.add(key);edges.push({a,b,key,group});degrees[a]=(degrees[a]||0)+1;degrees[b]=(degrees[b]||0)+1;}}));
 updateRoutePanel();new ResizeObserver(()=>{zoomState=d3.zoomIdentity;draw();}).observe(stage);draw();
}).catch(error=>{console.error(error);document.getElementById('load-error').hidden=false;});
