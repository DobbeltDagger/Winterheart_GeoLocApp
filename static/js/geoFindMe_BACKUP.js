import { getAllDistances, drawDistances } from "./distanceToLineSegment.js";

///////////////////////////////////////////////////////
// Async getLocation
// https://stackoverflow.com/questions/51843227/how-to-use-async-wait-with-html5-geolocation-api
function geoFindMeAsync() {

  // const status = document.querySelector('#status');
  // const mapLink = document.querySelector('#map-link');
  // mapLink.href = '';
  // mapLink.textContent = '';

  if (!navigator.geolocation) {
    // status.textContent = 'Geolocation is not supported by your browser';
    alert("Geolocation is not supported by your browser");
  } else {
    // status.textContent = 'Locating…';
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      position => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
    
        status.textContent = '';
        mapLink.href = `https://www.openstreetmap.org/#map=18/${latitude}/${longitude}`;
        mapLink.target = "_blank";
        mapLink.textContent = `Lat: ${latitude} °, Lng: ${longitude} °`;        
        resolve(position);
        // position => resolve({ x: position.coords.latitude, y: position.coords.longitude }),
      },
      error => reject(error)
    )
  })
}


///////////////////////////////////////////////////////
// on interval, check if I am on the line or not!
const setupPositionFinder = async (heartData, map) => {

  let loc = await geoFindMeAsync();
  console.log("loc:", loc);

  // find coords
  // const coordinates = e.lngLat;
  const myLoc = { x: loc.lng, y: loc.lat }; // coordinates.lng, y: coordinates.lat };
  const allDistances = getAllDistances(myLoc, heartData); // supaData); //  heartData);
  // console.log("allDistances:", allDistances);

  // Find distances under a certain threshold
  const closeDistances = allDistances.filter( item => { return item.distance < 0.01 }); // WORKS
  // console.log("closeDistances:", closeDistances);
  const minDist = Math.min(...closeDistances.map( item => item.distance )); // find the smallest distance
  const theClosest = closeDistances.filter(item => item.distance === minDist); // get the set of info from smallest val
  // console.log("theClosest:", theClosest);
  drawDistances(theClosest, map);

  // set the on Line marker
  setOnLineMarker(theClosest);

  return loc
}


///////////////////////////////////////////////////////
// set the marker to green if I am on Line
const setOnLineMarker = (theClosest) => {

  // the closest is the line that is IN PROXIMITY of current location
  const marker = document.getElementById('onLineMarker');
  if (theClosest.length !== 0) {
    marker.classList.add("inside");
    marker.classList.remove('outside');
  } else {
    marker.classList.add("outside");
    marker.classList.remove('inside');    
  }

}


///////////////////////////////////////////////////////
export {
  geoFindMeAsync,
  setupPositionFinder,
  setOnLineMarker
}