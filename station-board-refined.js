(()=>{'use strict';
// One compact station-board renderer; the legacy journey-progress board is retired.
function mount(options={}){
 const q=options.params||new URLSearchParams(location.search);
 if(!options.embedded){document.querySelector('.workspace')?.setAttribute('hidden','');document.body.classList.add('status-board-page');}
 const station=(q.get('station')||'Amsterdam Centraal').toLowerCase();
 if(station==='amsterdam centraal'&&window.LRAmsterdamBoard)return window.LRAmsterdamBoard.mount(options);
 return window.LRDirectoryStation.mount(options);
}
window.LRStationBoard={mount};if(!window.LR_SKIP_STATION_BOARD_AUTO)mount();
})();
