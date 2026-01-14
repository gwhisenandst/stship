let n = 0;
let t = 0;
let f = 0;
let ap = 0;
let itemCountFlag = 0;
let runOnceFlag = 0;

//change this to 0 if don't need order commit, etc. change to 1 if do
let salesOrderStuff = 1;
let shipStationHandoff = 1;
let preloadHandoff = 1;
if (localStorage.order == undefined) {
	localStorage.order = "false";
	localStorage.ship = "false";
	localStorage.preload = "false";
}

//checkbox options
function checkboxes() {
	let siblingBefore = document.getElementsByClassName("nav navbar-nav navbar-left")[0];
	let newCheckbox = document.createElement("input");
	newCheckbox.type = "checkbox";
	newCheckbox.id = "orderCommit";
	let newCheckbox2 = document.createElement("input");
	newCheckbox2.type = "checkbox";
	newCheckbox2.id = "openShip";
	let newCheckbox3 = document.createElement("input");
	newCheckbox3.type = "checkbox";
	newCheckbox3.id = "preloadShip";
	let divCheck1 = document.createElement("div");
	let divCheck2 = document.createElement("div");
	let divCheck3 = document.createElement("div");
	divCheck1.innerText = "Order Processing ";
	divCheck2.innerText = "Open Shipstation ";
	divCheck2.id = "ship_station_toggle";
	divCheck3.innerText = "Preload Shipstation ";
	divCheck3.id = "preload_toggle";
	divCheck1.appendChild(newCheckbox);
	divCheck2.appendChild(newCheckbox2);
	divCheck3.appendChild(newCheckbox3);
	let divOptions = document.createElement("div");
	divOptions.appendChild(divCheck1);
	divOptions.appendChild(divCheck2);
	divOptions.className = "cust_checkbox";
	let divOptions2 = document.createElement("div");
	let divBr = document.createElement("br");
	divOptions2.appendChild(divBr);
	divOptions2.appendChild(divCheck3);
	divOptions2.className = "cust_checkbox2";
	
	siblingBefore.parentElement.insertBefore(divOptions, siblingBefore);
	siblingBefore.parentElement.insertBefore(divOptions2, siblingBefore);
	
	if (localStorage.ship == "true") {
		shipStationHandoff = 1;
		document.getElementById("openShip").checked = true;
		//document.getElementById("preload_toggle").style.display = "block";
	} else {
		shipStationHandoff = 0;
		preloadHandoff = 0;
		document.getElementById("openShip").checked = false;
		document.getElementById("preloadShip").checked = false;
		document.getElementById("preload_toggle").style.display = "none";
	}
	
	if (localStorage.order == "true") {
		salesOrderStuff = 1;
		document.getElementById("orderCommit").checked = true;
		document.getElementById("ship_station_toggle").style.display = "block";
	} else {
		salesOrderStuff = 0;
		shipStationHandoff = 0;
		preloadHandoff = 0;
		document.getElementById("orderCommit").checked = false;
		document.getElementById("openShip").checked = false;
		document.getElementById("preloadShip").checked = false;
		document.getElementById("ship_station_toggle").style.display = "none";
		document.getElementById("preload_toggle").style.display = "none";
	}
	
	if (localStorage.preload == "true") {
		preloadHandoff = 1;
		document.getElementById("preloadShip").checked = true;
	} else {
		preloadHandoff = 0;
		document.getElementById("preloadShip").checked = false;
	}
	
	document.getElementById("orderCommit").addEventListener('change', function() {
		if(this.checked) {
			document.getElementById("ship_station_toggle").style.display = "block";
			document.getElementById("openShip").checked = false;
			document.getElementById("preloadShip").checked = false;
		} else {
			document.getElementById("ship_station_toggle").style.display = "none";
			document.getElementById("preload_toggle").style.display = "none";
			localStorage.ship = this.checked;
			localStorage.preload = this.checked;
		}
		localStorage.order = this.checked;
	});
	
	document.getElementById("openShip").addEventListener('change', function() {
		if (this.checked) {
			//document.getElementById("preload_toggle").style.display = "block";
			document.getElementById("preloadShip").checked = false;
		} else {
			document.getElementById("preload_toggle").style.display = "none";
			localStorage.preload = this.checked;
		}
		localStorage.ship = this.checked;
	});
	
	
	document.getElementById("preloadShip").addEventListener('change', function() {
		localStorage.preload = this.checked;
	});
}

