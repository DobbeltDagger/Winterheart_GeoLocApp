if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
// const compression = require('compression')
// const minify = require('express-minify');
// const uglifyEs = require('uglify-es');
const express = require('express');
const path = require('path');
// const bodyParser = require('body-parser');
const { uniqueAlphaNumericId, getFilePath, makeIntoArray, getExtension, isVideo, isImage } = require("./serverFunctions.js");
// const cloudinary = require('./cloudinary')
const fs = require('fs-extra');
const cors = require('cors');
const {promisify} = require('util');
const getFileDetails = promisify(fs.stat);
const Busboy = require('busboy');
// const upload = require('./multer'); // not using this config!
const multer = require('multer');
const upload = multer();
const app = express()
// app.use(compression()) // https://www.npmjs.com/package/compression
// // https://www.npmjs.com/package/express-minify
// app.use(minify({
//   cache: __dirname + '/cache', // false,
//   uglifyJsModule: uglifyEs, // null,
//   errorHandler: null,
//   jsMatch: /js/, // /js/, // /javascript/,
//   cssMatch: /css/,
//   jsonMatch: /json/,
//   sassMatch: /scss/,
//   lessMatch: /less/,
//   stylusMatch: /stylus/,
//   coffeeScriptMatch: /coffeescript/,
// }));

// wares
// const axios = require('axios'); // is the only from the client side I should use this?
const sharp = require('sharp');

// login, admin
const flash = require("express-flash");
const session = require("express-session");
const bcrypt = require("bcrypt");
let users = []; // for bcrypt
const passport = require('passport');
const initializePassport = require('./passportConfig');
initializePassport(passport, username => {
  if (username === process.env.AUTH_username1) {
    return { username: process.env.AUTH_username1, password: process.env.AUTH_hashpassword1 }
  }
  if (username === process.env.AUTH_username2) {
    return { username: process.env.AUTH_username2, password: process.env.AUTH_hashpassword2 }
  }
});

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

// passports uses
app.use(flash());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());

// supabase
const {
  setupClient,
  writeMediaItem,
  findTheUser,
  writeLocationWithUser,
  loadSupaBaseLocations,
  loadSupaBaseMedia,
  loadSupaBaseUsers,
  updateSupaBaseLocations,
  updateSupaBaseMediaItem,
  updateSupaBaseUser
} = require('./supabase');
const supabase = setupClient();


////////////////////////////////////////////////
// index express route
app.get('/', async (req, res) => {
  const locs = await loadSupaBaseLocations(supabase)
  const media = await loadSupaBaseMedia(supabase)
  res.render('front', {
    Locations: JSON.stringify(locs), // that worked! - dont stringigy,
    MediaItems: JSON.stringify(media)
  });
});


////////////////////////////////////////////////
// GET DATA for reload of map
app.get('/get-data', async (req, res) => {
  const locs = await loadSupaBaseLocations(supabase)
  const media = await loadSupaBaseMedia(supabase)
  res.json({
    Locations: JSON.stringify(locs),
    MediaItems: JSON.stringify(media)
  });
});



/////////////////////////////////////////////////////////
// https://github.com/beforesemicolon/BFS-Projects/tree/multifile-resumable-uploader
app.post('/upload-request', (req, res) => {
	if (!req.body || !req.body.fileName) {
		res.status(400).json({message: 'Missing "fileName"'});
	} else {
		const fileId = uniqueAlphaNumericId();
		fs.createWriteStream(getFilePath(req.body.fileName, fileId), {flags: 'w'});
		res.status(200).json({fileId});
	}
});


/////////////////////////////////////////////////////////
app.get('/upload-status', (req, res) => {
	if(req.query && req.query.fileName && req.query.fileId) {
		getFileDetails(getFilePath(req.query.fileName, req.query.fileId))
			.then((stats) => {
				res.status(200).json({totalChunkUploaded: stats.size});
			})
			.catch(err => {
				console.error('failed to read file', err);
				res.status(400).json({message: 'No file with such credentials', credentials: req.query});
			});
	}
});


