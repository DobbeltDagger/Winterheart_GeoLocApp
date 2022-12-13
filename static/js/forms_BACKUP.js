import { getTheLocationFromDataset } from "./geoFindMe.js";
import { getExtension, isImage, isVideo, validateEmail } from "./functions.js";
import { showProgressDisplay } from "./menu.js";



/////////////////////////////////////////////////////////
// setup mediaOverlayForm validation
const setupMediaUploadForm = (reloadMapCallback) => {

  const mediaForm = document.getElementById("mediaForm");

  // form validation
  function processmediaForm(e) {
    e.preventDefault();

    // Put the Lat, Lng, Accuracy values in form before sending!
    const loc = getTheLocationFromDataset();
    mediaForm.elements['lng'].value = loc.lng;
    mediaForm.elements['lat'].value = loc.lat;
    mediaForm.elements['accuracy'].value = loc.accuracy;


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
      ajaxPostForm(mediaForm, function() {
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
// Ill skip redirect, therefore I send dat from form! AJAX!
// from here: https://stackoverflow.com/questions/50152966/post-method-to-send-form-data-with-ajax-without-jquery
const ajaxPostForm = (mediaForm, callback) => {

  let progressBar = { max: 0, value: 0 }; // Is this smart?

  var request = new XMLHttpRequest();
  var url = "/upload-images";
  request.upload.addEventListener("progress", function(pe) {
    // pe is progressEvent
    if (pe.lengthComputable) {
      progressBar.max = pe.total
      progressBar.value = pe.loaded
    }
    console.log("progressBar:", progressBar);    
  })
  request.open("POST", url, true);
  // request.setRequestHeader("Content-Type", "application/json"); // ONLY works without headers
  request.onreadystatechange = function () {
    if (request.readyState === 4 && request.status === 200) {
      var jsonData = JSON.parse(request.response);
      // console.log(jsonData);
      callback(jsonData);
    }
    // Fires before the download!
    else {
      console.log('There was a problem with the request.');
    }
  };

  /*
  // pe = progressEvent
  request.onprogress = (pe) => {
    if (pe.lengthComputable) {
      progressBar.max = pe.total
      progressBar.value = pe.loaded
    }
    console.log("ProgressEvent:", pe);
  }
  */

  /*
  // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest
  request.addEventListener("progress", function updateProgress(event) {
    if (event.lengthComputable) {
      const percentComplete = (event.loaded / event.total) * 100;
      console.log("percentComplete:", percentComplete);
      // ...
    } else {
      // Unable to compute progress information since the total size is unknown
    }
  });
  */
  
  var formdata = new FormData(mediaForm);
  request.send(formdata);

}


/////////////////////////////////////////////////////////
// check whether I have the right formats
const checkFileFormats = (files) => {

  let itsOk = false;
  let message = "";

  /*
  function getExtension(filename) {
    var parts = filename.split('.');
    return parts[parts.length - 1];
  }
  
  function isImage(filename) {
    var ext = getExtension(filename);
    switch (ext.toLowerCase()) {
      case 'jpg':
      // case 'gif':
      case 'bmp':
      case 'png':
      // case 'webp':
        //etc
        return true;
    }
    return false;
  }
  
  function isVideo(filename) {
    var ext = getExtension(filename);
    switch (ext.toLowerCase()) {
      case 'm4v':
      case 'avi':
      case 'mpg':
      case 'mp4':
        // etc
        return true;
    }
    return false;
  }
  */

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


//////////////////////////////
// export setup menu
export {
  setupMediaUploadForm
}

