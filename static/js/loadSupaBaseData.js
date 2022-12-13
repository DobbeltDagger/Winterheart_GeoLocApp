import { showOverlay } from "./menu.js";


/////////////////////////////////////////////////////
// load SUPABASE data
// // https://supabase.com/docs/reference/javascript/installing
const loadSupaBaseData = async () => {
  
  console.log("Loading data ...");

  // setup supabase
  const supa = supabase.createClient(
    'https://cfszdsuowyndcovkpczs.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmc3pkc3Vvd3luZGNvdmtwY3pzIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NjA3NDc1OTYsImV4cCI6MTk3NjMyMzU5Nn0.3BDsEvXvRzZDxyAOtDvm-VovEHPNgZiwyrXwVopEKVU'
  ) 
  console.log("sb:", supa);

  // https://app.supabase.com/project/cfszdsuowyndcovkpczs/api?page=tables-intro
  const { data, error } = await supa // supabase
    .from('Location')
    .select(`*`)
  
  console.log("data:", data);

  // return content
  if (error) { return error }

  // hide loadingDATAscreen
  // const loadDataScre = document.querySelector('#loadingDataScreen');
  // loadDataScre.classList.add('hidden');   

  return data
}


/////////////////////////////////////////////////////
// shorten description
const truncate = (input) => input.length > 110 ? `${input.substring(0, 110)}...` : input;


/////////////////////////////////////////////////////
// function that builds the popup HTML - with click listeners!
// https://stackoverflow.com/questions/61511189/adding-a-button-to-the-popup-in-mapboxgl-js
const buildHTMLForPopup = (mapItem, index) => {

  // first the innerWrapper
  const insideWrap = document.createElement("div");
  insideWrap.classList.add("insidePopupWrapper");

  // img wrapper
  const imgWrap = document.createElement("div");
  imgWrap.classList.add("imgWrapper");

  // view button
  const viewButton = document.createElement("a");
  viewButton.classList.add("viewButton");
  viewButton.innerHTML = "View"; // "View Media &rarr;";
  // img
  const imgElm = document.createElement("img");
  imgElm.src = "../images/galleryDemo/thumbs/" + mapItem.Thumb; // !marker.png"; // mapItem.thumbSrc; // "../images/marker.png";

  // NOW BUILD THE TEXT!
  const txtWrap = document.createElement("div");
  txtWrap.classList.add("txtWrapper");

  // headline element
  const titleElm = document.createElement("h2");
  titleElm.innerText = mapItem.Title;
  // textElm
  const textElm = document.createElement("p");
  textElm.innerHTML = truncate(mapItem.Description);

  // ADD ALL TO INSIDEWRAP
  imgWrap.appendChild(viewButton);
  imgWrap.appendChild(imgElm);
  // txtWrap.appendChild(titleElm);
  txtWrap.appendChild(textElm);
  insideWrap.appendChild(imgWrap);
  insideWrap.appendChild(txtWrap);

  // ADD button listener!
  viewButton.addEventListener("click", function(e) {
    console.log("CLICKED! " + index);

    // turn mapItem overlay on and show media
    showOverlay("gallery"); // TESTING!!!

  })

  return insideWrap;
}


/////////////////////////////////////////////////////
// Draw all of our map points on our globe
const drawSupaData = (map, mapData, mediaData) => {

  console.log("supa mapData:", mapData);
  console.log("supa mediaData:", mediaData);
  
  let popHtml, popup, markerElm;
  let markerArray = [];

  for (let i = 0; i < mapData.length; i++) {
    
    // console.log("mapData[" + i + "]", mapData[i]);
    popHtml = buildHTMLForPopup(mapData[i], i);

    // popup = new mapboxgl.Popup({ offset: 28, closeOnMove: false, closeOnClick: true }).setHTML(popHtml)
    popup = new mapboxgl.Popup({ offset: 28, closeOnMove: false, closeOnClick: true }).setDOMContent(popHtml)
    
    // Create a DOM element for each marker.
    markerElm = document.createElement('div');
    markerElm.className = 'dot'; // initially because of zoom level!

    // build marker
    // const markerNew = new mapboxgl.Marker({ color: 'blue', rotation: 0 }) // simple
    const markerNew = new mapboxgl.Marker(markerElm)
      .setLngLat([ mapData[i].Lng, mapData[i].Lat ])
      .setPopup(popup)
      .addTo(map);
    
    markerArray.push(markerNew);
  }

  return markerArray;
}


/////////////////////////////////////////////////////
export {
  loadSupaBaseData,
  drawSupaData
}