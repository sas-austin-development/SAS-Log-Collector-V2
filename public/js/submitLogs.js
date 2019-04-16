/**********************************************/
/******* Submit Logs Button Java Script *******/
/**********************************************/

/* This is the Button Javascript for the Generate Log Assistance Button */
/* So far, I have been able to apply new elements to UL element with DOM Manipulation */
/* Using the Hidden Function, we can also un-hide the SDW log collection section until User generated */
/* IMPORTANT: Not sure if Hidden Manipulation is available in IE or Opera */


/* Adding DOM Reference for ID's and Assigning them to Variables - These are all under the Collect Information for Log Assistance Section */
var button = document.getElementById("generateLogAssistance");
var input = document.getElementById("testId");
var ul = document.getElementById("itemList");
var email = document.getElementById("inputEmail");
var trackingNumber = document.getElementById("inputTrackingNumber");
var form = document.getElementById("submitTestButton");

/* Setting the Header and Body Hidden when the Site loads*/
document.getElementById("testsdwcheck").hidden = false;
document.getElementById("logColectorAssistance").hidden = false;
document.getElementById("dummyframe").hidden = true;


/*MODAL STUFF */
// Get the modal
var modal = document.getElementById('myModal');
// Get the button that opens the modal
var btn = document.getElementById("myBtn");
// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];
// When the user clicks the button, open the modal 
btn.onclick = function() {
  modal.style.display = "block";
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
/*********************/


/* Length Function(s) - Finding the Length of an Input and Returning it */ /* Future Efficiency Increase- Implement this into an Array */
function inputLength() {
	return 1;
}
function inputLengthEmail() {
	return email.value.length;
}
function inputLengthTrackingNumber() {
	return trackingNumber.value.length;
}

function submitAlert(){
	// alert("Your Logs have been Submitted")
}

/* Output Email and Tracking Number Values for Storage Purposes*/
function outputEmail() {
	return email.value;
}
function outputTrackingNumber() {
	return trackingNumber.value;
}


button.addEventListener("click", function() {
			/* Hold the User's Email & Tracking Number */
			var emailHold = outputEmail();
			var trackingNumberHold = outputTrackingNumber();
			console.log("User's Email: " + emailHold);
			console.log("User's Tracking Number: " + trackingNumberHold);
}, false);