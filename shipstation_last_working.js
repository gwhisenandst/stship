//USE CTRL-SHIFT-R TO HARD REFRESH AFTER MAKING CHANGES

let atarget = document.body;
let btarget;
let ptarget;
let bflag = 0;
let onum;
let oinput;
let binput;
let runOnceFlag = 0;
let ever;
let lcheck;
let tflag = 0;
let shippingRates = [];
let formattedRates = "";
let rateref = [];
let provider;
let rate;
let delTime;
let shipString;
let paidflag = 0;
let packflag = -1;
let start;
let end;
let cheapest;

//new dictionary stuff
let shipRatesDict = [];
let outOfRangeArray= [];

let businessFlag = 0;
let bestBuyFlag = 0;
let skipfedex = 0;
let secretShop;

let firstShip = 0;

let vall;
let mav;
let ev;

let skipPaid = 0;
let skipSummary = 0;

let changeShipFlag = 0;

//Maybe sort by cost, then find any 3 days or less, then find cheapest of that group,
//then create a sub-group of those that fall within a percent of the cheapest,
//finally organize that final sub-group by time/days returning this list of acceptable rates 
//orderd by price
let percentPlus = 1.1;
let amountPlus = 0.5;

function getShipRates() {
	let cheapValid = [];
	let finalArray = [];
	
	shipRatesDict.forEach((eachRate) => {
		if (eachRate.time <= 3) {
			cheapValid.push(eachRate);
		}
	});
	let cheapestRate = cheapValid.sort((a, b) => a.cost - b.cost)[0].cost;
	//console.log(cheapestRate);
	
	//best value within the range, ie quickest within the range allowed
	shipRatesDict = shipRatesDict.sort((a, b) => a.time - b.time || a.cost - b.cost);
	
	//sort by cheapest within the range
	//shipRatesDict = shipRatesDict.sort((a, b) => a.cost - b.cost);
	
	shipRatesDict.forEach((eachRate) => {
		//console.log(eachRate.cost + " : " + cheapestRate);
		if (eachRate.cost > (cheapestRate + amountPlus) || eachRate.time > 3) {
			//outOfRangeArray.push(shipRatesDict.splice(shipRatesDict.indexOf(eachRate),1)[0]);
			outOfRangeArray.push(eachRate);
		} else if (!finalArray.includes(eachRate)){
			finalArray.push(eachRate);
			//console.log("Within range: " + eachRate.name);
		}
	});
	
	outOfRangeArray = outOfRangeArray.sort((a, b) => a.cost - b.cost);
	
	outOfRangeArray.forEach((eachOutOfRange) => {
		if (!finalArray.includes(eachOutOfRange)) {
			finalArray.push(eachOutOfRange);
			//console.log("Not in range: " + eachOutOfRange.name);
		}
	});
	
	return finalArray;
}

function getBusinessDatesCount(x, flag = 0) {
    let count = -1;
    const curDate = new Date();
    let daysWill = new Date(Date.now() + (Math.ceil((x - Date.now()) / (1000 * 3600 * 24)) * (1000 * 3600 * 25)));
    //console.log(x);
    //console.log(curDate);
    //console.log(daysWill);
    while (curDate <= daysWill) {
        const dayOfWeek = curDate.getDay();
        if (String(curDate).indexOf("Jan 01") > -1) {}
        else if (String(curDate).indexOf("Jan") > -1 && parseInt(String(curDate).split(" ")[2]) >= 15 && parseInt(String(curDate).split(" ")[2]) <= 21  && dayOfWeek == 1 && flag == 0) {}
        else if (String(curDate).indexOf("May") > -1 && parseInt(String(curDate).split(" ")[2]) >= 8 && parseInt(String(curDate).split(" ")[2]) <= 14  && dayOfWeek == 0) {}
        else if (String(curDate).indexOf("May") > -1 && parseInt(String(curDate).split(" ")[2]) >= 25 && parseInt(String(curDate).split(" ")[2]) <= 31  && dayOfWeek == 1) {}
        else if (String(curDate).indexOf("Jul 04") > -1 && dayOfWeek >= 1 && dayOfWeek <= 5) {}
        else if (String(curDate).indexOf("Nov 11") > -1) {}
        else if (String(curDate).indexOf("Nov") > -1 && parseInt(String(curDate).split(" ")[2]) >= 24 && parseInt(String(curDate).split(" ")[2]) <= 30  && dayOfWeek == 4) {}
        else if (String(curDate).indexOf("Dec 25") > -1) {}
        else if (String(curDate).indexOf("Sep") > -1 && parseInt(String(curDate).split(" ")[2]) <= 7 && dayOfWeek == 1) {}
        else if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        	count++;
        }
        curDate.setDate(curDate.getDate() + 1);
    }
    if (count == 0) {
    	return 1;
    }
    return count;
}

const providers = ["UPS® Ground", "UPS 3 Day Select®", "FedEx Ground®", "FedEx Home Delivery®", "FedEx 2Day®", "UPS Next Day Air Saver®", "UPS Next Day Air®", "UPS 2nd Day Air®", "FedEx SmartPost parcel select"];

const upsground = new KeyboardEvent('keydown', {
  key: '7', // The specific key being pressed
  code: 'Digit7', // The code for the '7' key
  ctrlKey: true, // Indicate that the Ctrl key is pressed
  bubbles: true, // Allow the event to bubble up through the DOM
  cancelable: true // Allow the default action to be prevented
});

const ups3day = new KeyboardEvent('keydown', {
  key: '0', // The specific key being pressed
  code: 'Digit0', // The code for the '0' key
  ctrlKey: true, // Indicate that the Ctrl key is pressed
  bubbles: true, // Allow the event to bubble up through the DOM
  cancelable: true // Allow the default action to be prevented
});

const fedexground = new KeyboardEvent('keydown', {
  key: '8', // The specific key being pressed
  code: 'Digit8', // The code for the '8' key
  ctrlKey: true, // Indicate that the Ctrl key is pressed
  bubbles: true, // Allow the event to bubble up through the DOM
  cancelable: true // Allow the default action to be prevented
});

const fedexhome = new KeyboardEvent('keydown', {
  key: '6', // The specific key being pressed
  code: 'Digit6', // The code for the '6' key
  ctrlKey: true, // Indicate that the Ctrl key is pressed
  bubbles: true, // Allow the event to bubble up through the DOM
  cancelable: true // Allow the default action to be prevented
});