//Sales Order Stuff===========================================================================================
function commitShip() {
	if (document.URL.indexOf("new") == -1 && document.URL.indexOf("orders/") > -1) {
		let pageobserver;
		let page;
		
		//Copy transaction number
		let tn = document.evaluate("//*[contains(text(),'Transaction Number:')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.innerText.split("Transaction Number: ")[1];
		//navigator.clipboard.writeText(tn);
		
		//preload but cant open in background, so disabled for now
		if (shipStationHandoff == 1 && preloadHandoff == 1) {
			window.open("https://ship11.shipstation.com/scan?[" + Date(Date.now()) + "]ordernumber=${" + tn + "}", "_blank");  
		}
		
		//prefetch shipstaion page, may do nothing?
		let link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = "https://ship11.shipstation.com/scan?[" + Date(Date.now()).replaceAll(" ", "%20") + "]ordernumber=${" + tn + "}";
    link.as = 'document'; // Set as 'document' for entire pages
    document.head.appendChild(link);
	
		//document.querySelector(`[placeholder="Search by ID, transaction number, or ESN"]`).focus();
		//document.querySelector(`[placeholder="Search by ID, transaction number, or ESN"]`).select();
	  // This code will execute after the entire page has loaded.
	  //setTimeout(()=>{},400);
	  /*
		xobserver.observe(xtarget, {
		  childList: true,
		  subtree: true,
		});
		*/
		
		f = 1;
		
		if (salesOrderStuff == 1) {
			//target the search bar for changes
			page = document.body;
			
			//what to do when the search bar changes
			pageobserver = new MutationObserver((mutations) => {
			  mutations.forEach((mutation) => {
			    if(document.getElementsByClassName("table table-bordered table-striped dataTable")[0].lastElementChild.children.length > 2) {
			    	console.log("order loaded!");
			    	document.getElementById("commit_inventory").classList.remove("fade");
			    	ytarget = document.getElementsByClassName("mt-1")[3];
				    if(document.getElementById("commit_inventory_menu_button")){
				    	if(document.getElementsByTagName("tbody")[0].lastChild.previousElementSibling.children[2].innerText=='0' && itemCountFlag == 0 && document.getElementsByClassName("alert text-center")[0].firstChild.innerText!="Shipped") {
				    		//Loop through each item in the order, if element has a class, check the quantity on the order. Seems if it has class it has SKU, which works for the goal here
				    		for (i=0;i<document.getElementsByClassName("dataTable")[0].lastChild.children.length;i++){
						    	if (document.getElementsByClassName("dataTable")[0].lastChild.children[i].hasAttribute("class")){
						    			n = n + Number(document.getElementsByClassName("dataTable")[0].lastChild.children[i].children[4].firstChild.innerText);
						    		if (document.getElementsByClassName("dataTable")[0].lastChild.children[i].children[1].children[0].textContent.startsWith("Apple Pencil")) {
						    			ap++;
						    		}
						    	}
					    	}
					    	itemCountFlag = 1;
					    	//console.log(n);
				    		//Wait a small bit and click the "Commit Inventory" button
				    		setTimeout(()=>{
				    			document.getElementById("commit_inventory_menu_button").click();
				    		},100);
				    	} else if (document.getElementsByTagName("tbody")[0].lastChild.previousElementSibling.children[2].innerText>0) {
				    		if(document.getElementsByClassName("alert text-center")[0].firstChild.innerText=="Ready to Pick") {
				    		//Click and open the status change menu
				    		document.getElementsByClassName("alert text-center")[0].click();
				    		//Click the "Shipped", ie: last element in the list. If this changes, this will break
				    		document.getElementsByClassName("results dropdown-menu col-xs-12")[0].lastChild.click();
				    		}
				    		if (runOnceFlag ==0) {
				    			openShipButton();
				    		}
				    	}
				    }
				    /*
				    for (i=0;i<document.getElementsByClassName("dataTable")[0].lastChild.children.length;i++){
				    	if (document.getElementsByClassName("dataTable")[0].lastChild.children[i].hasAttribute("class")){
				    			n = n + Number(document.getElementsByClassName("dataTable")[0].lastChild.children[i].children[4].firstChild.innerText);
				    		if (document.getElementsByClassName("dataTable")[0].lastChild.children[i].children[1].children[0].textContent.startsWith("Apple Pencil")) {
				    			ap++;
				    		}
				    	}
			    	}
			    	*/
			    	document.getElementsByTagName("textarea")[0].addEventListener("input", function (e) {
			    	//setTimeout(() => {}, 10);
			    	t = document.getElementsByTagName("textarea")[0].value.split('\n').length-1;
			    	//console.log(document.getElementsByTagName("textarea")[0].value);
			    	if (ap > 0 && document.getElementsByTagName("textarea")[0].value.split('\n')[t] == "S") {
			    		document.execCommand('delete');
			    		ap--;
			    	}
			  		if (n > 0 && t == n) {
			    		navigator.clipboard.writeText(document.getElementsByTagName("textarea")[0].value);
							f = 1;
							yobserver.observe(ytarget, {
							  childList: true,
							  subtree: true,
							});
			    		for(i=0;i<document.getElementsByClassName("btn btn-primary").length;i++) {
			    			if(document.getElementsByClassName("btn btn-primary")[i].innerText == "Next") {
			    				//Click the "Next" button
			    				document.getElementsByClassName("btn btn-primary")[i].click();
			    				break;
			    			}
			    		}
			    	}
			    });
			    	pageobserver.disconnect();
			    }
			  });
			});
			
			if (salesOrderStuff == 1) {
				pageobserver.observe(page, {
				  childList: true,
				  subtree: true,
				});
			}
			
			let ytarget;
		
			const yobserver = new MutationObserver((mutations) => {
			  mutations.forEach((mutation) => {
			  	let btntxt = mutation.target.firstElementChild.lastElementChild.innerText;
			  	//console.log(btntxt);
			  	//setTimeout(() => {}, 500);
			  	if(btntxt == "loading...") {
			    } else if(btntxt == "Reset") {
			    	if(f == 1) {
			    		f = 2;
							for(i=0;i<document.getElementsByClassName("btn btn-default").length;i++) {
						  		if(document.getElementsByClassName("btn btn-default")[i].innerText == "Reset") {
						  			//console.log(document.getElementsByClassName("btn btn-default")[i].previousElementSibling);
						  			if(document.getElementsByClassName("fa fa-warning")[document.getElementsByClassName("fa fa-warning").length-1].nextSibling.textContent == " The following products do not have matching order items. ") {
						  			}else if (document.getElementsByClassName("fa fa-warning")[document.getElementsByClassName("fa fa-warning").length-1].nextSibling.textContent.split(' ')[1] > 0) {
						  			//else if (document.getElementsByClassName("fa fa-warning")[document.getElementsByClassName("fa fa-warning").length-1].parentElement.nextSibling.textContent == " could not be added to this order.\n\t\t") {
						  			}
						  			else {
						  				//Click the "Save" button
						  				document.getElementsByClassName("btn btn-default")[i].previousElementSibling.click();
						  				//navigator.clipboard.writeText(document.getElementsByClassName("main-content shadow-tile")[0].children[2].lastChild.children[1].lastChild.innerText);
						  				f=0;
						  				//Copy transaction number
						  				//let tn = document.evaluate("//*[contains(text(),'Transaction Number:')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.innerText.split("Transaction Number: ")[1];
						  				//navigator.clipboard.writeText(tn);
						  				//Open shipstation in new tab
						  				if (shipStationHandoff == 1 && preloadHandoff == 0) {
						  					window.open("https://ship11.shipstation.com/scan?[" + Date(Date.now()).replaceAll(" ", "%20") + "]ordernumber=${" + tn + "}", "_blank");
						  				}
						  			}
						  	}
						  }
			    	}
			    }
			  });
			});
		}
	}
}

//----------------------------------Seach Bar-------------------------------------------------
//target the search bar for changes
const target = document.querySelector("#navbar > ul.nav.navbar-nav.navbar-right > li:nth-child(1) > div > div:nth-child(2)");

//what to do when the search bar changes
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
  	//console.log(mutation.addedNodes[0]);
  	//Check if the first returned result in the dropdown is bold, seems it turns bold if it is an exact match, this seems to work well for this
    //the first if is the old way, only working on sales orders, new if should work if single result is returned
    //if(mutation.addedNodes[0].children[0].innerHTML.includes("strong")) {
    //console.log(mutation.addedNodes[0].children[0].children[2].firstElementChild.lastChild.textContent);
    //console.log(mutation.target.previousElementSibling.lastElementChild.value);
    //if(mutation.addedNodes[0].children[0].children.length == 3) {
    if(mutation.addedNodes[0].children[0].children[2].firstElementChild.lastChild.textContent.indexOf(mutation.target.previousElementSibling.lastElementChild.value) > -1) {
    	//console.log(mutation.addedNodes[0].children[0].children[0]);
    	console.log("yes");
			//window.open(mutation.addedNodes[0].children[0].lastElementChild.children[0].getAttribute("href"),"_self");
			window.open(mutation.addedNodes[0].children[0].children[2].firstElementChild.getAttribute("href"),"_self");
    }
  });
});

