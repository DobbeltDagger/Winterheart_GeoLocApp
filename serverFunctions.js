const sharp = require("sharp");


/////////////////////////////////////////////////////////
// from busby example
const uniqueAlphaNumericId = (() => {
	const heyStack = '0123456789abcdefghijklmnopqrstuvwxyz';
	const randomInt = () => Math.floor(Math.random() * Math.floor(heyStack.length));
	return (length = 24) => Array.from({length}, () => heyStack[randomInt()]).join('');
})();


/////////////////////////////////////////////////////////
// from busby example
// const getFilePath = (fileName, fileId) => {
const getFilePath = (fileName, fileId) => {
  return `./uploads/file-${fileId}-${fileName}`; // this path might be wrong! because public!
  // return `${folder}file-${fileId}-${fileName}`; // this path might be wrong! because public!
}


/////////////////////////////////////////////////////////
// If i have an object, I want it to be inside an array!
// https://stackoverflow.com/questions/53235849/how-to-check-if-variable-is-an-object-or-an-array
const makeIntoArray = (obj) => {
  if (Object.prototype.toString.call(obj).indexOf("Array")>-1) {
    return obj // this is already array
  } else {
    return Array(obj) // this is not array
  }
}


/////////////////////////////////////////////////
// for file urls
const getExtension = (filename) => {
  var parts = filename.split('.');
  return parts[parts.length - 1];
}


/////////////////////////////////////////////////
// for file urls
const isImage = (filename) => {
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


/////////////////////////////////////////////////
// for file urls
const isVideo = (filename) => {
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


/////////////////////////////////////////////////////////
module.exports = {
  uniqueAlphaNumericId,
  getFilePath,
  makeIntoArray,
  getExtension,
  isImage,
  isVideo,
}