

////////////////////////////////////////////////
// export class adminSingleApp {
class adminSingleApp {

  constructor(data) {
    this.data = data;
  }


  ////////////////////////////////////////////////
  // setup the table
  init() {
    // setup the table without sort
    console.log("Init was run!!");
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
    // thumb
    const thumbElm = document.getElementById("thumbImage");
    thumbElm.src = "../images/" + this.data.Thumb;
    // thumb file
    const thumbFileElm = document.getElementById("thumb");
    // thumbFileElm.filename = this.data.Thumb; // "marker.png"; // CAnt do this for security reasons
    thumbFileElm.setAttribute("placeholder", "Pick a new file to replace current image")
    // title
    const titleElm = document.getElementById("title");
    titleElm.value = this.data.Title;
    // description
    const descElm = document.getElementById("description");
    descElm.value = this.data.Description;
    // Lng
    const lngElm = document.getElementById("Lng");
    lngElm.value = this.data.Lng;
    // Lat
    const latElm = document.getElementById("Lat");
    latElm.value = this.data.Lat;
    // userId
    const userIdElm = document.getElementById("userId");
    userIdElm.value = this.data.UserId;
    // Visible
    const visibleElm = document.getElementById("visible");
    (this.data.Visible) ? visibleElm.setAttribute('checked', 'checked') : visibleElm.removeAttribute('checked');
    // Flagged
    const flaggedElm = document.getElementById("flagged");
    (this.data.Flagged) ? flaggedElm.setAttribute('checked', 'checked') : flaggedElm.removeAttribute('checked');
  }


  ////////////////////////////////////////////////
  // this functions saves the form!
  saveForm(e) {

    e.preventDefault();
    console.log("Save Form was run!");

    const payload = new FormData();
    const req = new XMLHttpRequest();
    const url = "/admin/" + this.data.id;

    // add stuff to form
    payload.append("id", document.getElementById("id").value);
    payload.append("created_at", document.getElementById("created_at").value);
    // thumbimage
    payload.append("Thumb", document.getElementById("thumb").filename);
    payload.append("Title", document.getElementById("title").value || "");
    payload.append("Description", document.getElementById("description").value || "");
    payload.append("Lng", document.getElementById("Lng").value);
    payload.append("Lat", document.getElementById("Lat").value);
    payload.append("userId", document.getElementById("userId").value);
    // https://stackoverflow.com/questions/10650233/checked-checked-vs-checked-true
    payload.append("Visible", document.getElementById("visible").checked);
    payload.append("Flagged", document.getElementById("flagged").checked);

    // post this request
    req.open("POST", url, false); // true); // third arg means async when true
    req.onreadystatechange = function() {
      if (req.readyState === 4 && req.status === 200) {
        // redirect has to be done here! Express cannot do redirect when ajax POST!
        window.location.href = '/admin';
      }
      else {
        console.log('There was a problem with the request.');
      }
    };

    req.send(payload);

    return false
  }
}


////////////////////////////////////////////////////////
// when DOM is loaded!
window.addEventListener("DOMContentLoaded", function() {

  const app = new adminSingleApp(data);
  app.init();

})