/////////////////////////////////////////////////////////
app.post('/upload', (req, res) => {
	const contentRange = req.headers['content-range'];
	const fileId = req.headers['x-file-id'];
  let collectFiles = new Map(); // [];
	
  // checks
	if (!contentRange) {
		console.log('Missing Content-Range');
		return res.status(400).json({message: 'Missing "Content-Range" header'});
	}
	if(!fileId) {
		console.log('Missing File Id');
		return res.status(400).json({message: 'Missing "X-File-Id" header'});
	}
	const match = contentRange.match(/bytes=(\d+)-(\d+)\/(\d+)/);
	if(!match) {
		console.log('Invalid Content-Range Format');
		return res.status(400).json({message: 'Invalid "Content-Range" Format'});
	}
	
	const rangeStart = Number(match[1]);
	const rangeEnd = Number(match[2]);
	const fileSize = Number(match[3]);
	
	if (rangeStart >= fileSize || rangeStart >= rangeEnd || rangeEnd > fileSize) {
		return res.status(400).json({message: 'Invalid "Content-Range" provided'});
	}
	
  // START BUSBOY
	const busboy = new Busboy({ headers: req.headers });
	
	busboy.on('file', (_, file, fileName) => {
    
    console.log("fileName:", fileName);

		const filePath = getFilePath(fileName, fileId);
		if (!fileId) { req.pause(); }
		
		getFileDetails(filePath)
			.then((stats) => {
				
				if (stats.size !== rangeStart) {
					return res
						.status(400)
						.json({message: 'Bad "chunk" provided'});
				}
				
				file
					.pipe(fs.createWriteStream(filePath, {flags: 'a'}))
					.on('error', (e) => {
						console.error('failed upload', e);
						res.sendStatus(500);
					});
			})
			.catch(err => {
				console.log('No File Match', err);
				res.status(400).json({message: 'No file with such credentials', credentials: req.query});
			})

    // Doing something with the data!
    // https://isamatov.com/node-js-busboy-reading-both-file-and-text-form-parameters/
    file.on('data', (data) => {
      if (typeof collectFiles.get(fileId) === 'undefined') {
        collectFiles.set(fileId, data);
      } else {
        collectFiles.set(fileId, Buffer.concat([collectFiles.get(fileId), data]));
      }
    });      
    // Completed streaming the file.
    file.on('end', function (stream) {
      //Here I need to get the stream to send to SQS
      console.log("collectFiles:", collectFiles);

      // https://www.npmjs.com/package/sharp
      const ext = getExtension(fileName);

      // check for image, not video
      if (isImage(fileName)) {
        // THIS IS IMAGE
        if (ext == 'jpg' || ext == "jpeg") {
          sharp(collectFiles.get(fileId))
            .resize(1400, 1024, {
              fit: sharp.fit.inside, // contain, without adding extra space around img
              withoutEnlargement: true
            })
            .jpeg({ quality: 70 })
            .toFile("./sharpUploads/file-" + fileId + "-" + fileName, (err, info) => {
              console.log("sharp used!");
              console.log("info:", info);
              if (err) console.error(err);
            });
        }
        else {
          sharp(collectFiles.get(fileId))
            .resize(1400, 1024, {
              fit: sharp.fit.inside, // contain, without adding extra space around img
              withoutEnlargement: true
            })
            .toFile("./sharpUploads/file-" + fileId + "-" + fileName, (err, info) => {
              console.log("sharp used!");
              console.log("info:", info);
              if (err) console.error(err);
            });
        }
      }
      else if (isVideo(fileName)) {
        // THIS IS VIDEO - WHAT DO I DO??
        console.log("VIDEO!!!!!!!!!!!!!!!!!!!!!!!");
        fs.writeFile("./sharpUploads/file-" + fileId + "-" + fileName, collectFiles.get(fileId), function() {
          console.log("Video file was written!");
        })
      }

    });
	});
	
	busboy.on('error', (e) => {
		console.error('failed upload', e);
		res.sendStatus(500);
	})
	
  busboy.on('finish', () => {
		res.sendStatus(200);
	});
	
	req.pipe(busboy);
});


/////////////////////////////////////////////////////////
// The upload.array("myMedia") is multer middleware. It makes formData accesible to express
// https://stackoverflow.com/questions/37630419/how-to-handle-formdata-from-express-4
app.post('/all-done', upload.array("myMedia"), async (req, res) => {

  console.log("ALL DONE! all files are uploaded!");
  
  const formData = req.body;
  console.log('formData (body):', formData); // these are the fields!
  const formFiles = req.files; // these are the files!
  // console.log("formFiles:", formFiles);

  // console.log("fileInfo:", req.body.fileInfo);
  const arrayFileInfo = makeIntoArray(req.body.fileInfo); // works
  // console.log("arrayFileInfo:", arrayFileInfo);
  const newFileInfo = arrayFileInfo.map( elm => JSON.parse(elm) );
  // console.log("newFileInfo:", newFileInfo);


  // user sharp to minimize files
  const urls = [];
  for (const file of formFiles) {

    // console.log("file:", file);
    const theFile = newFileInfo.filter( f => f.fileName == file.originalname ); // get the one with the right name!
    // console.log("theFile:", theFile);
    const filePath = getFilePath(file.originalname, theFile[0].fileId)
    // console.log("filePath:", filePath);
    // push to urls -> then write mediaItems!
    urls.push(filePath); // newPath)
  }
  console.log("urls:", urls);

  // WHAT IT REALLY NEEDS TO DO
  // Potentially store a new user with an email!
  // __ IF there is an email, store a new user - unless the email is already used!!!
  const user = await findTheUser(supabase, req.body.email);
  // Store the location point!!
  const location = await writeLocationWithUser(supabase, {
    Title: req.body.title || "",
    Description: req.body.description || "",
    Lat: req.body.lat,
    Lng: req.body.lng,
    UserId: user[0].id,
    Visible: true,
    Flagged: false,
    Thumb: "2.jpg"
  }); // content is an object!
  // Store the videos and images as media items! LAST POST NEEDS USER AND LOCATION!
  const mediaItem = await writeMediaItem(supabase, user, location, urls);
  // Reload only the map part of the front view!! - This is done client side!

  // GET THE NEW DATA! - reload map on client!
  const locs = await loadSupaBaseLocations(supabase)
  const media = await loadSupaBaseMedia(supabase)
  res.json({
    message: "Server is done...",
    Locations: locs, // that worked! - dont stringigy,
    MediaItems: media
  });
});


