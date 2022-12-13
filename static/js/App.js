import { drawHeart, loadHeart } from "./loadHeart.js";
import { setupPositionFinder, getTheLocationFromDataset } from "./geoFindMe.js";

///////////////////////////////////////
export class App {

  ///////////////////////////////////////
  // constructor
  constructor() {
    this.map = null;
  }

  
  ///////////////////////////////////////
  // copy to clipboard!
  handleCopyTextFromParagraph(lng, lat) {
    const cb = navigator.clipboard;
    cb.writeText(lng + ", " + lat).then(() => console.log('Text copied'));
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

    ////////////////////////////////////
    // mapbox load maps
    let _this = this; // I DONT HAVE TO DO THIS!!!
    this.map.on('load', () => {

      document.querySelector('#loadingScreen').classList.add("hidden"); // remove entire loadingscreen!
      // Draw all KMLs onto globe
      drawHeart(_this.map, heartData);

      // hide loadingscreen
      document.querySelector("#loadWrapper").classList.add("hidden");

      _this.map.on('click', function(e) {
        var coords = e.lngLat;
        console.log("coords:", coords);
        new mapboxgl.Popup()
          .setLngLat(coords)
          .setHTML('Lng + Lat:<br/>' + coords.lng + '<br/>' + coords.lat)
          .addTo(_this.map);

        _this.handleCopyTextFromParagraph(coords.lng, coords.lat) 
      });
    });


    /*
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
    */

  }

}