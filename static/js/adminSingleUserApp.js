import { betterCreatedAt } from "./functions.js";


////////////////////////////////////////////////
class adminSingleUserApp {

  constructor(data) {
    this.data = data;
  }


  ////////////////////////////////////////////////
  // setup the table
  init() {
    // setup the table without sort
    console.log("adminSingleUserApp Init was run!!");
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
    // userType
    const userTypeElm = document.getElementById("userType");
    userTypeElm.value = this.data.UserType;
    // Email
    const emailElm = document.getElementById("email");
    emailElm.value = this.data.Email;
    // Flagged
    const flaggedElm = document.getElementById("flagged");
    (this.data.Flagged) ? flaggedElm.setAttribute('checked', 'checked') : flaggedElm.removeAttribute('checked');
  }


  ////////////////////////////////////////////////
  // submit and save form
  saveForm(e) {

    e.preventDefault();
    console.log("Save Form was run!");

    const payload = new FormData();
    const req = new XMLHttpRequest();
    const url = "/adminUsers/" + this.data.id;

    // add stuff to form
    payload.append("id", document.getElementById("id").value);
    payload.append("created_at", document.getElementById("created_at").value);
    payload.append("UserType", document.getElementById("userType").value);
    payload.append("Email", document.getElementById("email").value);
    payload.append("Flagged", document.getElementById("flagged").checked);

    // post this request
    req.open("POST", url, false); // true); // third arg means async when true
    req.onreadystatechange = function() {
      if (req.readyState === 4 && req.status === 200) {
        // redirect has to be done here! Express cannot do redirect when ajax POST!
        window.location.href = '/adminUsers';
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

  const app = new adminSingleUserApp(data);
  app.init();

})
