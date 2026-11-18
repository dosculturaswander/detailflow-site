(()=>{
const area=document.getElementById('hospitalityPhotos'),lightbox=document.getElementById('dcwPhotoLightbox');
if(!area||!lightbox||!document.getElementById('dcwPhotoGrid'))return;
const buttons=Array.from(area.querySelectorAll('.dcw-photo-card'));
const empty=document.getElementById('dcwPhotosEmpty');
const full=lightbox.querySelector('figure img'),count=lightbox.querySelector('.dcw-photo-number'),description=lightbox.querySelector('.dcw-photo-description');
let active=0,visible=[],previousFocus=null;
function show(n){
  if(!visible.length)return;
  active=(n+visible.length)%visible.length;
  const card=visible[active];
  full.src=card.dataset.photo;
  full.alt=card.dataset.caption;
  count.textContent=String(active+1).padStart(2,'0')+' / '+String(visible.length).padStart(2,'0');
  description.textContent=card.dataset.caption;
}
function open(card){visible=buttons.filter(x=>!x.hidden);previousFocus=document.activeElement;lightbox.hidden=false;show(visible.indexOf(card));lightbox.querySelector('.dcw-photo-close').focus()}
function close(){lightbox.hidden=true;full.removeAttribute('src');if(previousFocus&&typeof previousFocus.focus==='function')previousFocus.focus()}
lightbox.querySelector('.dcw-photo-close').addEventListener('click',close);
lightbox.querySelector('.dcw-photo-prev').addEventListener('click',()=>show(active-1));
lightbox.querySelector('.dcw-photo-next').addEventListener('click',()=>show(active+1));
lightbox.addEventListener('click',e=>{if(e.target===lightbox)close()});
document.addEventListener('keydown',e=>{
 if(lightbox.hidden)return;
 if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();close()}
 if(e.key==='ArrowRight'){e.preventDefault();show(active+1)}
 if(e.key==='ArrowLeft'){e.preventDefault();show(active-1)}
},true);
const loaded=buttons.map(card=>new Promise(resolve=>{
 const pre=new Image();
 pre.onload=()=>{card.querySelector('img').src=card.dataset.photo;card.hidden=false;card.addEventListener('click',()=>open(card));resolve(true)};
 pre.onerror=()=>resolve(false);
 pre.src=card.dataset.photo;
}));
Promise.all(loaded).then(results=>{empty.hidden=results.some(Boolean)});
})()
