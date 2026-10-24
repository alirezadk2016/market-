/* The catalogue is local read-only data. Enquiries become editable mail drafts only. */
(() => {
  'use strict';
  const dialog=document.getElementById('collectionRoom');
  if(!dialog || typeof RANGES==='undefined') return;
  const browser=document.getElementById('collectionBrowser'),pieceView=document.getElementById('cataloguePiece'),grid=document.getElementById('catalogueGrid'),search=document.getElementById('catalogueSearch'),clear=document.getElementById('clearCatalogue'),empty=document.getElementById('catalogueEmpty'),count=document.getElementById('collectionRoomCount');
  const photo=document.getElementById('cataloguePhoto'),thumbnails=document.getElementById('catalogueThumbnails'),variantsRoot=document.getElementById('catalogueVariants');
  const enquiryCollection=document.getElementById('salonCollection'),preferences=document.getElementById('salonPreferences'),compose=document.getElementById('salonCompose');
  let collectionKey='bags',items=[],selectedPiece=null,selectedVariant=null,lastCard=0;
  const variantChoices=new Map();
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const make=(tag,className,text)=>{const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;};
  const usableVariants=item=>(Array.isArray(item?.variants)?item.variants:[]).filter(variant=>variant && Array.isArray(variant.shots) && variant.shots.some(shot=>typeof shot==='string'&&shot));
  const imagesFor=(item,variant)=>{
    const shots=variant.shots.filter(shot=>typeof shot==='string'&&shot).slice();
    if(item.name==='Armani Exchange'&&item.note==='Logo Top-Handle'&&variant.color==='Nero')shots[0]='assets/bag-retouched.webp';
    if(item.name==='Gucci'&&item.note==='Oval Sunglasses')shots[0]='assets/gg-oval-retouched.webp';
    return shots;
  };
  function updateDraft(){
    const selected=enquiryCollection.value;
    const collection=Object.prototype.hasOwnProperty.call(RANGES,selected)?RANGES[selected].title:'help choosing a piece';
    const body='Hello A.z,\n\nI would like advice on '+collection+'.'+(preferences.value.trim()?'\n\n'+preferences.value.trim():'');
    compose.href='mailto:alirezadk2020@gmail.com?subject='+encodeURIComponent('A.z private enquiry · '+collection)+'&body='+encodeURIComponent(body);
  }
  enquiryCollection.addEventListener('change',updateDraft);preferences.addEventListener('input',updateDraft);updateDraft();
  document.getElementById('salonEnquiry').addEventListener('submit',event=>{event.preventDefault();updateDraft();compose.focus();});
  function renderCards(){
    const query=search.value.trim().toLowerCase();grid.replaceChildren();let visible=0;
    items.forEach((item,index)=>{
      const variants=usableVariants(item);
      const text=[item.name,item.note,...variants.map(variant=>variant.color)].filter(Boolean).join(' ').toLowerCase();
      if(query&&!text.includes(query))return;
      const match=query?variants.findIndex(variant=>variant.color?.toLowerCase().includes(query)):-1;
      const preferred=match>=0?match:(variantChoices.get(index)||0);
      const variant=variants[preferred]||variants[0];if(!variant)return;
      const card=make('button','catalogue-card');card.type='button';card.setAttribute('aria-label','Discover '+item.name+' '+item.note+' in '+(variant.color||'the current colour'));
      const well=make('span','catalogue-photo-well'),image=make('img');image.src=imagesFor(item,variant)[0];image.alt=[item.name,item.note,variant.color].filter(Boolean).join(' · ');image.loading='lazy';image.decoding='async';well.append(image);
      const copy=make('span','catalogue-card-copy');copy.append(make('span','catalogue-card-house',item.name||''),make('span','catalogue-card-name',item.note||''),make('span','catalogue-card-colour',variant.color||''));card.append(well,copy);
      card.addEventListener('click',()=>showPiece(index,preferred));grid.append(card);visible++;
    });
    count.textContent=visible+' '+(visible===1?'piece':'pieces')+(query?' matching your search':' in the current selection');empty.hidden=visible!==0;clear.hidden=!query;
  }
  function showPhoto(shots,index){
    photo.src=shots[index];photo.alt=[selectedPiece.name,selectedPiece.note,selectedVariant.color].filter(Boolean).join(' · ')+' · view '+(index+1)+' of '+shots.length;
    thumbnails.querySelectorAll('button').forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));
  }
  function showVariant(variant,index){
    selectedVariant=variant;variantChoices.set(lastCard,index);document.getElementById('catalogueColour').textContent=variant.color||'';
    variantsRoot.querySelectorAll('button').forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));
    const shots=imagesFor(selectedPiece,variant);thumbnails.replaceChildren();
    if(shots.length>1)shots.forEach((src,i)=>{const button=make('button');button.type='button';button.setAttribute('aria-label','View photograph '+(i+1)+' of '+selectedPiece.note);button.setAttribute('aria-pressed',String(i===0));const image=make('img');image.src=src;image.alt='';image.loading='lazy';button.append(image);button.addEventListener('click',()=>showPhoto(shots,i));thumbnails.append(button);});
    showPhoto(shots,0);
  }
  function showPiece(index,variantIndex=0){
    selectedPiece=items[index];if(!selectedPiece)return;const variants=usableVariants(selectedPiece);if(!variants.length)return;lastCard=index;
    browser.hidden=true;pieceView.hidden=false;dialog.classList.add('is-piece');dialog.setAttribute('aria-labelledby','cataloguePieceTitle');
    document.getElementById('catalogueHouse').textContent=selectedPiece.name||'';document.getElementById('cataloguePieceTitle').textContent=selectedPiece.note||'The piece';document.getElementById('catalogueDescription').textContent=selectedPiece.story||'';
    variantsRoot.replaceChildren();variantsRoot.hidden=variants.length<2;
    variants.forEach((variant,i)=>{const button=make('button');button.type='button';const swatch=make('span');swatch.setAttribute('aria-hidden','true');swatch.style.backgroundColor=variant.hex||'#777';button.append(swatch,document.createTextNode(variant.color||'Colour '+(i+1)));button.addEventListener('click',()=>showVariant(variant,i));variantsRoot.append(button);});
    const specifications=document.getElementById('catalogueSpecifications');specifications.replaceChildren();
    Object.entries(selectedPiece.details||{}).forEach(([key,value])=>{const row=make('div');row.append(make('dt','',key),make('dd','',String(value)));specifications.append(row);});
    const disclosure=pieceView.querySelector('.catalogue-specs');disclosure.hidden=!specifications.children.length;disclosure.open=false;
    showVariant(variants[variantIndex]||variants[0],variants[variantIndex]?variantIndex:0);dialog.querySelector('.collection-scroll').scrollTop=0;const heading=document.getElementById('cataloguePieceTitle');heading.tabIndex=-1;heading.focus({preventScroll:true});
  }
  function openCollection(key){
    if(!Object.prototype.hasOwnProperty.call(RANGES,key))return;
    if(collectionKey!==key)variantChoices.clear();collectionKey=key;items=Array.isArray(RANGES[key].items)?RANGES[key].items:[];search.value='';dialog.classList.remove('is-piece');browser.hidden=false;pieceView.hidden=true;dialog.setAttribute('aria-labelledby','collectionRoomTitle');document.getElementById('collectionRoomTitle').textContent=RANGES[key].title||'The collection';renderCards();if(!dialog.open)dialog.showModal();dialog.querySelector('.collection-scroll').scrollTop=0;document.getElementById('closeCollection').focus();
  }
  document.querySelectorAll('[data-collection]').forEach(button=>button.addEventListener('click',()=>openCollection(button.dataset.collection)));
  document.getElementById('closeCollection').addEventListener('click',()=>dialog.close());
  document.getElementById('catalogueBack').addEventListener('click',()=>{dialog.classList.remove('is-piece');browser.hidden=false;pieceView.hidden=true;dialog.setAttribute('aria-labelledby','collectionRoomTitle');renderCards();dialog.querySelector('.collection-scroll').scrollTop=0;const card=[...grid.querySelectorAll('button')].find(node=>node.getAttribute('aria-label')?.includes(items[lastCard]?.note||'_____'));(card||search).focus({preventScroll:true});});
  search.addEventListener('input',renderCards);clear.addEventListener('click',()=>{search.value='';renderCards();search.focus();});
  document.getElementById('catalogueEnquire').addEventListener('click',()=>{
    if(!selectedPiece||!selectedVariant)return;
    const sentence='I am considering '+selectedPiece.name+' '+selectedPiece.note+(selectedVariant.color?' in '+selectedVariant.color:'')+'.';
    enquiryCollection.value=collectionKey;preferences.value=(preferences.value.includes(sentence)?preferences.value:sentence+(preferences.value.trim()?'\n\n'+preferences.value.trim():'')).slice(0,1200);updateDraft();dialog.close();document.getElementById('salonEnquiry').scrollIntoView({behavior:reduced.matches?'auto':'smooth',block:'start'});preferences.focus({preventScroll:true});
  });
  window.openSalonCollection=openCollection;
  // Keep existing catalogue bookmarks working in the new single-page salon.
  const route=new URLSearchParams(location.search);
  const routeView=route.get('view');
  if(routeView==='collection'||routeView==='piece'){
    const key=Object.prototype.hasOwnProperty.call(RANGES,route.get('c'))?route.get('c'):'bags';
    openCollection(key);
    const raw=route.get('id');
    if(routeView==='piece'&&raw!==null&&/^\d+$/.test(raw)){
      const index=Number(raw);
      if(Number.isSafeInteger(index)&&index>=0&&index<items.length){
        const choices=usableVariants(items[index]);
        const selected=Math.max(0,choices.findIndex(variant=>variant.color===route.get('colour')));
        showPiece(index,selected);
      }
    }
  }

})();