////////////////////////////////////////////////
// ADMIN area

// LOGIN
app.get('/login', checkNotAuthenticated, async (req, res) => {
  res.render('login');
});
// login codes posted to login route
app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/admin',
  failureRedirect: '/login',
  failureFlash: true
}));

// register (THIS is redundant)
app.get('/register', checkNotAuthenticated, async (req, res) => {
  res.render('register');
});

app.post("/register", checkNotAuthenticated, async (req, res) => {
  console.log("Here's something to register")
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    console.log("hashed:", hashedPassword)
    users.push({
      id: Date.now().toString(),
      name: req.body.username,
      email: req.body.email,
      password: hashedPassword
    })
    console.log("users:", users)
    res.redirect("/login");
  }
  catch {
    res.redirect("/register");
  }
});


// ADMIN ******************************************************
app.get('/admin', checkAuthenticated, async (req, res) => {
  const sbData = await loadSupaBaseLocations(supabase)
  res.render('admin', {
    data: JSON.stringify(sbData) // JSON.stringify(data)
  });
});
// SINGLE!
app.get('/admin/:id', checkAuthenticated, async (req, res) => {
  const sbData = await loadSupaBaseLocations(supabase);
  const singleItem = sbData.find( item => item.id == req.params.id); // dont use triple ===, just ==
  // console.log("singleItem:", singleItem); // testing
  res.render('adminSingle', { data: JSON.stringify(singleItem) });
});
// POST to single update!
app.post("/admin/:id", checkAuthenticated, upload.none(), async (req, res) => {
  console.log("req.body:", req.body);
  // console.log("req.files:", req.files); // empty!
  await updateSupaBaseLocations(supabase, req.body);
  // https://stackoverflow.com/questions/69146086/express-js-how-to-reload-page-after-inserting-data-to-the-database
  res.json({
    success: true
  })
})

// Admin media ******************************************************
app.get('/adminMedia', checkAuthenticated, async (req, res) => {
  const sbData = await loadSupaBaseMedia(supabase)
  res.render('adminMedia', { data: JSON.stringify(sbData) });
});
app.get('/adminMedia/:id', checkAuthenticated, async (req, res) => {
  const sbData = await loadSupaBaseMedia(supabase);
  const singleItem = sbData.find( item => item.id == req.params.id);
  res.render('adminMediaSingle', { data: JSON.stringify(singleItem) });
});
app.post("/adminMedia/:id", checkAuthenticated, upload.none(), async (req, res) => {
  console.log("req.body:", req.body);
  await updateSupaBaseMediaItem(supabase, req.body);
  res.json({ success: true })
});

// Admin users ******************************************************
app.get('/adminUsers', checkAuthenticated, async (req, res) => {
  const sbData = await loadSupaBaseUsers(supabase)
  res.render('adminUsers', { data: JSON.stringify(sbData) });
});
app.get('/adminUsers/:id', checkAuthenticated, async (req, res) => {
  const sbData = await loadSupaBaseUsers(supabase);
  const singleItem = sbData.find( item => item.id == req.params.id);
  res.render('adminUsersSingle', { data: JSON.stringify(singleItem) });
});
app.post("/adminUsers/:id", checkAuthenticated, upload.none(), async (req, res) => {
  console.log("req.body:", req.body);
  await updateSupaBaseUser(supabase, req.body);
  res.json({ success: true })  
})



// passport middleware, for users authenticated
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next() }
  res.redirect('/login');
}
// for users NOT authenticated
function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return res.redirect('/') }
  next();
}


// start listening
const PORT = 3000;
app.listen(PORT, function() {
  console.log(`Server is listening on port ${PORT}`);
});


////////////////////////////////////////////////
// export app to server.js
// module.exports = app;