const fedex2day = new KeyboardEvent('keydown', {
  key: '9', // The specific key being pressed
  code: 'Digit9', // The code for the '9' key
  ctrlKey: true, // Indicate that the Ctrl key is pressed
  bubbles: true, // Allow the event to bubble up through the DOM
  cancelable: true // Allow the default action to be prevented
});

const upsndasaver = new KeyboardEvent('keydown', {
  key: '4', // The specific key being pressed
  code: 'Digit4', // The code for the '4' key
  ctrlKey: true, // Indicate that the Ctrl key is pressed
  bubbles: true, // Allow the event to bubble up through the DOM
  cancelable: true // Allow the default action to be prevented
});

const ups2da = new KeyboardEvent('keydown', {
  key: '5', // The specific key being pressed
  code: 'Digit5', // The code for the '5' key
  ctrlKey: true, // Indicate that the Ctrl key is pressed
  bubbles: true, // Allow the event to bubble up through the DOM
  cancelable: true // Allow the default action to be prevented
});

const upsnda = new KeyboardEvent('keydown', {
  key: '1', // The specific key being pressed
  code: 'Digit1', // The code for the '5' key
  ctrlKey: true, // Indicate that the Ctrl key is pressed
  bubbles: true, // Allow the event to bubble up through the DOM
  cancelable: true // Allow the default action to be prevented
});

const fedexsp = new KeyboardEvent('keydown', {
  key: '2', // The specific key being pressed
  code: 'Digit2', // The code for the '5' key
  ctrlKey: true, // Indicate that the Ctrl key is pressed
  bubbles: true, // Allow the event to bubble up through the DOM
  cancelable: true // Allow the default action to be prevented
});

function selCheapest(ratesArray) {
	//expects an array of shipping rates pre-ordered by price
	let pageLocForDispatch = document.getElementsByClassName("body-j6miezO")[0];
	if(providers.indexOf(ratesArray.split("-")[1]) == 0) {
		pageLocForDispatch.dispatchEvent(upsground);
	} else if(providers.indexOf(ratesArray.split("-")[1]) == 1) {
		pageLocForDispatch.dispatchEvent(ups3day);
	} else if(providers.indexOf(ratesArray.split("-")[1]) == 2) {
		pageLocForDispatch.dispatchEvent(fedexground);
	} else if(providers.indexOf(ratesArray.split("-")[1]) == 3) {
		pageLocForDispatch.dispatchEvent(fedexhome);
	} else if(providers.indexOf(ratesArray.split("-")[1]) == 4) {
		pageLocForDispatch.dispatchEvent(fedex2day);
	} else if(providers.indexOf(ratesArray.split("-")[1]) == 5) {
		pageLocForDispatch.dispatchEvent(upsndasaver);
	} else if(providers.indexOf(ratesArray.split("-")[1]) == 6) {
		pageLocForDispatch.dispatchEvent(ups2da);
	}
}

function newCheapest(cheapestRate) {
	//expects an array of shipping rates pre-ordered as needed
	let pageLocForDispatch = document.getElementsByClassName("body-j6miezO")[0];
	if(providers.indexOf(cheapestRate.name) == 0) {
		pageLocForDispatch.dispatchEvent(upsground);
	} else if(providers.indexOf(cheapestRate.name) == 1) {
		pageLocForDispatch.dispatchEvent(ups3day);
	} else if(providers.indexOf(cheapestRate.name) == 2) {
		pageLocForDispatch.dispatchEvent(fedexground);
	} else if(providers.indexOf(cheapestRate.name) == 3) {
		pageLocForDispatch.dispatchEvent(fedexhome);
	} else if(providers.indexOf(cheapestRate.name) == 4) {
		pageLocForDispatch.dispatchEvent(fedex2day);
	} else if(providers.indexOf(cheapestRate.name) == 5) {
		pageLocForDispatch.dispatchEvent(upsndasaver);
	} else if(providers.indexOf(cheapestRate.name) == 6) {
		pageLocForDispatch.dispatchEvent(upsnda);
	} else if(providers.indexOf(cheapestRate.name) == 7) {
		pageLocForDispatch.dispatchEvent(ups2da);
	} else if(providers.indexOf(cheapestRate.name) == 8) {
		pageLocForDispatch.dispatchEvent(fedexsp);
	}
}

function orderNumHandler() {
	//this can be ran anytime
	//try to find order number in the URL.
	try{
		onum = document.URL.split("{")[1].split("}")[0];
		console.log("Order Number: " + onum);
		pullUpOrder();
		return;
	} catch {
		console.log("No order number detected in the URL, checking the clipboard...");
		//if not found in url, try this instead
		try{
			//try to check the clipboard for the order number.
			navigator.clipboard.readText().then(clipText => {
				if (clipText.length > 3 && clipText.length < 30){
					onum = clipText;
					console.log("Order Number: " + onum);
					pullUpOrder();
					return;
				} else if (clipText.length <= 3){
					console.log("Copied text is too short for an expected order number: " + clipText);
				} else if (clipText.length >= 30){
					console.log("Copied text is too long for an expected order number: " + clipText);
				}
			});
		} catch {
			console.log("Nothing was found in the clipboard.");
		}
	}
}

