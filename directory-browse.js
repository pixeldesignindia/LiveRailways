(()=>{
 if(!document.body.hasAttribute('data-directory-layout'))return;
 function mount(){
 const main=document.querySelector('main.lr-home'),shell=document.querySelector('.lr-search-shell');
 const tabs=main?.querySelector('.lr-home-continent-tabs'),form=main?.querySelector('form.lr-home-country-filters');
 if(!shell||!tabs||!form)return false;
 const box=document.createElement('div');box.className='lr-directory-hero-filters';box.setAttribute('aria-label','Browse directory');
 box.append(tabs,form);shell.append(box);document.querySelector('.lr-banner').setAttribute('aria-label','Railway scenery and directory filters');
 return true;
 }
 if(!mount()){const observer=new MutationObserver(()=>{if(mount())observer.disconnect()});observer.observe(document.body,{childList:true,subtree:true})}
})();
