var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMomentsArea = document.querySelector('#shared-moments');
var act = document.getElementById('action-tag');
var URL ='https://newsapi.org/v2/top-headlines?country=us&apiKey=aa330a0050dd47848af943354d5744cd';
var networkAvailable = false;


function openCreatePostModal() {
  createPostArea.style.display = 'block';
  if(deferredPrompt){
    deferredPrompt.prompt();

    deferredPrompt.userChoice.then(choiceVal=>{
      console.log(choiceVal.outcome);

      if(choiceVal.outcome==='dismissed'){
        console.log('user cancelled installation');
      }else{
        console.log('user is added on home screen');
      }
      
    });
      deferredPrompt=null;
  }
  cacheDeleter();
}

function cacheDeleter(){
  if('serviceWorker' in navigator){
    navigator.serviceWorker.getRegistrations()
    .then(sW=>sW.forEach(element=>element.unregister()))
  }
}

function closeCreatePostModal() {
  createPostArea.style.display = 'none';
}


shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

function createCard(data){
  let total ='';
    data.forEach(data=>{
    total +=`
    <div class="demo-card-square mdl-card mdl-shadow--2dp" id="tranter">
    <div class="mdl-card__title mdl-card--expand cardTitle" style="background:url(${ data.urlToImage ===null ? "/src/images/none.png" : data.urlToImage}) center / cover;  color: #fff;
    height: 176px;">
      <h2 class="mdl-card__title-text">${data.title===null ? '': data.title}</h2>
    </div>
    <div class="mdl-card__supporting-text">
    ${data.description === null ? '': data.description}
    </div>
    <div class="mdl-card__actions mdl-card--border">
      <a class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect" href="${data.url}" target="_blank">
        READ MORE...
      </a>
      <button id='action-tag' class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab">
         <i class="material-icons">add</i>
      </button>
    </div>
    </div>
`  
      
  })
  
  sharedMomentsArea.innerHTML = total;

}

function clearCards(){
  while(sharedMomentsArea.hasChildNodes()){
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
  }
}



function UI(datas){
  clearCards();
 createCard(datas);
}

fetch(URL)
  .then(function(res) {
    return res.json();
  })
  .then(function(data) {
        networkAvailable=true;
    console.log('from web', data);
    UI(data.articles); 
    
  });

if('indexedDB' in window){
  readAllData('feeds')
  .then(data=>{
      if(!networkAvailable){
        console.log('from cache', data);
        UI(data);
    }
  });
}

