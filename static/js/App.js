import { drawHeart, loadHeart } from "./loadHeart.js";
import { drawSupaData } from "./loadSupaBaseData.js";
import { setupPositionFinder, getTheLocationFromDataset } from "./geoFindMe.js";
import { closeOverlay, setupGalleryNavButtons, setupMenu } from "./menu.js";
import { clearForm, setupMediaUploadForm } from "./forms.js";
// import { loadSupaBaseLocations, loadSupaBaseMedia } from "../../supabase.js";


///////////////////////////////////////
export class App {

  ///////////////////////////////////////
  // constructor
  constructor(locations, media) {
    this.supaLocations = locations;
    this.supaMedia = media;
    this.map = null;
    this.markers = [];
  }


  ///////////////////////////////////////
  // setup the app
  async init() {

    // setup mapbox
    mapboxgl.accessToken = 'pk.eyJ1IjoiYXZpc3RpIiwiYSI6ImNqbGlkYjF0NTAwMWkza3J6bWg4OGU1ajMifQ.CaYGpEN8sjY8LKaGSr4U_A';
    this.map = new mapboxgl.Map({
      container: 'map', // container ID
      style: 'mapbox://styles/avisti/cl77hia98000x14o4vexm0w9t',
      center: [10.074817, 56.172781], 
      zoom: 1.75,
      projection: "globe",
      attributionControl: false
    });

    // load data
    const heartData = await loadHeart();

    // setup media overlay validation
    // let _this = this;
    setupMediaUploadForm();
    this.createReloadButton(); // makes the invisble reload button!

    ////////////////////////////////////
    // mapbox load maps
    // let _this = this; // I DONT HAVE TO DO THIS!!!
    this.map.on('load', () => {

      // setup enterBtn click listener
      let _this = this;
      document.getElementById("enterBtn").addEventListener("click", function(e) {
        e.preventDefault();
        document.querySelector('#loadingScreen').classList.add("hidden"); // remove entire loadingscreen!

        // check my position
        setupPositionFinder(heartData, _this.map);      
        // setup menu
        setupMenu(_this.map);
        setupGalleryNavButtons();
        
        // Draw all KMLs onto globe
        drawHeart(_this.map, heartData);
        _this.markers = drawSupaData(_this.map, _this.supaLocations, _this.supaMedia);
        console.log("_this.markers:", _this.markers);        
      })

      // hide loadingscreen
      document.querySelector("#loadWrapper").classList.add("hidden");
      document.querySelector("#enterWrapper").classList.add("shown");

    });


    // SCaling icons on zoom!
    // from here: https://stackoverflow.com/questions/63870324/how-to-implement-mapbox-expression-inside-marker
    this.map.on('zoom', () => {
      const zoom = this.map.getZoom()
      // console.log("ZOOM LEVEL:", zoom);

      const markers = document.querySelectorAll(".mapboxgl-marker");
      for (let marker of markers) {
        if (zoom <= 3) {
          marker.classList.remove("pin");
          marker.classList.remove("imageMarker");
          marker.classList.add("dot");
        }
        else if (zoom > 3 && zoom <= 8 ) {
          marker.classList.remove("dot");
          marker.classList.remove("imageMarker");
          marker.classList.add("pin");
        }
        else if (zoom > 8 ){
          marker.classList.remove("pin");
          marker.classList.remove("dot");
          marker.classList.add("imageMarker");
        }
      }
  });

  }


  ///////////////////////////////////////
  // make a button that is shown when i've saved
  // .. and need to reload front map!
  createReloadButton() {

    const rlBtn = document.createElement("button");
    rlBtn.innerText = "Show me on the map!";

    // listen for click
    let _this = this;
    rlBtn.addEventListener("click", async function(e) {
      e.preventDefault();

      console.log("RELOAD THE MAP HERE!");
      // RELOAD MAP on this CALLBACK!
      // DELETE OLD MARKERS!
      for (let i = 0; i < _this.markers.length; i++) { _this.markers[i].remove(); }
      _this.markers.length = 0; // reset markers array!

      // get locations and media items
      fetch("/get-data", { method: 'GET' })
        .then( res => res.json())
        .then((res) => {
          //  console.log("res:", res);
          const locations = JSON.parse(res.Locations);
          const mediaItems = JSON.parse(res.MediaItems);
          // console.log("locations:", locations);
          // console.log("mediaItems:", mediaItems);
          _this.markers = drawSupaData(_this.map, locations, mediaItems); // redraw markers!
          // close overlay
          closeOverlay();
          // ... AND then zoom to new position?
          const loc = getTheLocationFromDataset();
          _this.map.flyTo({
            center: [ loc.lng, loc.lat ],
            essential: true, // this animation prefers-reduced-motion,
            zoom: 17 // 18
          });
          // Clear the Share Media form
          clearForm();
        })
        .catch(err => {
          console.error(err);
        })
  
    })

    // append
    const elm = document.getElementById("reloadBtnWrapper");
    elm.appendChild(rlBtn);

  }
}