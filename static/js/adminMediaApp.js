import { betterCreatedAt } from "./functions.js";


////////////////////////////////////////////////
class adminMediaApp {

  constructor(data) {
    this.data = data;
  }


  ////////////////////////////////////////////////
  // setup the table
  init() {
    // setup the table without sort
    console.log("Init was run!!");
    console.log("data:", this.data);
    this.updateSearchResults(this.data);

    let _this = this;
    function inputHandler() {

      console.log("input!")
      const sourceVal = source.value.toLowerCase();
  
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
        const email = _this.data[i].Email.toLowerCase();
        const userType = _this.data[i].UserType.toLowerCase();
        // SEARCH FOR MORE!
  
        let thisIndexMatched = false;
  
        // search Description
        if (email.indexOf(sourceVal) > -1) {
          // console.log("WE HAVE A DESCRIPTION!");
          thisIndexMatched = true;
        }
  
        // search Title
        if (userType.indexOf(sourceVal) > -1) {
          // console.log("WE HAVE A TITLE!!");
          thisIndexMatched = true;
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

    // listen for input
    const source = document.getElementById("query");    
    source.addEventListener('input', inputHandler);
    source.addEventListener('propertychange', inputHandler); // for IE8
  }


  ////////////////////////////////////////////////////////////////
  // fill the table with the right content
  // updateSearchResults(data, editFunc, deleteFunc) {
  updateSearchResults(data) {

    console.log("update!")
    // console.log("update -> data:", data); // works

    // clear the table area!
    const tblwrapper = document.getElementById("tableAreaWrapper");
    // console.log("tblwrapper:", tblwrapper);
    tblwrapper.innerHTML = "";


    // CHECK for empty array ************************************
    if (data.length == 0) {
      document.getElementById("resultMessage").classList.remove("hidden"); return;
    } else {
      document.getElementById("resultMessage").classList.add("hidden")
    }

    // make the table
    let tbl = document.createElement("table");
    tbl.id = "searchResultsTable";

    let theadElm = document.createElement('thead');
    let theadRowElm = document.createElement('tr');
    // th cols
    // id
    let idElm = document.createElement('th');
    idElm.innerText = 'Id';
    // createdElm
    let createdElm = document.createElement('th');
    createdElm.innerText = "created_at";
    // media type
    let mediaTypeElm = document.createElement('th');
    mediaTypeElm.innerText = 'MediaType';
    // url
    let urlElm = document.createElement('th');
    urlElm.innerText = 'Url';    
    // user id
    let userIdElm = document.createElement('th');
    userIdElm.innerText = 'UserId';
    // map item
    let mapItemID = document.createElement('th');
    mapItemID.innerText = 'MapItemId';
    // edit
    let editElm = document.createElement('th');
    editElm.innerText = 'Edit';    
    // let theadSixElm = document.createElement('th');
    // theadSixElm.innerText = 'Delete';  
    // append
    theadRowElm.appendChild(idElm);
    theadRowElm.appendChild(createdElm);
    theadRowElm.appendChild(mediaTypeElm);
    theadRowElm.appendChild(urlElm);
    theadRowElm.appendChild(userIdElm);
    theadRowElm.appendChild(mapItemID);
    theadRowElm.appendChild(editElm);

    theadElm.appendChild(theadRowElm);
    tbl.appendChild(theadElm);

    // tbody ****************************************************
    let tbodyElm = document.createElement('tbody');

    // loop through all map items
    for (let i=0; i < data.length; i++) {

      let tbodyRow = document.createElement('tr');

      // make my tds
      // id
      let idElm = document.createElement('td');
      idElm.innerText = data[i].id; // i;
      // created
      let createdElm = document.createElement('td');
      createdElm.innerText = betterCreatedAt(data[i].created_at);
      // media type
      let mediaTypeElm = document.createElement('td');
      mediaTypeElm.innerText = data[i].MediaType;
      // url
      let urlElm = document.createElement('td');
      urlElm.innerText = data[i].Url;
      // user id
      let userIdElm = document.createElement('td');
      userIdElm.innerText = data[i].UserId;
      // media item id
      let mapItemIdElm = document.createElement('td');
      mapItemIdElm.innerText = data[i].MapItemId;          
      // edit
      let editElm = document.createElement('td');
      let aElm = document.createElement('a');
      aElm.href = '/adminMedia/' + data[i].id;
      // aElm.addEventListener('click', e => { e.preventDefault(); editFunc(data[i]._id); })
      aElm.innerText = 'Edit';
      editElm.appendChild(aElm);
      // append
      tbodyRow.appendChild(idElm);
      tbodyRow.appendChild(createdElm);
      tbodyRow.appendChild(mediaTypeElm);
      tbodyRow.appendChild(urlElm);
      tbodyRow.appendChild(userIdElm);
      tbodyRow.appendChild(mapItemIdElm);
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



window.addEventListener("DOMContentLoaded", function() {

  console.log("adminIndex.js -> data:", data);
  const app = new adminMediaApp(data);
  app.init();

})
