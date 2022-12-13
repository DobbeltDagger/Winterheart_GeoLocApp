import outerHearts from "./KML/outerHearts.min.js";
import middleHeart1 from "./KML/middleHeart_small1.min.js";
import middleHeart2 from "./KML/middleHeart_small2.min.js";
import middleHeart3 from "./KML/middleHeart_small3.min.js";
import middleHeart4 from "./KML/middleHeart_small4.min.js";
import middleHeart5 from "./KML/middleHeart_small5.min.js";
import middleHeart6 from "./KML/middleHeart_small6.min.js";
import largeMiddle from "./KML/largeMiddle.min.js";
import largeLeft from "./KML/largeLeft.min.js";
import Question1 from "./KML/question1.min.js";
import Question2 from "./KML/question2.min.js";
import Question3 from "./KML/question3.min.js";


/////////////////////////////////////////////////////
// load KML DATA
const loadHeart = () => {
  
  console.log("Loading data ...");

  // load outerHearts
  let newOuterHearts = [];
  for (let i = 0; i < outerHearts.outerHearts.length; i++) {
    newOuterHearts.push( [ outerHearts.outerHearts[i].x, outerHearts.outerHearts[i].y ] );
  }
  // console.log("newOuterHearts:", newOuterHearts);

  // load middleHeart1
  let newMiddleHeart1 = [];
  for (let i = 0; i < middleHeart1.middleHeart1.length; i++) {
    newMiddleHeart1.push( [ middleHeart1.middleHeart1[i].x, middleHeart1.middleHeart1[i].y ] );
  }
  // load middleHeart2
  let newMiddleHeart2 = [];
  for (let i = 0; i < middleHeart2.middleHeart2.length; i++) {
    newMiddleHeart2.push( [ middleHeart2.middleHeart2[i].x, middleHeart2.middleHeart2[i].y ] );
  }
  // load middleHeart3
  let newMiddleHeart3 = [];
  for (let i = 0; i < middleHeart3.middleHeart3.length; i++) {
    newMiddleHeart3.push( [ middleHeart3.middleHeart3[i].x, middleHeart3.middleHeart3[i].y ] );
  }
  // load middleHeart4
  let newMiddleHeart4 = [];
  for (let i = 0; i < middleHeart4.middleHeart4.length; i++) {
    newMiddleHeart4.push( [ middleHeart4.middleHeart4[i].x, middleHeart4.middleHeart4[i].y ] );
  }
  // load middleHeart5
  let newMiddleHeart5 = [];
  for (let i = 0; i < middleHeart5.middleHeart5.length; i++) {
    newMiddleHeart5.push( [ middleHeart5.middleHeart5[i].x, middleHeart5.middleHeart5[i].y ] );
  }
  // load middleHeart6
  let newMiddleHeart6 = [];
  for (let i = 0; i < middleHeart6.middleHeart6.length; i++) {
    newMiddleHeart6.push( [ middleHeart6.middleHeart6[i].x, middleHeart6.middleHeart6[i].y ] );
  }
  // load largeMiddle
  let newLargeMiddle = [];
  for (let i = 0; i < largeMiddle.largeMiddle.length; i++) {
    newLargeMiddle.push( [ largeMiddle.largeMiddle[i].x, largeMiddle.largeMiddle[i].y ] );
  }
  // load largeLeft
  let newLargeLeft = [];
  for (let i = 0; i < largeLeft.largeLeft.length; i++) {
    newLargeLeft.push( [ largeLeft.largeLeft[i].x, largeLeft.largeLeft[i].y ] );
  }
  // load question1
  let newQuestion1 = [];
  for (let i = 0; i < Question1.Question1.length; i++) {
    newQuestion1.push( [ Question1.Question1[i].x, Question1.Question1[i].y ] );
  }
  // load question2
  let newQuestion2 = [];
  for (let i = 0; i < Question2.Question2.length; i++) {
    newQuestion2.push( [ Question2.Question2[i].x, Question2.Question2[i].y ] );
  }
  // load question3
  let newQuestion3 = [];
  for (let i = 0; i < Question3.Question3.length; i++) {
    newQuestion3.push( [ Question3.Question3[i].x, Question3.Question3[i].y ] );
  }


  /////////////////////////////////////////////////////
  return new Promise((resolve, reject) => {
    if (newOuterHearts.length !== 0) {   
      // resolve all arrays 
      resolve([
        newOuterHearts,
        newMiddleHeart1,
        newMiddleHeart2,
        newMiddleHeart3,
        newMiddleHeart4,
        newMiddleHeart5,
        newMiddleHeart6,
        newQuestion1,    
        newLargeMiddle,
        newLargeLeft,
        newQuestion2,
        newQuestion3
      ]);
    }
    if (newOuterHearts.length == 0) {
      reject("array not working!");
    }
  });
}