//start to watch the search bar for changes
observer.observe(target, {
  childList: true,
  subtree: true,
});
//--------------------------------------------------------------------------------------------

/*
const firsttarget = document.getElementsByClassName("table table-bordered table-striped dataTable")[0];
let firstflag = 0;

const firstobserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if(document.getElementsByClassName("table table-bordered table-striped dataTable")[0].lastElementChild.lastElementChild.lastElementChild.innerText.split("$")[1] > 0) {
    	console.log("item loaded");
    	firstflag = 1;
			firstobserver.disconnect();
    }
  });
});

firstobserver.observe(firsttarget, {
  childList: true,
  subtree: true,
});
*/

//CSV Stuff===============================================================================================================

let limitWarn = 500;

function csvMake() {
	if (document.URL.indexOf("new") == -1 && document.URL.indexOf("process_batches/") > -1 || document.URL.indexOf("inventories") > -1 && document.URL.indexOf("inventories/") == -1) {
		//create custom divs for csv creation
		let newSearch = document.createElement("div");
		newSearch.id = "csv_div";
		//create box field
		let clonedBox = document.evaluate("//*[text()='Custom Field Search']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.parentElement.cloneNode(true);
		clonedBox.firstElementChild.innerText = "Set Box Number";
		clonedBox.id = "Box";
		clonedBox.lastElementChild.className = "csv_field";
		clonedBox.lastElementChild.setAttribute("placeholder", "Box");
		newSearch.appendChild(clonedBox);
		//create bin field
		let clonedBin = document.evaluate("//*[text()='Custom Field Search']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.parentElement.cloneNode(true);
		clonedBin.firstElementChild.innerText = "Set Bin Location";
		clonedBin.id = "Bin";
		clonedBin.lastElementChild.className = "csv_field";
		clonedBin.lastElementChild.setAttribute("placeholder", "Bin");
		newSearch.appendChild(clonedBin);
		//create pallet field
		let clonedPallet = document.evaluate("//*[text()='Custom Field Search']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.parentElement.cloneNode(true);
		clonedPallet.firstElementChild.innerText = "Set Pallet Location";
		clonedPallet.id = "Pallet";
		clonedPallet.lastElementChild.className = "csv_field";
		clonedPallet.lastElementChild.setAttribute("placeholder", "Pallet");
		newSearch.appendChild(clonedPallet);
		//create location field
		let clonedLoc = document.evaluate("//*[text()='Custom Field Search']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.parentElement.cloneNode(true);
		let selLoc = document.createElement("select");
		let optLocBlank = document.createElement("option");
		optLocBlank.innerText = "(Select a Location)";
		optLocBlank.value = "";
		clonedLoc.firstElementChild.innerText = "Set Location";
		clonedLoc.id = "Location";
		selLoc.className = "csv_field";
		selLoc.appendChild(optLocBlank);
		clonedLoc.removeChild(clonedLoc.lastElementChild);
		clonedLoc.appendChild(selLoc);
		newSearch.appendChild(clonedLoc);
		//create status field
		let clonedStatus = document.evaluate("//*[text()='Custom Field Search']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.parentElement.cloneNode(true);
		let selStatus = document.createElement("select");
		let optStatusBlank = document.createElement("option");
		optStatusBlank.innerText = "(Select a Status)";
		optStatusBlank.value = "";
		clonedStatus.firstElementChild.innerText = "Set Status";
		clonedStatus.id = "Status";
		selStatus.className = "csv_field";
		selStatus.appendChild(optStatusBlank);
		clonedStatus.removeChild(clonedStatus.lastElementChild);
		clonedStatus.appendChild(selStatus);
		newSearch.appendChild(clonedStatus);
		//create the create csv button
		let clonedCSV = document.evaluate("//*[text()='Inventory Date']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.parentElement.cloneNode(true);
		clonedCSV.firstElementChild.innerText = "Create CSV";
		clonedCSV.id = "Create";
		clonedCSV.lastElementChild.className = "csv_button";
		clonedCSV.lastElementChild.firstElementChild.firstElementChild.removeChild(clonedCSV.lastElementChild.firstElementChild.firstElementChild.firstElementChild);
		clonedCSV.lastElementChild.firstElementChild.firstElementChild.innerText = "Create";
		clonedCSV.lastElementChild.setAttribute("onclick", "makeCSV()"); 
		newSearch.appendChild(clonedCSV);
		document.evaluate("//*[text()='Custom Field Search']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.parentElement.parentElement.appendChild(newSearch);
		
		//fetch locations from wholecell
		fetch("https://www.wholecell.io/settings/locations.json?all=true")
	    .then(response => response.json()) // Parse the response as JSON
	    .then(dataReturned => {
		    // Now 'data' contains your JSON object
		    dataReturned.forEach(function(statRecord){
			    //let statLi = document.createElement("li");
			    //statLi.setAttribute("class","multiselect__element");
			    //let statSpan = document.createElement("span");
			    //statSpan.setAttribute("class","multiselect__option");
			    //statSpan.setAttribute("data-select","");
			    //statSpan.setAttribute("data-selected","");
			    //statSpan.setAttribute("data-deselect","");
			    //let statSpanInner = document.createElement("span");
			    //statSpanInner.innerText = statRecord.title;
			    //statSpan.appendChild(statSpanInner);
			    //statLi.appendChild(statSpan);
			    //let ref = document.getElementById("Status").lastElementChild.lastElementChild.lastElementChild.lastElementChild.previousElementSibling;
			    //document.getElementById("Status").lastElementChild.lastElementChild.lastElementChild.insertBefore(statLi, ref);
			    let statOpt = document.createElement("option");
			    statOpt.value = statRecord.title;
			    statOpt.innerText = statRecord.title;
			    document.getElementById("Location").lastElementChild.appendChild(statOpt);
		    });	
		}).catch(error => {
		    console.error('Error fetching status JSON:', error);
		});
		
		//fetch statuses from wholcell
		fetch("https://www.wholecell.io/settings/statuses.json?status_type=Inventory")
	    .then(response => response.json()) // Parse the response as JSON
	    .then(dataReturned => {
		    // Now 'data' contains your JSON object
		    dataReturned.forEach(function(statRecord){
			    //let statLi = document.createElement("li");
			    //statLi.setAttribute("class","multiselect__element");
			    //let statSpan = document.createElement("span");
			    //statSpan.setAttribute("class","multiselect__option");
			    //statSpan.setAttribute("data-select","");
			    //statSpan.setAttribute("data-selected","");
			    //statSpan.setAttribute("data-deselect","");
			    //let statSpanInner = document.createElement("span");
			    //statSpanInner.innerText = statRecord.title;
			    //statSpan.appendChild(statSpanInner);
			    //statLi.appendChild(statSpan);
			    //let ref = document.getElementById("Status").lastElementChild.lastElementChild.lastElementChild.lastElementChild.previousElementSibling;
			    //document.getElementById("Status").lastElementChild.lastElementChild.lastElementChild.insertBefore(statLi, ref);
			    let statOpt = document.createElement("option");
			    statOpt.value = statRecord.title;
			    statOpt.innerText = statRecord.title;
			    document.getElementById("Status").lastElementChild.appendChild(statOpt);
		    });	
		}).catch(error => {
		    console.error('Error fetching status JSON:', error);
		});
		
		//select search bar
		document.querySelector(`[placeholder="Search by ID, transaction number, or ESN"]`).focus();
		document.querySelector(`[placeholder="Search by ID, transaction number, or ESN"]`).select();
	  //select search bar each time page is brought up
		window.addEventListener("visibilitychange",()=>{
			if (document.visibilityState === "visible") {
				document.querySelector(`[placeholder="Search by ID, transaction number, or ESN"]`).select();
				//console.log("visible");
			}
		});
	}
}
	
function spaceOnly(text) {
  return /^\s*$/.test(text);
}

function makeCSV() {
	//get the most recent link polled by the page for desired inventory
	let link = "";
	let resources = performance.getEntriesByType("resource");
	resources.forEach(resource => {
	    if (resource.name.indexOf(".json?") > -1) {
	        link = resource.name;
	        if (link.indexOf("length") > -1) {
		        setLen = document.querySelector("[class='pagination pull-right']").lastElementChild.previousElementSibling.firstElementChild.innerText * 100;
		        link = link.replace(link.slice(link.indexOf("length"),link.indexOf("&",link.indexOf("length"))),"length="+setLen);
		        if (setLen >= limitWarn) {
		        	alert("You are trying to query " + limitWarn + "+ devices, if that is fine, continue, otherwise refresh the page to prevent this.")
		        }
	        }
	        //console.log(link);
	        //console.log("Resource URL:", resource.name);
	        //console.log("Resource Type:", resource.initiatorType);
	        //console.log("Response End Time:", resource.responseEnd);
	    }
	});
	
	
	let pal = document.getElementById("Pallet").lastElementChild.value;
	let loc = document.getElementById("Location").lastElementChild.value;
	let sta = document.getElementById("Status").lastElementChild.value;
	let box = document.getElementById("Box").lastElementChild.value;
	let bin = document.getElementById("Bin").lastElementChild.value;
	
	let tcsv = "ESN,";
	
	let xcsv = ",";
	
	let varArr = {"Pallet":pal, "Bin":bin, "Location":loc, "Status":sta, "Box":box};
	
	for (var key in varArr) {
		if (varArr[key] != "") {
			tcsv = tcsv + key + ",";
			if (spaceOnly(varArr[key])){
				xcsv = xcsv + ",";
			} else {
				xcsv = xcsv + varArr[key] + ",";
			}
		}
	}

	tcsv = tcsv.slice(0,tcsv.length - 1) + "\n";
	xcsv = xcsv.slice(0,xcsv.length - 1) + "\n";
	//console.log(tcsv);
	//console.log(xcsv);
	
	//load the link and get the json info
	let invInfo = "";
	fetch(link)
		.then(response => response.json())
		.then(dataReturned => {
		invInfo = dataReturned.data;
		
		//make each record with it's esn
		for (x=0;x<invInfo.length;x++) {
			tcsv = tcsv + invInfo[x].esn + xcsv;
		}
		
		//change text to a download and open it
		let blob = new Blob([tcsv], { type: 'text/csv' });
		let url = URL.createObjectURL(blob);
		window.open(url);
	}).catch(error => {
		console.error('Error fetching JSON:', error);
	});
}

//edits to item/single device screen
function skuPrint() {
	if (document.URL.indexOf("inventories/") > -1 && Number.isInteger(Number.parseInt(document.URL.split("/")[document.URL.split("/").length-1])) && document.URL.split("/")[document.URL.split("/").length-1].length == 8) {
		let skuLink;
		try {
			skuLink = document.evaluate("//*[text()='Product Variation']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.parentElement.nextElementSibling.firstElementChild;
		} catch {}
		if (skuLink != undefined) {
			let clonedLabel = document.getElementById("label_inventory_" + Number.parseInt(document.URL.split("/")[document.URL.split("/").length-1])).cloneNode(1);
			clonedLabel.id = "label_sku_" + Number.parseInt(document.URL.split("/")[document.URL.split("/").length-1]);
			clonedLabel.href = skuLink + ".pdf";
			let newTd = document.createElement("td");
			newTd.appendChild(clonedLabel);
			document.evaluate("//*[text()='Product Variation']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.parentElement.appendChild(newTd);
		}
	}
}


//label buttons on inventory screen
function labelButtons() {
	if (document.URL.indexOf("inventories") > -1 && document.URL.indexOf("inventories/") == -1) {
		//target
		let targetLabPrint = document.body;
		let varIndividual = 0;
		let varGrouped = 0;
		
		//observer function
		let observerLabPrint = new MutationObserver((mutations) => {
		  mutations.forEach((mutation) => {
		  	//individual category device labels
		    if(document.evaluate("//*[text()='Individual']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.getAttribute("class").indexOf("active") > -1 && document.getElementsByClassName("table-responsive")[0].firstElementChild.children[1].children[1].childElementCount > 0 && varIndividual == 0) {
		    	//alert("individual is selected");
		    	let tableOfDevices = document.getElementsByClassName("table-responsive")[0].firstElementChild.children[1].children[1];
		    	try {
			    	if (tableOfDevices.children[0]) {
		    			varIndividual = 1;
			    		for(x=0;x<tableOfDevices.childElementCount;x++) {
			    			let thisCol = tableOfDevices.children[x].children[4].firstElementChild;
			    			let thisPdf = thisCol.firstElementChild.href + ".pdf";
			    			
			    			let aButton = document.createElement("a");
			    			let newButton = document.evaluate("//*[text()='Inventory Date']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.nextElementSibling.firstElementChild.firstElementChild.cloneNode();
			    			newButton.setAttribute("class", "cust_button");
			    			newButton.innerText = "Label";
			    			aButton.href = thisPdf;
			    			aButton.target = "blank";
			    			
			    			aButton.appendChild(newButton);
			    			thisCol.insertBefore(aButton, thisCol.firstElementChild);
				    	}
			    	}
		    	} catch {}
		    	//for(x=0;x<tableOfDevices.childElementCount;x++) {
		    		//console.log(tableOfDevices[x]);
		    	//}
		    } else if (document.evaluate("//*[text()='Individual']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.getAttribute("class").indexOf("active") > -1 && document.getElementsByClassName("table-responsive")[0].firstElementChild.children[1].children[1].childElementCount == 0 && varIndividual == 1) {
		    	varIndividual = 0;
		    } else if (document.evaluate("//*[text()='Individual']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.getAttribute("class").indexOf("active") == -1 && varIndividual == 1) {
		    	varIndividual = 0;
		    }
		    
		    //Grouped category sku labels
		    if(document.evaluate("//*[text()='Grouped']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.getAttribute("class").indexOf("active") > -1 && document.getElementsByClassName("table-responsive")[1].firstElementChild.children[1].children[1].childElementCount > 0 && varGrouped == 0) {
		    	//alert("grouped is selected");
		    	let tableOfDevices = document.getElementsByClassName("table-responsive")[1].firstElementChild.children[1].children[1];
		    	try {
			    	if (tableOfDevices.children[0]) {
		    			varGrouped = 1;
			    		for(x=0;x<tableOfDevices.childElementCount;x++) {
			    			let thisCol = tableOfDevices.children[x].children[0];
			    			let nextCol = tableOfDevices.children[x].children[1];
			    			let thisPdf = "/products/skus/" + thisCol.firstElementChild.id.split("_")[2] + ".pdf";
			    			
			    			let aButton = document.createElement("a");
			    			let newButton = document.evaluate("//*[text()='Inventory Date']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.nextElementSibling.firstElementChild.firstElementChild.cloneNode();
			    			newButton.setAttribute("class", "cust_button");
			    			newButton.innerText = "Label";
			    			aButton.href = thisPdf;
			    			aButton.target = "blank";
			    			
			    			aButton.appendChild(newButton);
			    			nextCol.append(aButton);
				    	}
			    	}
		    	} catch {}
		    	//for(x=0;x<tableOfDevices.childElementCount;x++) {
		    		//console.log(tableOfDevices[x]);
		    	//}
		    } else if (document.evaluate("//*[text()='Grouped']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.getAttribute("class").indexOf("active") > -1 && document.getElementsByClassName("table-responsive")[1].firstElementChild.children[1].children[1].childElementCount == 0 && varGrouped == 1) {
		    	varGrouped = 0;
		    } else if (document.evaluate("//*[text()='Grouped']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.getAttribute("class").indexOf("active") == -1 && varGrouped == 1) {
		    	varGrouped = 0;
		    }
		  });
		});

		//start observer
		observerLabPrint.observe(targetLabPrint, {
		  childList: true,
		  subtree: true,
		});
	}
}

function openShipButton() {
	let orderNum = document.evaluate("//*[contains(text(),'Transaction Number:')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.innerText.split("Transaction Number: ")[1];
	let shipUrl = "https://ship11.shipstation.com/scan?[" + Date(Date.now()).replaceAll(" ", "%20") + "]ordernumber=${" + String(orderNum) + "}";
	let header = document.getElementsByClassName("header-match")[0];
	let cloneuButton = header.lastElementChild.cloneNode(true);
	let shipLogoSrc = "https://wholecell-images.s3-us-west-1.amazonaws.com/integrations_shipstation-min.png";
	//let imgLogo = document.createElement("img");
	//imgLogo.src = shipLogoSrc;
	//cloneuButton.firstElementChild.lastChild.textContent = "Open in Shipstation";
	cloneuButton.firstElementChild.lastChild.textContent = " ";
	cloneuButton.firstElementChild.innerHTML = "";
	cloneuButton.firstElementChild.id = "ship_button";
	//cloneuButton.firstElementChild.appendChild(imgLogo);
	cloneuButton.firstElementChild.href = shipUrl;
	cloneuButton.firstElementChild.target = "blank";
	header.appendChild(cloneuButton);
	runOnceFlag = 1;
}

//Initiate any function that needs to be donw on load
window.onload = function() {
	
	//Select the search bar on load and when page is visible on screen
	document.querySelector(`[placeholder="Search by ID, transaction number, or ESN"]`).select();
	
	window.addEventListener("visibilitychange",()=>{
		if (document.visibilityState === "visible") {
			document.querySelector(`[placeholder="Search by ID, transaction number, or ESN"]`).select();
			console.log("visible");
		}
	});
	
	//checkboxes to change commiting/shipping behavior
	checkboxes();
	
	//committing a shipping function
	commitShip();
	
	//sku printing label on device screen
	skuPrint();
	
	//label printing
	labelButtons();
	
	//CSV Maker
	csvMake();
	
}

//order importing
//if (document.URL.indexOf("new") == -1 && document.URL.indexOf("process_batches/") > -1 || document.URL.indexOf("inventories") > -1 && document.URL.indexOf("inventories/") == -1) {
