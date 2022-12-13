if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const express = require('express');
const path = require('path');
// const bodyParser = require('body-parser');
// const { uniqueAlphaNumericId, getFilePath, makeIntoArray, getExtension, isVideo, isImage } = require("./serverFunctions.js");
// const cloudinary = require('./cloudinary')
// const fs = require('fs-extra');
const cors = require('cors');
const app = express()

// Load view engine
app.engine('pug', require('pug').__express)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// app.use(cors());

// KEEP USING STATIC! - dont use compression + minify! my json is old!
app.use(express.static(__dirname + '/static'));
// app.use(express.static('public')); // use public folder for static files


// form config - https://www.youtube.com/watch?v=-RCnNyD0L-s
// app.use(bodyParser.json({limit: '80mb'}));
// app.use(bodyParser.urlencoded({limit: '80mb', extended: false})); // false}))
app.use(express.json());
app.use(cors());


////////////////////////////////////////////////
// index express route
app.get('/', async (req, res) => {
  res.render('front');
});


// start listening
const PORT = 3000;
app.listen(PORT, function() {
  console.log(`Server is listening on port ${PORT}`);
});


////////////////////////////////////////////////
// export app to server.js
// module.exports = app;