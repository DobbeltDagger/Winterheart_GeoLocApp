import { drawHeart, loadHeart, setupDemoMapContent } from "./loadHeart.js";
// import { drawMapData, loadData } from "./loadData.js";
import { loadSupaBaseData, drawSupaData } from "./loadSupaBaseData.js";
// import { getAllDistances, drawDistances } from "./distanceToLineSegment.js";
import { setupPositionFinder } from "./geoFindMe.js";
import { setupGalleryNavButtons, setupMenu } from "./menu.js";
import { setupMediaUploadForm } from "./forms.js";

// https://supabase.com/docs/reference/javascript/installing
// import { createClient } from '@supabase/supabase-js'

// (async function () {
window.addEventListener("DOMContentLoaded", async function() {

  // FOR TESTING, make the app able to not load maps!
  const appMode = "NOTtesting";

  // The users geoloc
  let myGeoLoc = {};
  // let overlayShown = false; // for overlay window!

  // setup mapbox
  mapboxgl.accessToken = 'pk.eyJ1IjoiYXZpc3RpIiwiYSI6ImNqbGlkYjF0NTAwMWkza3J6bWg4OGU1ajMifQ.CaYGpEN8sjY8LKaGSr4U_A';
  const map = new mapboxgl.Map({
    container: 'map', // container ID
    // style: 'mapbox://styles/mapbox/streets-v11', // style URL
    // ALSO, Use mapbox studio!
    style: 'mapbox://styles/avisti/cl77hia98000x14o4vexm0w9t',
    center: [10.074817, 56.172781],
    // minzoom: 3, // didnt work?
    // maxzoom: 9,    
    zoom: 1.75, // 3, // 12,
    // projection: https://docs.mapbox.com/mapbox-gl-js/style-spec/projection/
    projection: "globe", // "winkelTripel", // "naturalEarth", // "mercator", // "lambertConformalConic", // "equirectangular", // 'albers', // 'equalEarth'
    attributionControl: false
  });

  
  // load data
  const heartData = (appMode === "testing") ? {} : await loadHeart();
  console.log("heartData:", heartData);

  // const supaData = (appMode === "testing") ? {} : await loadSupaBaseData(); // I SHOULD NOT LOAD FROM CLIENT. THAT EXPOSES PW!!!
  // get from server:
  
  console.log("supaData:", supaData);

  // check my position
  setupPositionFinder(heartData, map);

  // setup media overlay validation
  setupMediaUploadForm();


  ////////////////////////////////////
  // mapbox load maps
  map.on('load', () => {

    console.log("appMode:", appMode); // testing or not

    // hide loadingscreen
    const loadScre = document.querySelector('#loadingScreen');
    loadScre.classList.add('hidden');    

    // setup menu
    setupMenu(map);
    setupGalleryNavButtons();

    /*
    // On click: https://stackoverflow.com/questions/63158744/display-lat-lng-coordinates-on-click-on-mapbox-gl-js
    map.on('click', async function(e) {
      // ARE WE TESTING?
      if (appMode === "testing") {
        console.log("TEST MODE");
      }
      else {
        // We're not testing
      }
    });
    */

    
    // Draw all KMLs onto globe
    (appMode === "testing") ? null : drawHeart(map, heartData);
    (appMode === "testing") ? null : drawSupaData(map, supaData);

    // Show Jørn some demo markers
    // setupDemoMapContent(map);

  });


})