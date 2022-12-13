import { getTheLocationFromDataset } from "./geoFindMe.js";
import { getExtension, isImage, isVideo, validateEmail } from "./functions.js";
import { showUploadForm, showOverlay } from "./menu.js";
import { uploadAndTrackFiles } from "./uploader.js";



/////////////////////////////////////////////////////////
// setup mediaOverlayForm validation
const setupMediaUploadForm = (reloadMapCallback) => {


  const mediaForm = document.getElementById("mediaForm");

  //////////////////////////////
  // form validation
  function processmediaForm(e) {
    e.preventDefault();

    let errors = []; // for error handling
    console.log("MediaForm submit was run!")

    // check fields here! - an alert if wrong!

    // if all is good *******************************************
    if (errors.length === 0) {
      // showOverlay("mediaUpload"); // set the state!

      showUploadForm();

      const files = document.getElementById("myMedia").files;
      uploadAndTrackFiles(files, function() {
        reloadMapCallback();
      });
    }
    return false;
  }  

  // attach to submit
  if (mediaForm.attachEvent) { mediaForm.attachEvent("submit", processmediaForm); }
  else { mediaForm.addEventListener("submit", processmediaForm); }  

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
  document.getElementById("filesOverviewWrapper").innerHTML = "";

  mform.classList.remove("formHidden");
  // document.getElementById("uploadProcessingWrapper").classList.remove("shown");

  // hide reload button again
  document.getElementById("reloadBtnWrapper").classList.remove("shown");
}


//////////////////////////////
// export setup menu
export {
  setupMediaUploadForm,
  clearForm
}