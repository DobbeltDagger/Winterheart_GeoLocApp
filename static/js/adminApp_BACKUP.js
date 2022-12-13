import { drawHeart, loadHeart, setupDemoMapContent } from "./loadHeart.js";
// import { drawMapData, loadData } from "./loadData.js";
import { loadSupaBaseData, drawSupaData } from "./loadSupaBaseData.js";
import { getAllDistances, drawDistances } from "./distanceToLineSegment.js";
import { geoFindMeAsync, setOnLineMarker } from "./geoFindMe.js";
import { setupGalleryNavButtons, setupMenu } from "./menu.js";

// https://supabase.com/docs/reference/javascript/installing
// import { createClient } from '@supabase/supabase-js'

// (async function () {
/*
window.addEventListener("DOMContentLoaded", async function() {

  console.log("adminApp.js is run!");
  const allData = !{data}
  console.log("allData", allData);

})
*/


function adminApp(data) {
  this.data = data;
}


////////////////////////////////////////////////
adminApp.prototype = {


  ////////////////////////////////////////////////
  // setup the table
  init: function() {
    // setup the table without sort
    console.log("Init was run");
    console.log("data:", this.data);
  },




}