/////////////////////////////////////////////////////
// Draw all of our map points on our globe
const drawHeart = (map, allMapData) => {

  for (let i = 0; i < allMapData.length; i++) {
    const mapName = 'map' + i;
    map.addSource(mapName, {
      'type': 'geojson',
      'data': {
        'type': 'Feature',
        'properties': {},
        'geometry': {
          'type': 'LineString',
          'coordinates': allMapData[i]       
        }
      }
    });
    map.addLayer({
      'id': mapName,
      'type': 'line',
      'source': mapName,
      'layout': { 'line-join': 'round', 'line-cap': 'round' },
      'paint': {
        'line-color': 'white', // 'white', // 'black', // '#888',
        'line-width': 4 // 5 // 5 // 8
      }
    });      
  }
}


/////////////////////////////////////////////////////
// make some markers for demonstationk purposes
const setupDemoMapContent = (map) => {

  // WHEN this becomes real, these points are off course loaded from DB

  // with popup ...  
  let popHtml =
    `<div class='videoWrapper'>
      <iframe title="vimeo-player" src="https://player.vimeo.com/video/734479822?byline=0&portrait=0&title=0&pip=0" width="620" height="349" frameborder="0" allowfullscreen></iframe>
    </div>
    <div class='videoTextWrapper'>
      <h2>Her er video navn</h2>
      <p>Her er videons beskrivelse</p>
    </div>`;

    // let popup = new mapboxgl.Popup({ offset: 28, className: 'popupWrapper', closeOnMove: false, closeOnClick: true })
    //   .setHTML(popHtml)

    let popups = [
      new mapboxgl.Popup({ offset: 28, className: 'popupWrapper', closeOnMove: false, closeOnClick: true }).setHTML(popHtml),
      new mapboxgl.Popup({ offset: 28, className: 'popupWrapper', closeOnMove: false, closeOnClick: true }).setHTML(popHtml),
      new mapboxgl.Popup({ offset: 28, className: 'popupWrapper', closeOnMove: false, closeOnClick: true }).setHTML(popHtml),
    ];

    // FIRST marker!
    const marker = new mapboxgl.Marker({ color: "#FF8C00" })
      .setLngLat([9.64147, 55.508166])
      .setPopup(popups[0])
      .addTo(map);

    // Create a default Marker and add it to the map.
    const marker1 = new mapboxgl.Marker()
      .setLngLat([12.554729, 55.70651])
      .setPopup(popups[1])
      .addTo(map);
    
    // Create a default Marker, colored black, rotated 45 degrees.
    const marker2 = new mapboxgl.Marker({ color: 'black', rotation: 5 })
      .setLngLat([12.65147, 55.608166])
      .setPopup(popups[2])
      .addTo(map);

    // more demo locations
    for(let i = 0; i < 20; i++) {
      popups.push(
        new mapboxgl.Popup({ offset: 28, className: 'popupWrapper', closeOnMove: false, closeOnClick: true }).setHTML(popHtml)
      )
      const markerNew = new mapboxgl.Marker({ color: 'red', rotation: 0 })
        .setLngLat([Math.random() * 90, Math.random() * 90])
        .setPopup(popups[popups.length-1])
        .addTo(map);
    }

}


/////////////////////////////////////////////////////
export {
  loadHeart,
  drawHeart,
  setupDemoMapContent
}