function pullUpOrder() {
	//console.log("pull order");
	//This must be run when the ability to search for an order has loaded
	btarget = document.getElementById("app-root").firstChild.firstChild.children[1];
	//console.log(btarget);
	//console.log(onum);
	if(btarget != undefined && runOnceFlag == 0) {
		runOnceFlag = 1;
		//If an order number is ready, enter it into the field and find it.
		if (onum != undefined) {
			oinput = document.evaluate("//*[text()='Find Shipment']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.previousElementSibling;
			binput = document.evaluate("//*[text()='Find Shipment']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
			//Not sure if either of these two are really needed
			oinput.select();
			oinput.focus();
			//Deprecated command, was the only way I found to get text into order number search bar
			document.execCommand("insertText",false,onum);
			//May or may not need, haven't tested
			setTimeout(()=>{
				binput.click();
			},50);
		}
	}
}

//Change these to change what shipping types are attempted for each case

let smallPkg = [];
let smallPkgBusiness = [];
let medPkg =[];
let medPkgBusiness = [];
let twoDayShipSmall = [];
let twoDayShipMed = [];
let oneDayShip = [];

let mapProviders = {
	"UPS® Ground":upsground,
	"UPS 3 Day Select®":ups3day,
	"FedEx Home Delivery®":fedexhome,
	"FedEx Ground®":fedexground,
	"UPS Next Day Air Saver®":upsndasaver,
	"UPS Next Day Air®":upsnda,
	"UPS 2nd Day Air®":ups2da,
	"FedEx 2Day®":fedex2day
};

function encodeString(localStorName, shipName, checked) {
	let resultString;
	if (checked) {
		resultString = localStorage.getItem(localStorName) + shipName + "," ;
	} else {
		resultString = localStorage.getItem(localStorName).replace(shipName + ",", "");
	}
	localStorage.setItem(localStorName, resultString);
	mapType[localStorName]
}

function tempMap(localStorNameClosest, shipNameArray) {
	let resultString = localStorage.getItem(localStorNameClosest);
	
	shipNameArray.forEach(function(shipName) {
		if (resultString.indexOf(shipName) > -1) {
			//console.log(shipName);
			resultString = resultString.replace(shipName + ",", "");
		}
		//console.log(resultString);
	});
	
	return decodeString(resultString);
}

function decodeString(string) {
	let resultArray = [];
	string.split(",").forEach((each) => {
		if (each != "") {
			resultArray.push(mapProviders[each]);
		}
	});
	return resultArray;
}

//12x9x2 or smaller
if (localStorage.getItem("Small")) {
	smallPkg = decodeString(localStorage.getItem("Small"));
} else {
	localStorage.setItem("Small", "");
	//smallPkg = localStorage.getItem("Small");
}
//const smallPkg = [upsground, ups3day, fedex2day, ups2da, fedexhome];

if (localStorage.getItem("Small (Business)")) {
	smallPkgBusiness = decodeString(localStorage.getItem("Small (Business)"));
} else {
	localStorage.setItem("Small (Business)", "");
	//smallPkgBusiness = localStorage.getItem("Small (Business)");
}
//const smallPkgBusiness = [upsground, ups3day, fedex2day, ups2da, fedexground];

//14x10x4 or larger
if (localStorage.getItem("Large")) {
	medPkg = decodeString(localStorage.getItem("Large"));
} else {
	localStorage.setItem("Large", "");
	//medPkg = localStorage.getItem("Large");
}
//const medPkg = [upsground, ups3day, ups2da, fedexhome];

if (localStorage.getItem("Large (Business)")) {
	medPkgBusiness = decodeString(localStorage.getItem("Large (Business)"));
} else {
	localStorage.setItem("Large (Business)", "");
	//medPkgBusiness = localStorage.getItem("Large (Business)");
}
//const medPkgBusiness = [upsground, ups3day, ups2da, fedexground];

//Backmarket 2-day paid shipping 12x9x2 or smaller
if (localStorage.getItem("Paid Small (2-Day)")) {
	twoDayShipSmall = decodeString(localStorage.getItem("Paid Small (2-Day)"));
} else {
	localStorage.setItem("Paid Small (2-Day)", "");
	//twoDayShipSmall = localStorage.getItem("Paid Small (2-Day)");
}

//Backmarket 2-day paid shipping 14x10x4 or larger
if (localStorage.getItem("Paid Large (2-Day)")) {
	twoDayShipMed = decodeString(localStorage.getItem("Paid Large (2-Day)"));
} else {
	localStorage.setItem("Paid Large (2-Day)", "");
	//twoDayShipMed = localStorage.getItem("Paid Large (2-Day)");
}

//Backmarket 1-day paid shipping
if (localStorage.getItem("Paid (1-Day)")) {
	oneDayShip = decodeString(localStorage.getItem("Paid (1-Day)"));
} else {
	localStorage.setItem("Paid (1-Day)", "");
	//oneDayShip = localStorage.getItem("Paid (1-Day)");
}

let mapType = {
	"Small":smallPkg,
	"Small (Business)":smallPkgBusiness,
	"Large":medPkg,
	"Large (Business)":medPkgBusiness,
	"Paid Small (2-Day)":twoDayShipSmall,
	"Paid Large (2-Day)":twoDayShipMed,
	"Paid (1-Day)":oneDayShip
};

function removeUndefined(array) {
	array = array.filter(function( element ) {
	  return element !== undefined;
	});
	return array;
}

//Best Buy shipping, currently only iPads, does not account for box, assumes 12x9x2 or lower as only fedEx
let bbShip = [fedex2day];

let upsArray = [];
let upsAirArray = [];
let fedexGroundArray = [];
let fedexExpressArray = [];

let upsNdaDisable = [];

let presetCount = 0
function createPreset(name, optsArray) {
	let thisPreset = document.createElement("div");
	presetCount++;
	thisPreset.id = name + presetCount;
	thisPreset.className = "preset";
	thisPreset.innerText = name;
	
	optsArray.forEach((eachOption) => {
		let optdiv = document.createElement("div");
		optdiv.className = "presetSub";
		let option = document.createElement("input");
		option.type = "checkbox"
		option.id = eachOption + presetCount;
		option.name = eachOption;
				
		let label = document.createElement("label");
		label.innerText = eachOption;
		label.className = "presetLabel";
		
		//arrays for later manipulation
		if (option.id.indexOf("UPS Next Day") > -1 && thisPreset.innerText.indexOf("Paid") == -1) {
			upsNdaDisable.push(option.id);
		}
		
		if (option.id.indexOf("UPS® Ground") > -1 || option.id.indexOf("UPS 3 Day") > -1) {
			upsArray.push(option.id);
		} else if (option.id.indexOf("UPS Next Day") > -1 || option.id.indexOf("UPS 2nd Day") > -1) {
			upsAirArray.push(option.id);
		} else if (option.id.indexOf("FedEx Home") > -1 || option.id.indexOf("FedEx Ground") > -1) {
			fedexGroundArray.push(option.id);
		} else if (option.id.indexOf("FedEx 2") > -1) {
			fedexExpressArray.push(option.id);
		}
		
		option.addEventListener("click", function(){
				if (this.checked) {
					//console.log(this.name + " for " + this.parentElement.parentElement.firstChild.data + " is active!");
					localStorage.setItem(this.id, true);
					
					//console.log(this.parentElement.parentElement.firstChild.data);
					//console.log(this.name);
					if (Object.keys(mapType).includes(this.parentElement.parentElement.firstChild.data)) {
						if (mapType[this.parentElement.parentElement.firstChild.data].includes(mapProviders[this.name])) {
					    //console.log("already in array");
						} else {
							console.log(mapType[this.parentElement.parentElement.firstChild.data]);
							console.log("includes: " + mapProviders[this.name]);
							//console.log("adding " + this.name + " to " + this.parentElement.parentElement.firstChild.data);
							//console.log(this.parentElement.parentElement.firstChild.data);
							//console.log(mapType[this.parentElement.parentElement.firstChild.data]);
							mapType[this.parentElement.parentElement.firstChild.data].push(mapProviders[this.name]);
							mapType[this.parentElement.parentElement.firstChild.data] = removeUndefined(mapType[this.parentElement.parentElement.firstChild.data]);
						}
					} else {
						console.log("adding it, but this package type isnt accounted for?");
					}
				} else {
					localStorage.setItem(this.id, false);
					if (Object.keys(mapType).includes(this.parentElement.parentElement.firstChild.data)) {
						if (mapType[this.parentElement.parentElement.firstChild.data].includes(mapProviders[this.name])) {
							console.log(mapType[this.parentElement.parentElement.firstChild.data]);
							console.log("includes: " + mapProviders[this.name]);
						  mapType[this.parentElement.parentElement.firstChild.data].splice(mapType[this.parentElement.parentElement.firstChild.data].indexOf(mapProviders[this.name]),1)
							mapType[this.parentElement.parentElement.firstChild.data] = removeUndefined(mapType[this.parentElement.parentElement.firstChild.data]);
						}
					} else {
						console.log("deleting it, but this package type isnt accounted for?");
					}
				}
				
				//console.log(this.parentElement.parentElement.firstChild.data);
				//console.log(this.name);
				
				encodeString(this.parentElement.parentElement.firstChild.data, this.name, this.checked);
		})
		
		if (localStorage.getItem(option.id) == "true") {
			option.checked = true;
		} else {
			option.checked = false;
		}
		
		optdiv.appendChild(option);
		optdiv.appendChild(label);
		thisPreset.appendChild(optdiv);
	})
	
	return thisPreset;
}

function createCustom(name, affectedArray) {
	let optdiv = document.createElement("div");
	optdiv.className = "presetSub";
	let option = document.createElement("input");
	option.type = "checkbox"
	option.id = name;
	option.name = name;
	
	option.addEventListener("click", function(){
		if (this.checked) {
			localStorage.setItem(name, "true");
			
			affectedArray.forEach((each) => {
				if (document.getElementById(each).checked) {
					document.getElementById(each).click();
				}
			});
		} else {
			localStorage.setItem(name, "false");
			
			affectedArray.forEach((each) => {
				if (!document.getElementById(each).checked) {
					document.getElementById(each).click();
				}
			});
		}
	});
	
	//check if this was checked in local storage to determine its checked status
	if (localStorage.getItem(option.id) == "true") {
		option.checked = true;
	} else {
		option.checked = false;
	}
	
	if (!localStorage.getItem("newDay")) {
		localStorage.setItem("newDay", 0);
	}
	
	if (new Date().getHours() < 13 && localStorage.getItem("newDay") == 1) {
		localStorage.setItem(option.id, "false");
		localStorage.setItem("newDay", 0);
		if (option.checked == true) {
			option.click();
		}
	} else if (new Date().getHours() >= 13 && localStorage.getItem("newDay") == 0) {
		localStorage.setItem("newDay", 1)
	}
	
	let label = document.createElement("label");
	label.innerText = name;
	label.className = "presetLabel";
	
	optdiv.appendChild(option);
	optdiv.appendChild(label);
	
	return optdiv;
}

function createToggle(name, relatedVariable) {
	let optdiv = document.createElement("div");
	optdiv.className = "presetSub";
	let option = document.createElement("input");
	option.type = "checkbox"
	option.id = name;
	let label = document.createElement("label");
	label.innerText = name;
	label.className = "presetLabel";
	
	if (localStorage.getItem(name) == null) {
		localStorage.setItem(name, "0");
	}
	
	if (localStorage.getItem(name) == "0") {
			option.checked = false;
	} else {
			option.checked = true;
	}
	
	switch (relatedVariable) {
		case "skipPaid":
			skipPaid = parseInt(localStorage.getItem(name));
		case "skipSummary":
			skipPaid = parseInt(localStorage.getItem(name));
	}
	
	option.addEventListener("click", function(){
		if (this.checked) {
			localStorage.setItem(name, "1");
		} else {
			localStorage.setItem(name, "0");
		}
		
		switch (relatedVariable) {
			case "skipPaid":
				skipPaid = parseInt(localStorage.getItem(name));
			case "skipSummary":
				skipSummary = parseInt(localStorage.getItem(name));
		}
	});
	
	
	optdiv.appendChild(option);
	optdiv.appendChild(label);
	
	return optdiv;
}

function settingsButton() {
	let rateButton = document.querySelector('[class*="rate-browser-button"]');
	let rateClone = rateButton.cloneNode(true);
	let rateParent = rateButton.parentElement;
	
	let settingsDiv = document.createElement("div");
	settingsDiv.id = "settingsDiv";
	
	let settingsWindow = document.createElement("div");
	settingsWindow.id = "settingsWindow";
	
	settingsDiv.appendChild(settingsWindow);
	
	let presetDiv = document.createElement("div");
	presetDiv.className = "presetFlex";
	
	presetDiv.appendChild(createPreset("Small", providers.filter((word) => word.indexOf("FedEx Ground") == -1)));
	presetDiv.appendChild(createPreset("Small (Business)", providers.filter((word) => word.indexOf("FedEx Home") == -1)));
	presetDiv.appendChild(createPreset("Large", providers.filter((word) => word.indexOf("FedEx Ground") == -1 && word.indexOf("FedEx 2Day") == -1)));
	presetDiv.appendChild(createPreset("Large (Business)", providers.filter((word) => word.indexOf("FedEx Home") == -1 && word.indexOf("FedEx 2Day") == -1)));
	presetDiv.appendChild(createPreset("Paid Small (2-Day)", providers.filter((word) => word.indexOf("2") > -1)));
	presetDiv.appendChild(createPreset("Paid Large (2-Day)", providers.filter((word) => word.indexOf("2") > -1 && word.indexOf("FedEx 2Day") == -1)));
	presetDiv.appendChild(createPreset("Paid (1-Day)", providers.filter((word) => word.indexOf("Next") > -1)));
	
	settingsWindow.appendChild(presetDiv);
	
	let customFields = document.createElement("div");
	customFields.className = "presetFlex";
	
	let customOne = document.createElement("div");
	customOne.innerText = "Other Fields:";
	customOne.className = "preset";
	
	let customUPS = createCustom("UPS Ground Picked Up?", upsArray);
	let customUPA = createCustom("UPS Air Picked Up?", upsAirArray);
	let customFEG = createCustom("FedEx Ground Picked Up?", fedexGroundArray);
	let customFEE = createCustom("FedEx Express Picked Up?", fedexExpressArray);
	
	let customUPD = createCustom("Disable UPS NDA on basic", upsNdaDisable);
	
	customOne.appendChild(customUPS);
	customOne.appendChild(customUPA);
	customOne.appendChild(customFEG);
	customOne.appendChild(customFEE);
	//customOne.appendChild(document.createElement("br"));
	//customOne.appendChild(customUPD);
	
	let customTwo = document.createElement("div");
	customTwo.className = "preset";
	
	let customPayPop = createToggle("Disable Paid Popup?", "skipPaid");
	let customSumPop = createToggle("Disable Summary Popup?", "skipSummary");
	
	customTwo.appendChild(document.createElement("br"));
	customTwo.appendChild(customPayPop);
	customTwo.appendChild(customSumPop);
	customTwo.appendChild(customUPD);
	
	customFields.appendChild(customOne);
	customFields.appendChild(customTwo);
	settingsWindow.appendChild(customFields);
	
	let settingsBackground = document.createElement("div");
	settingsBackground.id = "settingsBackground";
	settingsDiv.appendChild(settingsBackground);
	
	document.body.parentNode.prepend(settingsDiv);
	
	rateClone.innerText = "Settings";
	
	rateClone.addEventListener("click", function() {
		document.getElementById("settingsDiv").style.display = "block";
	})
	
	settingsBackground.addEventListener("click", function() {
		document.getElementById("settingsDiv").style.display = "none";
	})
	
	rateParent.appendChild(rateClone);
}

let packageTypes = [
	{name:"Small (12x9x2 or less)", types:["UPS® Ground", "UPS 3 Day Select®", "FedEx 2Day®", "UPS 2nd Day Air®", "FedEx Home Delivery®"], ref:smallPkg},
	{name:"Small (12x9x2 or less) Business", types:["UPS® Ground", "UPS 3 Day Select®", "FedEx 2Day®", "UPS 2nd Day Air®", "FedEx Ground®"], ref:smallPkgBusiness},
	{name:"Medium (14x10x4 or more)", types:["UPS® Ground", "UPS 3 Day Select®", "UPS 2nd Day Air®", "FedEx Home Delivery®"], ref:medPkg},
	{name:"Medium (14x10x4 or more) Business", types:["UPS® Ground", "UPS 3 Day Select®", "UPS 2nd Day Air®", "FedEx Ground®"], ref:medPkgBusiness},
	{name:"Small 2-Day", types:["FedEx 2Day®", "UPS 2nd Day Air®"], ref:twoDayShipSmall},
	{name:"Medium 2-Day", types:["UPS 2nd Day Air®"], ref:twoDayShipMed},
	{name:"1-Day", types:["UPS Next Day Air Saver®"], ref:oneDayShip},
	{name:"Best Buy", types:["FedEx 2Day®"], ref:bbShip}
];

let aobserver = new MutationObserver((mutations) => {
	mutations.forEach((mutation) => {
		/*
		try{
			//make sure page is loaded to the point needed.
			if (mutation.addedNodes[0].getAttribute("class") == "page-EALcQBT") {
				pullUpOrder();
			}
		}catch{}
		*/
		try{
			//console.log(mutation.addedNodes[0]);
			if (mutation.addedNodes[0].getAttribute("class").indexOf("fa-gear") > -1) {
				//console.log(mutation.addedNodes[0]);
//set name of tab to cust name
				if (document.title == "ShipStation") {
	  			let cbutton = document.evaluate("//*[text()='View']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
				  setTimeout(function() {
				  	cbutton.click();
				  }, 100);
				  setTimeout(function() {
					  let cname = document.querySelector('[data-testid="read-only-address"]').children;
					  
					  let address1
					  let address2
					  let address3
					  
					  if (cname.length <= 6) {
						  address1 = cname[1].innerText + " ";
						  address2 = cname[2].innerText + " ";
						  address3 = cname[3].innerText + " ";
					  } else if (cname.length >= 7) {
					  	//Business
						  address1 = cname[2].innerText + " ";
						  address2 = cname[3].innerText + " ";
						  address3 = cname[4].innerText + " ";
					  }
					  
					  let address = "";
					  //console.log(address1);
					  //console.log(address2);
					  //console.log(address3);
					  if (address1 != " ") {
					  	address = address + address1;
					  }
					  if (address2 != " ") {
					  	address = address + address2;
					  }
					  if (address3 != " ") {
					  	address = address + address3;
					  }
					  
					  //set a flag if address is known undeliverable (HI, AK)
					  if (address.indexOf(" HI ") > -1 || address.indexOf(" AK ") > -1) {
					  	changeShipFlag = 1;
					  }
					   if (address1.toLowerCase().indexOf("po box") > -1 || address2.toLowerCase().indexOf("po box") > -1) {
					   	changeShipFlag = 90;
					   }
					  
					  let addDiv = document.createElement("a");
					  addDiv.innerText = "Maps";
					  let formattedLink = address.trimEnd().replaceAll("# ", "");
					  formattedLink = address.trimEnd().replaceAll("/", "");
					  formattedLink = address.trimEnd().replaceAll(" #", "");
					  formattedLink = "https://www.google.com/maps/search/" + formattedLink.replaceAll(" ", "+");
					  addDiv.href = formattedLink;
			    	addDiv.target = "blank";
					  document.querySelector('[class*="view-address-link"]').parentElement.appendChild(addDiv);
					  document.title = cname[0].innerText;
					  cbutton.click();
				  }, 150);
	  		}
//set all flags for shipping decisions
				try{
	  			if(paidflag == 0) {
		  			let dimsx = document.evaluate("//*[text()='L']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.previousElementSibling.firstElementChild.value;
		  			let dimsy = document.evaluate("//*[text()='W']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.previousElementSibling.firstElementChild.value;
		  			let dimsz = document.evaluate("//*[text()='H']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.previousElementSibling.firstElementChild.value;
		  			let tdim = dimsx * dimsy * dimsz;
		  			if (tdim == 0) {
		  				packflag = 0;
		  				alert("There doesn't seem to be a box size set for this order?");
		  			}	else if (tdim <= 390) {
		  				packflag = 1;
		  			} else if (tdim > 390) {
		  				packflag = 0;
		  			}
		  			if (onum.indexOf("BBY03-") > -1){
		  				bestBuyFlag = 1;
		  			}
		  			//console.log(document.querySelector('[class*="validate-links"]').firstElementChild.firstElementChild.viewBox.baseVal.width);
		  			if (document.querySelector('[class*="validate-links"]').firstElementChild.firstElementChild.viewBox.baseVal.width < 18) {
					  	businessFlag = 1;
					  }
					  try {
					  	if (document.evaluate("//*[text()='Address not found']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue) {
					  		businessFlag = 0;
					  	}
					  } catch {}
		  			try {
	  					let tags = document.evaluate("//*[text()='Tags:']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.nextElementSibling.firstElementChild;
	  					for(t=0;t<tags.children.length;t++){
								let eachtag = tags.children[t].firstElementChild.firstElementChild.innerText;
				  			if (eachtag.indexOf("Secret Shopper") > -1 && secretShop == null) {
				  				secretShop = 1;
				  				alert("THIS IS A SECRET SHOPPER!!!");
				  				break;
				  			} else if(eachtag.indexOf("[1-Day]") > -1) {
				  				let shiptype = tags.children[t].firstElementChild.firstElementChild.innerText.split("[")[1].split("]")[0];
				  				paidflag = 1;
				  				if (skipPaid == 0) {
				  					alert("This customer has paid for " + shiptype + " shipping!");
				  				}
				  				break;
				  			} else if(eachtag.indexOf("[2-Day]") > -1 || bestBuyFlag == 1) {
				  				//console.log("2 day shipping paid");
				  				let shiptype = tags.children[t].firstElementChild.firstElementChild.innerText.split("[")[1].split("]")[0];
				  				paidflag = 2;
				  				if (skipPaid == 0) {
				  					alert("This customer has paid for " + shiptype + " shipping!");
				  				}
				  				break;
				  			}
		  				}
		  			} catch {}
	  			}
	  		} catch {}
			}
		} catch {}
//proceed to verify items
		try{
			if (vall == undefined || vall.disabled == true) {
	  		vall = document.evaluate("//*[text()='Verify All']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
			}
		}catch{
			//console.log("Failed to find Verify All button");
		}
		try{
			if (mav == undefined || mav.disabled == true) {
	  		mav = document.evaluate("//*[text()='Mark as Verified (v)']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.parentElement;
			}
		}catch{
			//console.log("Failed to find Mark All Verified button");
		}
		try{
			if (ev == undefined || ev.disabled == true) {
	  		ev = document.evaluate("//*[text()='Edit Verification']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.parentElement;
			}
		}catch{
			//console.log("Failed to find Edit Verification button");
		}
		if (packflag != -1) {
			if (vall != undefined && ev == undefined && bflag == 0) {
				console.log("verify all");
	  		vall.click();
	  		vall.disabled = true;
	  		bflag = 1;
			} else if (mav != undefined && mav.disabled == false && ev == undefined && bflag == 1) {
				console.log("mark all verified");
				mav.click();
				mav.disabled = true;
				bflag = 2;
			} else if (bflag == 0 && ev != undefined && vall != undefined && mav == undefined) {
				console.log("already verified, proceed to ship");
	  		vall.disabled = true;
				bflag = 2;
			}
//If everything verifies, ship the order
			if (bflag == 2) {
				tcheck = document.evaluate("//*[text()='Rate:']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.nextElementSibling.firstElementChild.lastElementChild;
				//console.log("start Shipping");
				tobserver.observe(tcheck, {
				  attributes: true,
				});
				//console.log("run first ship");
				setTimeout(function() {
					shipCond();
				}, 500);
				bflag = 3;
			}
		}
	});
});

/*
let scanobserver = new MutationObserver((mutations) => {
	mutations.forEach((mutation) => {
		try {
			console.log(mutation.addedNodes[0].innerText);
			if (mutation.addedNodes[0].getAttribute("class") == "page-EALcQBT") {
				pullUpOrder();
			}
		} catch {}
	});
});

let scantarget = document.body;
*/

function initialize() {

	aobserver.observe(atarget, {
	  childList: true,
	  subtree: true,
	  attributes: true,
	});
	/*
	scanobserver.observe(scantarget, {
	  childList: true,
	  subtree: true,
	  attributes: true,
	});
	*/
	
	setTimeout(function() {
		orderNumHandler();
	}, 250);
	
	
	/*
	setTimeout(function() {
		orderStart();
	}, 750);
	*/
}

function recordShip(endFlag = 0) {
	//console.log(endFlag);
	if (endFlag == 0) {
	//console.log("recship");
		provider = document.getElementsByClassName("shipping-service-NaNEHYX")[0].children[0].children[0].children[0].innerText;
		console.log("log: " + provider);
		rate = document.getElementsByClassName("with-rate-lasqlhb")[0].innerText;
		if (rate.split(".")[0].length <= 2) {
			rate = "$0" + rate.split(".")[0].split("$")[1] + "." + rate.split(".")[1];
		}
		delTime = document.getElementsByClassName("fields-h8vgO1T")[0].lastChild.lastChild.children[0].innerText;
		shipString = rate + "-" + provider + "-" + delTime;
		//console.log(tflag);
		let isIn = 0;
		let numDays;
		//console.log(rate.split("$")[1]);
		
		if (shipRatesDict.length >= 1) {
			shipRatesDict.forEach(function(shipRate) {
				//console.log(shipRate.name + " ?= " + provider);
				if (shipRate.name.includes(provider)) {
					isIn = 1;
				} else {
					//console.log("calc del time for: " + provider);
					let dateConv;
					if(delTime.indexOf("Tomorrow") > -1) {
						dateConv = new Date(Date.now() + (1000 * 3600 * 24));
						numDays = getBusinessDatesCount(dateConv);
						//console.log("Tomorrow");
						//console.log(shipArrive);
					} else if (delTime.indexOf(" day") > -1 && provider.indexOf("Home Delivery") > -1) {
						//console.log(delTime);
						numDays = parseInt(delTime.split(" day")[0]);
						dateConv = new Date(Date.now() + (1000 * 3600 * 24 * numDays));
						numDays = getBusinessDatesCount(dateConv, 1);
					} else if (delTime.indexOf(" day") > -1) {
						numDays = parseInt(delTime.split(" day")[0]);
						dateConv = new Date(Date.now() + (1000 * 3600 * 24 * numDays));
						numDays = getBusinessDatesCount(dateConv, 1);
					} else {
						//console.log("after tom");
						dateConv = new Date(String((new Date).getFullYear()) + "-" + delTime.split(" ")[1].split("/")[0] + "-" + delTime.split(" ")[1].split("/")[1]);
						if (dateConv - Date.now() < 0) {
							dateConv = new Date(String((new Date).getFullYear() + 1) + "-" + delTime.split(" ")[1].split("/")[0] + "-" + delTime.split(" ")[1].split("/")[1]);
						}
						//console.log("shipping: " + shipRate.name);
						//console.log("estimated: " + dateConv);
						//console.log("provider: " + dateConv);
						numDays = getBusinessDatesCount(dateConv);
						//console.log(shipArrive);
					}
					//let daysTill = Math.ceil((shipArrive | Date.now()) / (1000 * 3600 * 24));
					//console.log(shippingRates[y]);
					//console.log(shipArrive);
				}
			})
		} else {
			//console.log("calc del time for: " + provider);
			let dateConv;
			if(delTime.indexOf("Tomorrow") > -1) {
				dateConv = new Date(Date.now() + (1000 * 3600 * 24));
				numDays = getBusinessDatesCount(dateConv);
				//console.log("Tomorrow");
				//console.log(shipArrive);
			} else if (delTime.indexOf(" day") > -1) {
				numDays = parseInt(delTime.split(" day")[0]);
				dateConv = new Date(Date.now() + (1000 * 3600 * 24 * numDays));
				numDays = getBusinessDatesCount(dateConv, 1);
			} else {
				//console.log("after tom");
				dateConv = new Date(String((new Date).getFullYear()) + "-" + delTime.split(" ")[1].split("/")[0] + "-" + delTime.split(" ")[1].split("/")[1]);
				if (dateConv - Date.now() < 0) {
					dateConv = new Date(String((new Date).getFullYear() + 1) + "-" + delTime.split(" ")[1].split("/")[0] + "-" + delTime.split(" ")[1].split("/")[1]);
				}//console.log("provider: " + dateConv);
				//console.log("estimated: " + dateConv);
				numDays = getBusinessDatesCount(dateConv);
				//console.log(shipArrive);
			}
		}
		//console.log(isIn);
		
		if (isIn == 0) {
			let floatRate = parseFloat(rate.split("$")[1]);
			//console.log(floatRate);
			//console.log(provider);
			//console.log(numDays);
			//console.log(delTime);
			let shipMap = {cost: floatRate, name: provider, time: numDays, estimate: delTime};
			shipRatesDict.push(shipMap);
		}
		if(!shippingRates.includes(shipString)){
			shippingRates.push(shipString);
			rateref.push(Number(rate.split("$")[1].split("-")[0]));
		}
	} else if (endFlag != 0) {
		
		//console.log("Finished Shipping, return rates");
		cheapest = shippingRates[rateref.indexOf(Math.min(...rateref))];
		//selCheapest(cheapest);
		
		ptarget = document.evaluate("/html/body/div[2]/div/div", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
		pobserver.observe(ptarget, {
		  childList: true,
		  subtree: true,
		});
		for(y=0;y<shippingRates.sort().length;y++){
			let shipArrive;
			if(shippingRates.sort()[y].split("-")[2].indexOf("Tomorrow") > -1) {
				shipArrive = new Date(Date.now() + (1000 * 3600 * 24));
				//console.log("Tomorrow");
				//console.log(shipArrive);
			} else {
				//console.log("after tom");
				shipArrive = new Date("2025-" + shippingRates.sort()[y].split("-")[2].split(" ")[1].split("/")[0] + "-" + shippingRates.sort()[y].split("-")[2].split(" ")[1].split("/")[1]);
				//console.log(shipArrive);
			}
			//let daysTill = Math.ceil((shipArrive | Date.now()) / (1000 * 3600 * 24));
			//console.log(shippingRates[y]);
			//console.log(shipArrive);
			let daysTill = getBusinessDatesCount(shipArrive);
			let formatrate;
			if (shippingRates.sort()[y].split("-")[1].indexOf("FedEx Home Delivery") > -1) {
				formatrate = shippingRates.sort()[y].split("-")[0] + " | " + shippingRates.sort()[y].split("-")[1] + " | " + shippingRates.sort()[y].split("-")[2] + " (include weekend)";
			} else if (shippingRates.sort()[y].split("-")[1].indexOf("FedEx Ground") > -1) {
				formatrate = shippingRates.sort()[y].split("-")[0] + " | " + shippingRates.sort()[y].split("-")[1] + " | " + shippingRates.sort()[y].split("-")[2];
			} else {
				formatrate = shippingRates.sort()[y].split("-")[0] + " | " + shippingRates.sort()[y].split("-")[1] + " | " + daysTill + " day(s)";
			}
			formattedRates = formattedRates + formatrate + "\n";
		}
		
		//new stuff
		let newFormat = "";
		let sortedArray = getShipRates();
		sortedArray.forEach((eachRate) => {
			newFormat = newFormat + "$" + eachRate.cost.toString() + " | " + eachRate.name + " | " + eachRate.time.toString() + " business day(s)" + "\n";
		})
		newCheapest(sortedArray[0]);
		
			if (secretShop == 1) {
			alert("THIS IS A SECRET SHOPPER, MAKE SURE EVERYTHING IS AS NEEDED"  + "\n\n" + "Cheapest rate was: " + sortedArray[0].name + "\n\n" + "Out of:\n\n" + newFormat);
		} else if (paidflag > 0 && skipPaid == 0) {
			alert("Cheapest rate was: " + sortedArray[0].name + "\n\n" + "Check to make sure the shipping rate is cheaper than what the customer paid:" + "\n\n" + "Out of:\n\n" + newFormat);
		} else if (skipPaid == 0) {
			alert("Cheapest rate was: " + sortedArray[0].name + "\n\n" + "Out of:\n\n" + newFormat);
		}
		
		let shipDiv = document.createElement("div");
		//shipDiv.innerText = formattedRates;
		shipDiv.innerText = newFormat;
		shipDiv.setAttribute("style", "display: block; position: fixed; z-index: 100; pointer-events: none; color: var(--green-00331C); top: 82vh; right: 500px; border-radius: 7px; background: white;")
		document.body.parentElement.prepend(shipDiv);
		//getShipRates();
	}
}

function shipCond() {
	
	//safe area to target for each event dispatch
	let pageTarget = document.getElementsByClassName("body-j6miezO")[0];
	
	//record the shipping rate after the first run, so as not to save the default rate on order load
	try {
		if (tflag > 0 && Number.isInteger(tflag/2)) {
			recordShip();
		}
	} catch {}
	//console.log(packflag + " | " + paidflag + " | " + businessFlag);
	
	let shipFlag;
	let useShipMap;
	if (packflag == 1 && paidflag == 0) {
		if (businessFlag == 0) {
			shipFlag = "Small";
		} else if (businessFlag == 1) {
			shipFlag = "Small (Business)";
		}
	} else if (packflag == 0 && paidflag == 0) {
		if (businessFlag == 0) {
			shipFlag = "Large";
		} else if (businessFlag == 1) {
			shipFlag = "Large (Business)";
		}
	} else if (packflag == 0 && paidflag == 2) {
		shipFlag = "Paid Large (2-Day)";
	} else if (packflag == 1 && paidflag == 2) {
		shipFlag = "Paid Small (2-Day)";
	} else if (paidflag == 1) {
		shipFlag = "Paid (1-Day)";
	}
	
	if (changeShipFlag == 0) {
		useShipMap = mapType[shipFlag];
	} else if (changeShipFlag == 1) {
		useShipMap = tempMap(shipFlag, ["UPS 3 Day Select®", "UPS Next Day Air Saver®"]);
	} else if (changeShipFlag == 90) {
		useShipMap = [fedexsp];
	}

	if (bestBuyFlag == 1 && packflag == 0) {
		shipFlag = "Paid Large (2-Day)";
	} else if (bestBuyFlag == 1 && packflag == 1) {
		shipFlag = "Paid Small (2-Day)";
	}
	
	if (tflag >= 0) {
		if (Number.isInteger(tflag/2)) {
			try{
				//console.log(useShipMap);
				pageTarget.dispatchEvent(useShipMap[tflag/2]);
				if (useShipMap.length == tflag/2) {
					recordShip(1);
					tflag = -3;
				}
			} catch {
				recordShip(1);
				tflag = -3;
			}
		}
		tflag++;
	}
}

let tobserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
  	shipCond();
  });
});


let pobserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
  	try {
  		let cloneNotif = mutation.target.firstElementChild.firstElementChild.children[1].children[1].innerText;
  		if (cloneNotif == "Printing") {
  			setTimeout(()=> {
  				window.close();
  			},5000)
  		}
  	} catch {}
  	});
});


let tempArr = [];
new PerformanceObserver((entryList) => {
  for (const entry of entryList.getEntries()) {
  	if (tempArr.includes(entry.name) ) {}
  	else {
    	tempArr.push(entry.name);
  	}
  }
}).observe({type: 'resource', buffered: true});

let runFlag = 0;

new PerformanceObserver((entryList) => {
  for (const entry of entryList.getEntries()) {
    // The 'entry' object contains information about the LCP candidate.
    // The last entry in the list for a given page load represents the LCP.
    //console.log('Largest Contentful Paint candidate:', entry.startTime, entry);
    //if (entry.url.includes("cdn.shipstation.com")) {
    	//console.log(entry);
    if (entry.name.indexOf("managesubscription") > -1 && runFlag == 0) {
    	//console.log(entry.name);
    	runFlag++;
    	//setTimeout(function() {
	  		settingsButton();
	  		
				if (window.location.href.includes("https://ship11.shipstation.com/scan")){
					initialize();
				} else if (window.location.href.includes("https://ship11.shipstation.com/settings/automationrules")) {
					setTimeout(function() {
		    		document.querySelector("[class*='reprocess']").parentElement.moveBefore(document.querySelector("[class*='reprocess']"),document.querySelector("[class*='top-content']"))
					}, 1000);
				} 
    	//}, 100);
    }

    // To get the actual LCP element, you can access entry.element or entry.url (for images).
    // Note that the LCP element might not be available directly in all cases
    // if the element is removed from the DOM before the observer fires.
  }
}).observe({type: 'resource', buffered: true});

/*
new PerformanceObserver((entryList) => {
  for (const entry of entryList.getEntries()) {
    // The 'entry' object contains information about the LCP candidate.
    // The last entry in the list for a given page load represents the LCP.
    //console.log('Largest Contentful Paint candidate:', entry.startTime, entry);
    //if (entry.url.includes("cdn.shipstation.com")) {
    	//console.log(entry);
    if (entry.size > 50000 && runFlag == 0) {
    	runFlag++;
    	//setTimeout(function() {
	  		settingsButton();
	  		
				if (window.location.href.includes("https://ship11.shipstation.com/scan")){
					initialize();
				} else if (window.location.href.includes("https://ship11.shipstation.com/settings/automationrules")) {
					setTimeout(function() {
		    		document.querySelector("[class*='reprocess']").parentElement.moveBefore(document.querySelector("[class*='reprocess']"),document.querySelector("[class*='top-content']"))
					}, 2000);
				} 
    	//}, 100);
    }

    // To get the actual LCP element, you can access entry.element or entry.url (for images).
    // Note that the LCP element might not be available directly in all cases
    // if the element is removed from the DOM before the observer fires.
  }
}).observe({type: 'largest-contentful-paint', buffered: true});
*/


//https://app.launchdarkly.com/sdk/evalx


//document.evaluate("//*[text()='ShipStation Connect Missing']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;





