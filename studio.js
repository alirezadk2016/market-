/* Featured catalogue pieces, changed only by explicit visitor selection. */
(() => {
  const host = document.getElementById('heroFeature');
  if (!host || typeof RANGES === 'undefined') return;
  const features=[{collection:'bags',house:'Coccinelle',model:'Jellyfish',image:'images/vit-rosa.webp'},{collection:'bags',house:'U.S. Polo Assn.',model:'Monogram Satchel',image:'images/vit-heri.webp'},{collection:'eyewear',house:'Gucci',model:'Oval Sunglasses',image:'images/vit-gg.webp'}];
  const image=document.getElementById('heroPieceImage'),house=document.getElementById('heroPieceHouse'),name=document.getElementById('heroPieceName');
  function select(index){
    const feature=features[index],items=RANGES[feature.collection]?.items || [];
    const exactIndex=items.findIndex(item=>item.name===feature.house && item.note===feature.model);
    const itemIndex=exactIndex>=0?exactIndex:0,item=items[itemIndex],variant=item?.variants?.[0];
    if(!item||!variant)return;
    const url=new URL('piece.html',location.href);url.searchParams.set('id',itemIndex);if(feature.collection!=='bags')url.searchParams.set('c',feature.collection);if(variant.color)url.searchParams.set('colour',variant.color);url.searchParams.set('return',location.pathname+'#hero');
    image.src=exactIndex>=0?feature.image:variant.shots?.[0] || '';image.alt=[item.name,item.note,variant.color].filter(Boolean).join(' · ');house.textContent=item.name;name.textContent=item.note+(variant.color?' · '+variant.color:'');
    ['heroPieceLink','heroPieceImageLink'].forEach(id=>{const link=document.getElementById(id);link.href=url.pathname+url.search;link.setAttribute('aria-label','Discover '+image.alt);});
    host.querySelectorAll('[data-feature]').forEach(button=>button.setAttribute('aria-pressed',String(+button.dataset.feature===index)));
  }
  host.querySelectorAll('[data-feature]').forEach(button=>button.addEventListener('click',()=>select(+button.dataset.feature)));
  select(0);
})();
