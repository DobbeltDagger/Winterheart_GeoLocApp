////////////////////////////////////////////////
class adminApp {

  constructor(data) {
    this.data = data;
  }


  ////////////////////////////////////////////////
  // setup the table
  init() {
    // setup the table without sort
    console.log("Init was run");
    console.log("data:", this.data);
    // this.setupSearchField();
    this.updateSearchResults(this.data);


    const source = document.getElementById("query");
    let _this = this;
    function inputHandler() {

      const sourceVal = source.value.toLowerCase();
      console.log("")      

      const rowItems = document.querySelectorAll("#searchResultsTable tbody tr");

      // check for more than two letters
      if (source.value.length < 3) {
        // do i have all rows rendered already?
        if (rowItems.length == _this.data.length) { return }
        else { _this.updateSearchResults(_this.data); return }
      };

      // console.log("InputHandler -> value:", source.value); // Works!

      // find what array items matches input value
      let matches = [];

      for (let i = 0; i < _this.data.length; i++) {
        const desc = _this.data[i].Description.toLowerCase();
        const title = _this.data[i].Title.toLowerCase();
        const images = _this.data[i].Images;
        console.log("images:", images);
        const videos = _this.data[i].Videos;
        console.log("videos:", videos);

        let thisIndexMatched = false;

        // search Description
        if (desc.indexOf(sourceVal) > -1) {
          // console.log("WE HAVE A DESCRIPTION!");
          thisIndexMatched = true;
        }

        // search Title
        if (title.indexOf(sourceVal) > -1) {
          // console.log("WE HAVE A TITLE!!");
          thisIndexMatched = true;
        }

        // Images
        if (typeof images !== "undefined" && images !== null) {
          for (let j = 0; j < images.length; j++) {
            // check img url
            if (typeof images[j].url !== 'undefined' && images[j].url !== null) {
              if (images[j].url.indexOf(sourceVal) > -1) {
                thisIndexMatched = true;
              }
            }
            // check img url
            if (typeof images[j].thumb !== 'undefined' && images[j].thumb !== null) {
              if (images[j].thumb.indexOf(sourceVal) > -1) {
                thisIndexMatched = true;
              }
            }            
          }
        }

        // Videos
        if (typeof videos !== "undefined" && videos !== null) {
          for (let v = 0; v < videos.length; v++) {
            console.log("vid:", videos[v].url);
            // check vid url
            if (typeof videos[v].url !== 'undefined' && videos[v].url !== null) {
              if (videos[v].url.indexOf(sourceVal) > -1) {
                // console.log("WE HAVE A VIDEO!")
                thisIndexMatched = true;
              }
            }
            // check vid thumb
            if (typeof videos[v].thumb !== 'undefined' && videos[v].thumb !== null) {
              if (videos[v].thumb.indexOf(sourceVal) > -1) {
                // console.log("WE HAVE A VIDEO!")
                thisIndexMatched = true;
              }
            }
          }
        }

        // if we have a match somewhere, push it!
        if (thisIndexMatched) {
          matches.push(_this.data[i])
        }
      }

      // put matches in table!
      if (rowItems.length == matches.length) { return }
      else { _this.updateSearchResults(matches); return }      
    }
    
    source.addEventListener('input', inputHandler);
    source.addEventListener('propertychange', inputHandler); // for IE8
  }


