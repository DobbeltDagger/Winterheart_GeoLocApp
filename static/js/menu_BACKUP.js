import { getTheLocationFromDataset } from "./geoFindMe.js";


////////////////////////////////////////////////
// Add the click listeners for the menu system
const setupMenu = (map) => {

  ////////////////////////////////////
  // click for Online marker overlay
  document.getElementById("onlineMarkerBtn").addEventListener('click', (e) => {
    e.preventDefault();
    showOverlay('online');
  });

  ////////////////////////////////////
  // click for about OVERLAY
  document.getElementById("aboutBtn").addEventListener('click', (e) => {
    e.preventDefault();
    showOverlay('about');
  });


  document.getElementById("mediaBtn").addEventListener('click', (e) => {
    e.preventDefault();
    showOverlay('media');
  })


  ////////////////////////////////////
  // click for ZOOM menu item 
  document.getElementById("zoomToUserBtn").addEventListener('click', async function(e) {
    e.preventDefault();
    closeOverlay();

    const loc = getTheLocationFromDataset();

    // Fly to a random location
    map.flyTo({
      center: [ loc.lng, loc.lat ],
      essential: true, // this animation prefers-reduced-motion,
      zoom: 17 // 18
    });    
  })


  ////////////////////////////////////
  // reset planetview, fly to planet start position
  const flyToHome = () => {
    closeOverlay();

    // Fly to a random location
    map.flyTo({
      center: [10.074817, 56.172781],
      essential: true, // this animation prefers-reduced-motion,
      zoom: 1.75 // 2.5
    });
  }
  document.getElementById("bigLogoBtn").addEventListener('click', flyToHome);
  document.getElementById("smallLogoBtn").addEventListener('click', flyToHome);


  ////////////////////////////////////
  // show burger menu
  document.getElementById("burger").addEventListener('click', function(e) {
    const menuOvl = document.getElementById('mobileMenuOverlay');
    e.preventDefault();
    if (menuOvl.classList.contains('shown') == false) {
      menuOvl.classList.add('shown');
      menuOvl.classList.remove('hidden');
      closeOverlay(); // close the big overlay!
      console.log("OVERLAY WAS CLOSED!")
    } else {
      menuOvl.classList.add('hidden');
      menuOvl.classList.remove('shown');
    }
    toggleBurgerIcon();
  })


  // overlay zoom to btn
  document.getElementById("mobileMenuZoomToUserBtn").addEventListener('click', async function(e) {

    e.preventDefault();
    closeOverlay();
    closeMenuOverlay();
    toggleBurgerIcon();

    const loc = getTheLocationFromDataset();
    // Fly to a location
    map.flyTo({
      center: [ loc.lng, loc.lat ],
      essential: true, // this animation prefers-reduced-motion,
      zoom: 17 // 18
    });     
  })

  
  document.getElementById("mobileMenuMediaBtn").addEventListener('click', (e) => {
    e.preventDefault();
    closeMenuOverlay(); // close the responsive menu!
    toggleBurgerIcon();
    showOverlay('media');
  })

  document.getElementById("mobileMenuAboutBtn").addEventListener('click', (e) => {
    e.preventDefault();
    closeMenuOverlay(); // close the responsive menu!
    toggleBurgerIcon();
    showOverlay('about');    
  })    


  ////////////////////////////////////
  // overlay Close btns
  const ovlCloseBtn = document.getElementById("closeOverlayBtn");
  ovlCloseBtn.addEventListener('click', function(e) {
    e.preventDefault();
    closeOverlay();
  })

  ////////////////////////////////////
  // toggle the resp menu icon
  function toggleBurgerIcon() {
    const burg = document.getElementById('burgerIcon');
    const cross = document.getElementById('crossIcon');

    if (burg.classList.contains('hide')) {
      // show burger icon
      burg.classList.remove('hide');
      cross.classList.add('hide');    
    } else {
      // hide burger icon
      burg.classList.add('hide');
      cross.classList.remove('hide');   
    }
  }

  // responsive LOGO buttons
  const bigLogoBtn = document.getElementById('bigLogoBtn');
  const smallLogoBtn = document.getElementById('smallLogoBtn');
  bigLogoBtn.addEventListener('click', closeOverlay);
  smallLogoBtn.addEventListener('click', closeOverlay);
}


////////////////////////////////////
// navigate media with gallery buttons
const setupGalleryNavButtons = () => {

  let activeIndex = 0;
  // const counter = document.getElementById("currentIndex"); counter.innerText = 1;
  const groups = document.getElementsByClassName("galleryItem");
  // btns
  const nextBtn = document.getElementById("galleryNextBtn");
  const prevBtn = document.getElementById("galleryPrevBtn");

  ////////////////////////////////////
  function next() {
    const nextIndex = activeIndex + 1 <= groups.length - 1 ? activeIndex + 1 : 0;
    
    const currentGroup = document.querySelector(`[data-index="${activeIndex}"]`);
    const nextGroup = document.querySelector(`[data-index="${nextIndex}"]`);
    currentGroup.dataset.status = "inactive"; // "after";
    // nextGroup.dataset.status = "becoming-active-from-before";
    
    setTimeout(() => {
      nextGroup.dataset.status = "active";
      activeIndex = nextIndex;
      // counter.innerText = activeIndex + 1;
    });
  }

  ////////////////////////////////////
  function prev() {
    const nextIndex = activeIndex - 1 >= 0 ? activeIndex - 1 : groups.length - 1;
    
    const currentGroup = document.querySelector(`[data-index="${activeIndex}"]`);
    const nextGroup = document.querySelector(`[data-index="${nextIndex}"]`);
    currentGroup.dataset.status = "inactive"; // "before";
    // nextGroup.dataset.status = "becoming-active-from-after";
    
    setTimeout(() => {
      nextGroup.dataset.status = "active";
      activeIndex = nextIndex;
      // counter.innerText = activeIndex + 1;
    });
  }
  
  // setup listener for next/prev button  
  nextBtn.addEventListener('click', () => { next(); })
  prevBtn.addEventListener('click', () => { prev(); })
  // setup next click for images
  for (let item of groups) { 
    item.addEventListener('click', () => { next(); })
  }

}


