var deferredPrompt;

if (!window.Promise) {
    window.Promise = Promise;
  }
   
if('serviceWorker' in navigator){
    navigator.serviceWorker
    .register('/serviceworker.js')
    .then(()=>console.log('servise worker first done by franco'));
}

// to detrmine when the banner is installed
window.addEventListener('beforeinstallprompt', event=>{
    console.log('beforeinstall prompt is fired');
    event.preventDefault();
    deferredPrompt = event;
    return false;
});



