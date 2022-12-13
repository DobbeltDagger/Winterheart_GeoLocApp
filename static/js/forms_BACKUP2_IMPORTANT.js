import { getTheLocationFromDataset } from "./geoFindMe.js";
import { getExtension, isImage, isVideo, validateEmail } from "./functions.js";
import { showProgressDisplay, showProcessingDisplay } from "./menu.js";



/////////////////////////////////////////////////////////
// setup mediaOverlayForm validation
const setupMediaUploadForm = (reloadMapCallback) => {

  const mediaForm = document.getElementById("mediaForm");

  // form validation
  function processmediaForm(e) {
    e.preventDefault();

    let errors = []; // for error handling
    console.log("MediaForm submit was run!")

    // check files
    const myMedia = mediaForm.elements['myMedia'].files; //.value
    console.log("myMedia:", myMedia);
    if (myMedia.length > 0) {

      // CHECK fileformats here
      const check = checkFileFormats(myMedia);
      if (check.itsOk === false) {
        document.getElementById("alertFiles").innerHTML = check.message; // ITS REALLY NOT GOOD! - we have some weird format in there!
      } else {
        document.getElementById("alertFiles").innerHTML = "";
        console.log("Files are good!")
      }
    }
    else {
      document.getElementById("alertFiles").innerText = "Please select files before submitting form";
      errors.push("files");
    }
    
    // check title

    // check text

    // check email
    const email = mediaForm.elements['email'].value;
    console.log("email:", email);
    if (email !== "") { // It's ok for email to be blank
      if (validateEmail(email)) {
        document.getElementById("alertEmail").innerHTML = "";
        console.log("email is good!")
      } else {
        document.getElementById("alertEmail").innerText = "Please type in a correct email"
        errors.push("email");
      }
    }

    // if all is good
    if (errors.length === 0) {
      // turn on progress bar!
      showProgressDisplay();
      // ajaxPostForm(mediaForm, function() {
      ajaxPostForm(function() {
        // form is saved - reload map!
        // console.log("arguments:", arguments[0])
        // const locations = arguments[0].Locations;
        // const media = arguments[0].MediaItems;
        // console.log("locations:", locations)
        // console.log("media:", media)
        // await reloadMap(locations, media);
        reloadMapCallback(arguments[0]);
      });
      console.log("Yes! Form is submitted!");
    }

    return false;
  }

  // attach to submit
  if (mediaForm.attachEvent) { mediaForm.attachEvent("submit", processmediaForm); }
  else { mediaForm.addEventListener("submit", processmediaForm); }

}


/////////////////////////////////////////////////////////
// make overview of files in progress window!
const buildFileOverview = (fileArray) => {
  const fileWrapper = document.querySelector("#uploadProgressWrapper .filesWrapper");
  fileWrapper.innerHTML = "";
  for (let i=0; i < fileArray.length; i++) {
    const line = document.createElement("div");
    const size = (fileArray[i].size / (1024*1024)).toFixed(2);
    line.innerHTML = `${fileArray[i].name}<div class="size">${size}mb</div>`;
    fileWrapper.appendChild(line);
  }
}


