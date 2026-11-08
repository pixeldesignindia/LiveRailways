/* Shared classification: a luxury day excursion is not a sleeper. */
(() => {
 const categories = train => train.categories || (train.kind === 'luxury' ? ['luxury','sleeper'] : [train.kind || 'day']);
 const serviceCountries = (train, collection) => train.categoryCountries?.[collection] || train.countries;
 const matches = (train, collection, country) => {
  const tags=categories(train), served=serviceCountries(train,collection);
  const inCollection=collection==='all'

   || ['sleeper','luxury','scenic'].includes(collection) && tags.includes(collection)
   || ['city','regional'].includes(collection) && train.serviceTypes?.some(t=>['regional','city'].includes(t))
   || collection==='long-distance' && (train.serviceTypes?.includes('intercity') || tags.includes('sleeper')) && !tags.includes('luxury')
   || collection==='international' && train.countries.length>1
   || collection==='airport' && train.serviceTypes?.includes('airport');
  return Boolean(inCollection && (country==='all' || served.includes(country)));
 };
 window.LRTrainCollections={categories,serviceCountries,matches};
})();
