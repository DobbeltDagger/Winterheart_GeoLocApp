import { getAllDistances, drawDistances } from "./distanceToLineSegment.js";

///////////////////////////////////////////////////////
// Async getLocation
// https://stackoverflow.com/questions/51843227/how-to-use-async-wait-with-html5-geolocation-api
function geoLocator() {

  var watchID;
  var geoLoc;
  
  function showLocation(position) {
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;
    console.log("Latitude : " + latitude + " Longitude: " + longitude);
    console.log("Accuracy:", position.coords.accuracy);
  }

  function errorHandler(err) {
    if (err.code == 1) { alert("Error: Access is denied!"); }
    else if (err.code == 2) { alert("Error: Position is unavailable!");}
  }


  // get the info
  if (navigator.geolocation) {
    // timeout at 60000 milliseconds (60 seconds)
    var options = {
      enableHighAccuracy: true,
      timeout: Infinity, // 5000,
      maximumAge: 0 // default 0 -> no caching
      // https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/getCurrentPosition
    };
    geoLoc = navigator.geolocation;
    watchID = geoLoc.watchPosition(showLocation, errorHandler, options);
    return watchID;
  } else {
    alert("Sorry, browser does not support geolocation!");
  }
}


////////////////////////////////////////////////////////////////////
// Trying to get an accurate position:
// FROM HERE: https://3dayweek.dev/how-to-get-an-accurate-position-estimate-from-the-geolocation-api-in-javascript/
// setLocation: (location: ILocation) => void,
// setError: (errorMessage: string) => void,
// setAccuracy: (acc: number) => void
// const readLocation = ( setLocation, setError, setAccuracy ) => {
const readLocation = () => {
  if (navigator.geolocation) {
    const geoId = navigator.geolocation.watchPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        // setLocation({ lat, lng });
        // setAccuracy(position.coords.accuracy);
        console.log("Position + accuracy: ", { lat, lng }, position.coords.accuracy);
        if (position.coords.accuracy > 10) {
          // showErrorSnackBar("The GPS accuracy isn't good enough");
          console.log("The GPS accuracy isn't good enough");
        }
      },
      (err) => {
        // showErrorSnackBar(e.message);
        // setError(e.message);
        if (err.code == 1) { alert("Error: Access is denied!"); }
        else if (err.code == 2) { alert("Error: Position is unavailable!");}        
      },
      {
        enableHighAccuracy: true,
        maximumAge: 2000,
        timeout: 5000
      }
    );
    return () => {
      console.log('Clear watch called');
      window.navigator.geolocation.clearWatch(geoId);
    };
  }
  else {
    console.log("Your browser doesn't support geolocation");
  }
 
  return;
};



///////////////////////////////////////////////////////
// on interval, check if I am on the line or not!
const setupPositionFinder = async (heartData, map) => {

  // let loc = await geoFindMeAsync();
  let loc = readLocation(); // geoLocator();
  console.log("loc:", loc);

  // find coords
  // const coordinates = e.lngLat;
  const myLoc = { x: loc.lng, y: loc.lat }; // coordinates.lng, y: coordinates.lat };
  const allDistances = getAllDistances(myLoc, heartData); // supaData); //  heartData);
  // console.log("allDistances:", allDistances);

  // Find distances under a certain threshold
  const closeDistances = allDistances.filter(item => { return item.distance < 0.01 }); // WORKS
  // console.log("closeDistances:", closeDistances);
  const minDist = Math.min(...closeDistances.map(item => item.distance)); // find the smallest distance
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
  geoLocator,
  setupPositionFinder,
  setOnLineMarker
}