  ////////////////////////////////////////////////////////////////
  // fill the table with the right content
  // updateSearchResults(data, editFunc, deleteFunc) {
  updateSearchResults(data) {

    // clear the table area!
    const tblwrapper = document.getElementById("tableAreaWrapper")
    tblwrapper.innerHTML = "";

    // CHECK for empty array ************************************
    if (data.length == 0) {
      document.getElementById("resultMessage").classList.remove("hidden")
      return;
    } else {
      document.getElementById("resultMessage").classList.add("hidden")
    }


    let tbl = document.createElement("table");
    tbl.id = "searchResultsTable";

    // let tbl = document.getElementById('searchResultsTable');
    // tbl.innerHTML = '';

    let theadElm = document.createElement('thead');
    let theadRowElm = document.createElement('tr');
    // th cols
    // thumb
    let thumbElm = document.createElement('th');
    thumbElm.innerText = 'Thumb';
    // id
    let idElm = document.createElement('th');
    idElm.innerText = 'Id';
    // title
    let titleElm = document.createElement('th');
    titleElm.innerText = 'Title';
    // decription
    let descElm = document.createElement('th');
    descElm.innerText = 'Description';
    // lat
    let latElm = document.createElement('th');
    latElm.innerText = 'Lat';
    // Lng
    let lngElm = document.createElement('th');
    lngElm.innerText = 'Lng';
    /*
    // images
    let imagesElm = document.createElement('th');
    imagesElm.innerText = 'Images';
    // videos
    let videosElm = document.createElement('th');
    videosElm.innerText = "Videos";
    */
    // createdElm
    let createdElm = document.createElement('th');
    createdElm.innerText = "Created at";
    // madeby
    let madebyElm = document.createElement('th');
    madebyElm.innerText = 'Made By UID';
    // visible
    let visibleElm = document.createElement('th');
    visibleElm.innerText = 'Visible';
    // edit
    let editElm = document.createElement('th');
    editElm.innerText = 'Edit';
    // let theadSixElm = document.createElement('th');
    // theadSixElm.innerText = 'Delete';  
    // append
    theadRowElm.appendChild(idElm);
    theadRowElm.appendChild(thumbElm);
    theadRowElm.appendChild(titleElm);
    theadRowElm.appendChild(descElm);
    theadRowElm.appendChild(latElm);
    theadRowElm.appendChild(lngElm);
    // theadRowElm.appendChild(imagesElm);
    // theadRowElm.appendChild(videosElm);
    theadRowElm.appendChild(createdElm);
    theadRowElm.appendChild(madebyElm);
    theadRowElm.appendChild(visibleElm);
    theadRowElm.appendChild(editElm);
    // theadRowElm.appendChild(theadSixElm);

    theadElm.appendChild(theadRowElm);
    tbl.appendChild(theadElm);




    // tbody ****************************************************
    let tbodyElm = document.createElement('tbody');

    // loop through all map items
    for (let i=0; i < data.length; i++) {
      let tbodyRow = document.createElement('tr');

      // make my tds
      // thumb
      let thumbElm = document.createElement('td');
      const thumb = document.createElement('img');
      thumb.src = "./images/" + data[i].Thumb;
      thumb.classList.add("formMediaThumb");
      thumbElm.appendChild(thumb);
      // id
      let idElm = document.createElement('td');
      idElm.innerText = data[i].id; // i;
      // title
      let titleElm = document.createElement('td');
      titleElm.innerText = data[i].Title;
      // short desc
      let descElm = document.createElement('td');
      const shortDesc = (typeof data[i].Description !== 'undefined') ? data[i].Description.substring(0, 50) + "..." : "not defined";
      descElm.innerText = shortDesc;
      // lat
      let latElm = document.createElement('td');
      latElm.innerText = data[i].Lat;
      // lng
      let lngElm = document.createElement('td');
      lngElm.innerText = data[i].Lng;
      /*
      // images
      let imagesElm = document.createElement('td');
      let imgtxt = "";
      if (typeof data[i].Images === "undefined" || data[i].Images === null) {
        imagesElm.innerText = "-";
      } else {
        data[i].Images.forEach( img => imgtxt += "'" + img.url + "', ")
        imagesElm.innerText = imgtxt;
      }
      // Videos
      let videosElm = document.createElement('td');
      let txt = "";
      if (typeof data[i].Videos === "undefined" || data[i].Videos === null) {
        videosElm.innerText = "-";
      } else {
        data[i].Videos.forEach( vid => txt += "'" + vid.url + "', ") // testing
        videosElm.innerText = txt;
      }
      */
      // created
      let createdElm = document.createElement('td');
      createdElm.innerText = data[i].created_at;
      // made by user
      let madebyElm = document.createElement('td');
      madebyElm.innerText = data[i].MadeByUserId;
      // is visible
      let visibleElm = document.createElement('td');
      visibleElm.innerText = data[i].isVisible;
      // edit
      let editElm = document.createElement('td');
      let aElm = document.createElement('a');
      aElm.href = '/admin/' + data[i].id;
      // aElm.addEventListener('click', e => { e.preventDefault(); editFunc(data[i]._id); })
      aElm.innerText = 'Edit';
      editElm.appendChild(aElm);
      // delete
      /*
      let deleteElm = document.createElement('td');
      let dElm = document.createElement('a');
      dElm.href = '#';
      dElm.addEventListener('click', e => { e.preventDefault(); deleteFunc(data[i]._id); })
      dElm.innerText = 'Delete';
      deleteElm.appendChild(dElm);
      */
      // append
      tbodyRow.appendChild(idElm);
      tbodyRow.appendChild(thumbElm);
      tbodyRow.appendChild(titleElm);
      tbodyRow.appendChild(descElm);
      tbodyRow.appendChild(latElm);
      tbodyRow.appendChild(lngElm);
      // tbodyRow.appendChild(imagesElm);
      // tbodyRow.appendChild(videosElm);
      tbodyRow.appendChild(createdElm);
      tbodyRow.appendChild(madebyElm);
      tbodyRow.appendChild(visibleElm);
      tbodyRow.appendChild(editElm);
      // tbodyRow.appendChild(deleteElm); // no delete for now
      // end the row
      tbodyElm.appendChild(tbodyRow);
    }

    // finally put it together
    tbl.appendChild(tbodyElm);
    tblwrapper.appendChild(tbl);

  }


}
