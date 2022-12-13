import { betterCreatedAt } from "./functions.js";


////////////////////////////////////////////////
class adminSingleMediaItemApp {

  constructor(data) {
    this.data = data;
  }


  ////////////////////////////////////////////////
  // setup the table
  init() {
    // setup the table without sort
    console.log("adminSingleMediaItemApp Init was run!!");
    console.log("data:", this.data);

    const formSingle = document.getElementById("formSingle");
    if (formSingle.attachEvent) { formSingle.attachEvent("submit", this.saveForm.bind(this)); }
    else { formSingle.addEventListener("submit", this.saveForm.bind(this)); }    

    this.updateForm();
  }


  ////////////////////////////////////////////////
  // fill the right content into the form
  updateForm() {

    // id
    const idElm = document.getElementById("id");
    idElm.value = this.data.id;
    // created_at
    const createdElm = document.getElementById("created_at");
    createdElm.value = this.data.created_at;
    // MediaType
    const mediaTypeElm = document.getElementById("mediaType");
    mediaTypeElm.value = this.data.MediaType;
    // Url
    const urlElm = document.getElementById("url");
    urlElm.value = this.data.Url;
    // userId
    const userIdElm = document.getElementById("userId");
    userIdElm.value = this.data.UserId;    
    // mapItemId
    const mapItemIdElm = document.getElementById("mapItemId");
    mapItemIdElm.value = this.data.MapItemId;
  }


  ////////////////////////////////////////////////
  // submit and save form
  saveForm(e) {
    e.preventDefault();
    console.log("Save Form was run!");

    const payload = new FormData();
    const req = new XMLHttpRequest();
    const url = "/adminMedia/" + this.data.id;

    // add stuff to form
    payload.append("id", document.getElementById("id").value);
    payload.append("created_at", document.getElementById("created_at").value);
    payload.append("mediaType", document.getElementById("mediaType").value);
    payload.append("url", document.getElementById("url").value);
    payload.append("userId", document.getElementById("userId").value);
    payload.append("mapItemId", document.getElementById("mapItemId").value);
    
    // post this request
    req.open("POST", url, false); // true); // third arg means async when true
    req.onreadystatechange = function() {
      if (req.readyState === 4 && req.status === 200) {
        // redirect has to be done here! Express cannot do redirect when ajax POST!
        window.location.href = '/adminMedia';
      }
      else {
        console.log('There was a problem with the request.');
      }
    };

    req.send(payload);

    return false
  }

}


////////////////////////////////////////////////
window.addEventListener("DOMContentLoaded", function() {

  const app = new adminSingleMediaItemApp(data);
  app.init();

})
