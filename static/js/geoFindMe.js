import { getAllDistances, drawDistances } from "./distanceToLineSegment.js";


///////////////////////////////////////////////////////
// on interval, check if I am on the line or not!
const setupPositionFinder = (heartData, map) => {

  readLocationThrottle(function() {

    // callback -> handle position here
    const loc = { lng: arguments[0], lat: arguments[1], accuracy: arguments[2] };
    console.log("loc -> lng, lat, acc:", loc.lng, "/", loc.lat, "/", loc.accuracy);
    storePositionInDataset(loc); // store this in DOM
    
    // const myLoc = { x: loc.lng, y: loc.lat }; // coordinates.lng, y: coordinates.lat };
    const allDistances = getAllDistances({ x: loc.lng, y: loc.lat }, heartData); // supaData); //  heartData);
    // console.log("allDistances:", allDistances);
  
    // Find distances under a certain threshold
    const closeDistances = allDistances.filter(item => { return item.distance < 0.01 }); // WORKS
    // console.log("closeDistances:", closeDistances);
    const minDist = Math.min(...closeDistances.map(item => item.distance)); // find the smallest distance
    const theClosest = closeDistances.filter(item => item.distance === minDist); // get the set of info from smallest val
    // console.log("theClosest:", theClosest);
    drawDistances(theClosest, map);
  
    // set the on Line marker
    setOnLineMarker(theClosest, loc.accuracy);
    
    // return loc;
  });
  
}


///////////////////////////////////////////////////////
// save the position in zoom btn dataset
const storePositionInDataset = (position) => {
  const menuItem = document.getElementById("zoomToUserBtn");
  menuItem.setAttribute("data-lng", position.lng);
  menuItem.setAttribute("data-lat", position.lat);
  menuItem.setAttribute("data-accuracy", position.accuracy);
}


///////////////////////////////////////////////////////
// return the loc stored in zoom button!
const getTheLocationFromDataset = () => {

  const menuItem = document.getElementById("zoomToUserBtn");
  console.log("lng:", menuItem.dataset.lng);
  console.log("lat:", menuItem.dataset.lat);
  console.log("accuracy:", menuItem.dataset.accuracy);

  return {
    lng: menuItem.dataset.lng || -1,
    lat: menuItem.dataset.lat || -1,
    accuracy: menuItem.dataset.accuracy || -1
  };
}


///////////////////////////////////////////////////////
// this function uses throttle to handle position
// https://github.com/heyman/geolocation-throttle
const readLocationThrottle = (handleNewPosition) => {

  // setup vars
  let geoId, lat, lng, accuracy;

  if (navigator.geolocation) {
    geoId = GeolocationThrottle.watchPosition(
      (position) => {
        lat = position.coords.latitude;
        lng = position.coords.longitude;
        accuracy = position.coords.accuracy;
        handleNewPosition(lng, lat, accuracy)
      },
      (err) => {
        if (err.code == 1) { console.log("Error: Access is denied!"); }
        else if (err.code == 2) { console.log("Error: Position is unavailable!"); }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 2000, // 2000, 0 means no caching - works fine with zero!
        timeout: 5000, // 30000, // 5000
        throttleTime: 3000 // 5000
      }
    );
  }
  else {
    console.log("Your browser doesn't support geolocation");
  }
}


///////////////////////////////////////////////////////
// set the marker to green if I am on Line
const setOnLineMarker = (theClosest, accuracy) => {

  // the closest is the line that is IN PROXIMITY of current location
  const marker = document.getElementById('onLineMarker');
  // initial check for geo loc precision
  // if (accuracy > 20.0) { // testing
  if (accuracy > 10.0) {
    marker.classList.add("loading");
    marker.classList.remove('outside');
    marker.classList.remove('inside');
    return
  }  
  if (theClosest.length !== 0) {
    marker.classList.add("inside");
    marker.classList.remove('outside');
    marker.classList.remove('loading');
  } else {
    marker.classList.add("outside");
    marker.classList.remove('inside');
    marker.classList.remove('loading');
  }

}


///////////////////////////////////////////////////////
export {
  storePositionInDataset,
  getTheLocationFromDataset,
  setupPositionFinder,
  setOnLineMarker
}