////////////////////////////////////
// close big overlay
const closeOverlay = () => {
  const overlay = document.getElementById("overlay");
  overlay.classList.add('hidden');
  overlay.classList.remove('shown'); 
}


////////////////////////////////////
// close the responsive menu
function closeMenuOverlay() {
  const mobMenuOvl = document.getElementById('mobileMenuOverlay');
  mobMenuOvl.classList.add('hidden');
  mobMenuOvl.classList.remove('shown');    
}


////////////////////////////////////////////////////////////////////////
// hide upload form and show file upload progress
const showProgressDisplay = () => {
  document.querySelector(".clientFormWrapper").classList.add("formHidden");
  document.getElementById("uploadProgressWrapper").classList.add("shown");
}


////////////////////////////////////////////////////////////////////////
// files are uploaded. 
const showProcessingDisplay = () => {
  document.getElementById("uploadProgressWrapper").classList.remove("shown");
  document.getElementById("uploadProcessingWrapper").classList.add("shown");
}


////////////////////////////////////////////////////////////////////////
// Open the overlay -and set state
const showOverlay = (state) => {

  const onlineMarkerOvl = document.getElementById('onlineMarkerOverlay');
  const aboutOvl = document.getElementById('aboutOverlay');
  const mediaOvl = document.getElementById('mediaOverlay');
  const galleryOvl = document.getElementById('galleryOverlay');

  // show outer overlay
  overlay.classList.add('shown');
  overlay.classList.remove('hidden');

  // check and set overlay content state
  switch(state) {

    // ONLINE state
    case 'online':
      // check if already open
      // if (onlineMarkerOvl.classList.contains('shown')) {
      //   onlineMarkerOvl.classList.add('hidden');
      //   onlineMarkerOvl.classList.remove('shown');  
      //   closeOverlay();
      //   break;
      // }
      // it's not open -> open it and hide others
      mediaOvl.classList.add('hidden');
      mediaOvl.classList.remove('shown');
      aboutOvl.classList.add('hidden');
      aboutOvl.classList.remove('shown');
      galleryOvl.classList.add('hidden');
      galleryOvl.classList.remove('shown');      
      // show
      onlineMarkerOvl.classList.add('shown');
      onlineMarkerOvl.classList.remove('hidden');        
      break;

    // ABOUT state
    case 'about':
      // check if already open
      // if (aboutOvl.classList.contains('shown')) {
      //   aboutOvl.classList.add('hidden');
      //   aboutOvl.classList.remove('shown');  
      //   closeOverlay();
      //   break;
      // }
      // it's not open -> open it and hide others        
      mediaOvl.classList.add('hidden');
      mediaOvl.classList.remove('shown');
      onlineMarkerOvl.classList.add('hidden');
      onlineMarkerOvl.classList.remove('shown');
      galleryOvl.classList.add('hidden');
      galleryOvl.classList.remove('shown');         
      // show
      aboutOvl.classList.add('shown');
      aboutOvl.classList.remove('hidden');        
      break;

    // MEDIA state
    case 'media':
      // check if already open
      // if (mediaOvl.classList.contains('shown')) {
      //   mediaOvl.classList.add('hidden');
      //   mediaOvl.classList.remove('shown');  
      //   closeOverlay();
      //   break;
      // }
      // it's not open -> open it and hide others                
      aboutOvl.classList.add('hidden');
      aboutOvl.classList.remove('shown');
      onlineMarkerOvl.classList.add('hidden');
      onlineMarkerOvl.classList.remove('shown');
      galleryOvl.classList.add('hidden');
      galleryOvl.classList.remove('shown');         
      // show
      mediaOvl.classList.add('shown');
      mediaOvl.classList.remove('hidden');        
      break;

    // GALLERY state
    case 'gallery':
      aboutOvl.classList.add('hidden');
      aboutOvl.classList.remove('shown');
      onlineMarkerOvl.classList.add('hidden');
      onlineMarkerOvl.classList.remove('shown');
      mediaOvl.classList.add('hidden');
      mediaOvl.classList.remove('shown');
      // show
      galleryOvl.classList.add("shown");
      galleryOvl.classList.remove("hidden");      
      break;

    // default state
    default:
      console.log("somehow we hit default state in overlay state!?")
      break;

  };
}
  



//////////////////////////////
// export setup menu
export {
  setupMenu,
  setupGalleryNavButtons,
  closeOverlay,
  closeMenuOverlay,
  showProgressDisplay,
  showProcessingDisplay,
  showOverlay
}