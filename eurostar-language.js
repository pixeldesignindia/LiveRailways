(() => {
 const supported=['en','fr','de','nl','es','it','ar','hi'];
 const countryLanguages={GB:['en'],IE:['en'],US:['en'],AU:['en'],NZ:['en'],FR:['fr'],BE:['nl','fr','de'],NL:['nl'],DE:['de'],AT:['de'],CH:['de','fr','it'],LU:['fr','de'],ES:['es'],MX:['es'],AR:['es'],CO:['es'],CL:['es'],PE:['es'],IT:['it'],SM:['it'],VA:['it'],CA:['en','fr'],IN:['hi','en'],AE:['ar'],SA:['ar'],QA:['ar'],KW:['ar'],BH:['ar'],OM:['ar'],EG:['ar'],JO:['ar'],LB:['ar'],IQ:['ar'],YE:['ar'],MA:['ar'],DZ:['ar'],TN:['ar']};
 const base=value=>String(value||'').toLowerCase().split('-')[0];
 function choose(country,browserLanguages=[],saved='',url=''){
  if(supported.includes(url))return url;
  if(supported.includes(saved))return saved;
  const preferences=browserLanguages.map(base).filter(l=>supported.includes(l));
  const local=countryLanguages[String(country||'').toUpperCase()];
  return local?(preferences.find(l=>local.includes(l))||local[0]):preferences[0]||'en';
 }
 window.LRLocalePolicy={supported,choose};
})();
