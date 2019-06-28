/**********************************************/
/******* Submit Logs Button Java Script *******/
/**********************************************/

/* This is the Button Javascript for the Generate Log Assistance Button */
/* So far, I have been able to apply new elements to UL element with DOM Manipulation */
/* Using the Hidden Function, we can also un-hide the SDW log collection section until User generated */
/* IMPORTANT: Not sure if Hidden Manipulation is available in IE or Opera */


/* Adding DOM Reference for ID's and Assigning them to Variables - These are all under the Collect Information for Log Assistance Section */
// var button = document.getElementById("submitTestButton");
var email = document.getElementById("inputEmail");
var trackingNumber = document.getElementById("inputTrackingNumber");
var log = document.getElementById("inputLog");
var form = document.getElementById("submitTestButton");

/* Setting the Form Response Key to Hidden when the Site loads*/
document.getElementById("dummyframe").hidden = true;




/* Length Function(s) - Finding the Length of an Input and Returning it */ /* Future Efficiency Increase- Implement this into an Array */
function inputLengthEmail() {
	return email.value.length;
}
function inputLengthTrackingNumber() {
	return trackingNumber.value.length;
}
function inputLengthLog() {
	return log.value.length;
}

/* Output Email and Tracking Number Values for Storage Purposes*/
function outputEmail() {
	return email.value;
}
function outputTrackingNumber() {
	return trackingNumber.value;
}
function outputLog() {
	return log.value;
}

/******************************************************************/
/**************** Drop Down Modal Submit Button *******************/
// Get the modal
var modal = document.getElementById('myModal');
// Get the button that opens the modal
var btn = document.getElementById("myBtn");
// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];
// When the user clicks the button, open the modal 
btn.onclick = function() {
	var emailHold = outputEmail();
	var trackingNumberHold = outputTrackingNumber();
	var logHold = outputLog();
	var logSize = inputLengthLog();
	console.log("User's Email: " + emailHold);
	console.log("User's Tracking Number: " + trackingNumberHold);
	console.log("User's Log: " + logHold);
	console.log("User's Log Path Size: " + logSize);

    var emailSize = inputLengthEmail();
    var trackingNumberSize = inputLengthTrackingNumber();
    if (emailSize > 0 && trackingNumberSize > 6 && logSize > 0)
	  {
	  	modal.style.display = "block";
	  }
}
// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}
/*********************************************************************/