/////////////////////////////////////////////////////////
// Ill skip redirect, therefore I send dat from form! AJAX!
// from here: https://stackoverflow.com/questions/50152966/post-method-to-send-form-data-with-ajax-without-jquery
// const ajaxPostForm = (mediaForm, callback) => {
const ajaxPostForm = (callback) => {

  // let progressBar = { max: 0, value: 0 }; // Is this smart?
  const progressBar = document.getElementById("progressBar");
  const progressBarText = document.getElementById("progressBarText");
  // get files
  const files = document.getElementById("myMedia").files;
  buildFileOverview(files); // build file overview


  const request = new XMLHttpRequest();

  // construct new formData object
  const payload = new FormData();
  for (let i=0; i < files.length; i++) {
    console.log("file", files[i]);
    payload.append("myMedia", files[i]);
  }
  payload.append("title", document.querySelector("#mediaForm #title").value)
  payload.append("description", document.querySelector("#mediaForm #text").value)
  payload.append("email", document.querySelector("#mediaForm #email").value)
  // Append the Lat, Lng, Accuracy values in FormData payload before sending!
  const loc = getTheLocationFromDataset();
  payload.append("lng", loc.lng)
  payload.append("lat", loc.lat)
  // payload.append("accuracy", loc.accuracy)
  console.log("payload lng:", payload.get("lng"));


  // progress 
  request.upload.addEventListener("progress", function(e) {
    const percentComplete = (e.loaded / e.total) * 100;
    console.log("percentComplete:", percentComplete);
    progressBar.setAttribute("value", percentComplete);
    const round = Math.round(percentComplete)
    progressBarText.innerText = round + "%"; // update progressbar text!

    // Look for percent 100
    if (round == 100) {
      console.log("PERCENT IS 100! - turn on new overlay!");
      showProcessingDisplay();
    }
  })

  request.open("POST", "/upload-images", true); // third arg means async when true
  // request.open("POST", "/busboy-test", true); // third arg means async when true
  // request.setRequestHeader("Content-Type", "application/json"); // ONLY works without headers
  request.onreadystatechange = function() {
    if (request.readyState === 4 && request.status === 200) {
      var jsonData = JSON.parse(request.response);
      // console.log(jsonData);
      // TRYING TO AVOID MEM LEAKS IN CHROME!
      // payload = null; // clear paylod! - DONT CLEAR PAYLOAD!!
      // request.abort(); // kill request! DONT DO THIS - REQUEST CANNOT CLEAN ITSELF UP!!
      callback(jsonData);
    }
    // Fires before the download!
    else {
      console.log('There was a problem with the request.');
    }
  };

  
  // var formdata = new FormData(mediaForm); // OLD! - get it out!
  request.send(payload); // formdata);
}


/////////////////////////////////////////////////////////
// check whether I have the right formats
const checkFileFormats = (files) => {

  let itsOk = false;
  let message = "";

  // Loop through files
  for (let i = 0; i < files.length; i++) {
    
    // check format
    if ( isImage(files[i].name) || isVideo(files[i].name) ) {
      // its good
    } else {
      const ext = getExtension(files[i].name);
      // if (message == "") { message += "Don't upload "}
      message += `.${ext} files are not allowed.<br/>`; // . These are ok: jpg, gif, bmp, png, m4v, avi, mpg or mp4. `;
      itsOk = false;
    }

    // check size - 50MB
    const fileLimit = (50 * 1024 * 1024); // THIS IS WHERE I SET THE LIMIT!
    console.log("fileLimit", fileLimit);
    const fileLimitMb = Math.floor(fileLimit / (1024*1024));
    // check
    if ( files[i].size > fileLimit ) {
      const size = (files[i].size / (1024*1024)).toFixed(2); // ((files[i].size / 1024) / 1024) + "MB";
      // if (message !== "") { message+= "<br/>" };
      message += `One file is ${size}MB. File uploads cannot be larger than ${fileLimitMb}MB large.<br/>`;
      itsOk = false;
    }
  }

  return {
    itsOk,
    message
  };
}


/////////////////////////////////////////////////////////
// clear the uploadForm
const clearForm = () => {

  console.log("clearForm was RUN!")
  const mform = document.getElementById("mediaForm");
  document.getElementById("myMedia").value = "";
  document.querySelector("#mediaForm #title").value = "";
  document.querySelector("#mediaForm #text").value = "";
  document.querySelector("#mediaForm #email").value = "";

  // remove files from uploadProgress!
  document.querySelector("#uploadProgressWrapper .filesWrapper").innerHTML = "";
  document.querySelector("#progressBarWrapper progress").value = 0;
  document.getElementById("progressBarText").innerText = "0%";

  mform.classList.remove("formHidden");
  document.getElementById("uploadProcessingWrapper").classList.remove("shown");
}


//////////////////////////////
// export setup menu
export {
  setupMediaUploadForm,
  clearForm
}

