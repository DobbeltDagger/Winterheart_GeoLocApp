import { App } from "./App.js";


window.addEventListener("DOMContentLoaded", function() {

  console.log("index.js -> locations:", locations);
  console.log("index.js -> media:", media);
  const app = new App(locations, media);
  app.init();

})
