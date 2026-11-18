(()=> {
  const box=document.getElementById('hospitalityCollection');
  const root=document.getElementById('hospitalityVideos');
  if(!root || !box || !document.getElementById('dcwMontageTab'))return;
  const tabs=[document.getElementById('dcwMontageTab'),document.getElementById('dcwUGCTab')];
  const sections=[document.getElementById('dcwMontagePanel'),document.getElementById('dcwUGCPanel')];
  tabs.forEach((tab,i)=>tab.addEventListener('click',()=>{
    tabs.forEach((t,j)=>{t.classList.toggle('is-active',i===j);t.setAttribute('aria-selected',String(i===j));sections[j].hidden=i!==j});
  }));
  const lightbox=document.getElementById('dcwVideoLightbox'), video=lightbox.querySelector('video');
  const close=()=>{video.pause();video.removeAttribute('src');video.load();lightbox.hidden=true};
  lightbox.querySelector('.dcw-video-lightbox-close').addEventListener('click',close);
  lightbox.addEventListener('click',e=>{if(e.target===lightbox)close()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!lightbox.hidden){e.stopImmediatePropagation();close()}},true);
  const cards=Array.from(document.querySelectorAll('.dcw-film-card'));
  const ready=cards.map(async card=>{
    try{
      const response=await fetch(card.dataset.video,{method:'HEAD',cache:'no-store'});
      if(!response.ok)return false;
      const image=card.querySelector('.dcw-film-image');
      image.style.backgroundImage="linear-gradient(0deg, rgba(0,0,0,.17), rgba(0,0,0,.06)), url('"+card.dataset.poster.replaceAll("'","%27")+"')";
      card.hidden=false;
      card.addEventListener('click',()=>{
        video.src=card.dataset.video;video.poster=card.dataset.poster;
        lightbox.querySelector('.dcw-video-current-title').textContent=card.dataset.name;
        lightbox.hidden=false;video.play().catch(()=>{});
      });
      return true;
    }catch(e){return false}
  });
  Promise.all(ready).then(results=>{
    document.getElementById('dcwMontageEmpty').hidden=results.some(Boolean);
  });
})()
