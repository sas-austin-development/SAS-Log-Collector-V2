/**************************************************************************/
/******************** SAS Log Collector Express Server ********************/
/**************************************************************************/

/******************************************************/
/***********************OVERVIEW***********************/
/******************************************************/
/* This is a NodeJS Web Application Server utilizing Express.JS. Express
/* is a minimalistic Web Framework for NodeJS that greatly increases production 
/* time and readability. 

/* This application utilizes a Linux MongoDatabase (MongoDB) that is important
/* for record keeping as well as crucial application usage. The NodeJS App
/* will make check with the Database when creating log filenames and paths 
/* for FTP and Email purposes

/* Any questions or concerns on syntax/code/methodology should be sent to
/* Kris Stobbe (Kris.Stobbe@sas.com) or Diego Hernandez (Diego.Hernandez@sas.com)
*/


/*********** Setting up Mongo DATABASE Connection ***********/
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config(); //Configration file for MongoDB Client
var db;

/*********** DATABASE info is in .ENV File ***********/
MongoClient.connect(process.env.DATABASE, (err, client) => {
  if (err) return console.log(err);
  db = client.db('log-collector-demo'); //MongoDatabase Name (Name will Change when in PROD)
  console.log(`MongoDB connection open on ${process.env.DATABASE}`);
})
/*NOTE: To Start the MONGODB service: sudo service mongod start */


/*********** Requirements and Server Setup ***********/
const express = require('express'); //https://expressjs.com/
const http = require('http'); //https://nodejs.org/api/http.html
const bodyParser = require('body-parser'); //https://www.npmjs.com/package/body-parser
const app = express(); //Creating the Express App
const nodemailer = require("nodemailer"); //https://nodemailer.com/about/
var formidable = require('formidable'); //https://www.npmjs.com/package/formidable
var fs = require('fs'); //https://nodejs.org/api/fs.html
app.use(bodyParser.urlencoded({extended: true})); //Required for Formidable (Helps make the form sent be more user readable)
const _cliProgress = require('cli-progress'); //https://www.npmjs.com/package/cli-progress
var cmd = require('node-cmd'); //https://www.npmjs.com/package/node-cmd
var FTPS = require('ftps'); //https://www.npmjs.com/package/ftps
const ftp = require("basic-ftp"); //https://www.npmjs.com/package/ftp

/*********** HostName & Port Configuration ***********/
const hostname = '172.25.73.162'; //stormfly.na.sas.com
const port = 80; //normal HTTP Port
const httpServer = http.createServer(app); //HTTP Server Reference (Utilizing Express Server)
httpServer.listen(port, hostname);

/*********** Using Static Files like CSS/JS to Display with Response ***********/
app.use(express.static(__dirname + '/public'));

/*********** When User Goes to Home The Index.HTML is Displayed with Static CSS and JS ***********/
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
  console.log('Arrived at Index Home')
})

/*********** POST Method: Uploading Logs to Stormfly.na.sas.com ***********/
app.post('/upload', function (req, res){ 
    /* Formidable Default Variable for Form Function */
    var form = new formidable.IncomingForm();

    /* Later Make This a Hash Key */
    var key = Math.floor(Math.random() * Math.floor(9999999999999999)); //Assigning a random key to each user who submits a log

    //This will be used for assigning the log to a particular user in the form field
    console.log(key); //Prints out key for logging purposes

    /* Creating a Document (ROW) in MongoDB with a Key (ID) for the Customer for later Matching */
    db.collection('userinfov2').insert({id: key});
   
    /* Getting the req.body Info (Tracking Number, Email, OS) */
    form.parse(req, function(err, fields, files, name, file) 
          {
          	/* Creating User Variables */
            let custTrackingNumber = fields.trackingNumber; //Assigning a Tracking number Variable to the incoming form: Tracking Number
            let custEmail = fields.email; //Assigning an Email Variable to the incoming form: Email
            let custOperatingSystem = fields.operatingSystem; //Assigning an Operating System Variable to the incoming form: Operating System
            let custInfoArray = [custTrackingNumber, custEmail, custOperatingSystem]; //Creating an Array for logging purposes

            /* Setting User Variables to MongoDb Doc */
            db.collection('userinfov2').update({id: key}, {$set: {"custEmail": custEmail}}); //Assigning Email to Custom Key ID
            db.collection('userinfov2').update({id: key}, {$set: {"custTrackingNumber": custTrackingNumber}}); //Asigning Tracking Number to Custom Key ID
            db.collection('userinfov2').update({id: key}, {$set: {"custOperatingSystem": custOperatingSystem}}); //Assigning OS to Custom Key ID

            /*Submitting Info Array for Logging Purposes */
            console.log(custInfoArray); 
     });

    /* Change Default Options | Sets the Path Name and Submits it */
    form.on('fileBegin', function (name, file){
    /* fileBegin - Emitted whenever a new file is detected in the upload stream. */
    /* Use this event if you want to stream the file to somewhere else while buffering the upload on the file system*/

      form.on('progress', function(bytesReceived, bytesExpected) {
      /*The bellow to variables are outputting a Percentage Complete*/
      let percentageUpload = 100*bytesReceived/bytesExpected;
      let percentageUploadFixed = percentageUpload.toFixed(2) + '%';

      /* Updating CLI Bar for Logging Purposes */
      const bar1 = new _cliProgress.Bar({}, _cliProgress.Presets.shades_classic);
      bar1.start(bytesExpected,bytesReceived);
      bar1.update(bytesReceived);

      /* Logging the Current Upload Percentage */
      console.log("File Uploading ", percentageUploadFixed)
      });

      /* Setting Log Path to /uploads + the Tracking Number */
      file.path = __dirname + '/uploads/'+key+'.zip' ;   
      console.log("File Path Set to: "+  file.path);
    });

    /* Submits Confirmation Message for the File to Defined Directory */
   
    form.on('file', function (name, file){;
 	/* file command - Emitted whenever a field / file pair has been received. file is an instance of File. */

 	  /* Log - Upload is Complete and Submits the File Name */
      console.log('Upload Complete: ' + file.name); 

      /*Tells Log where the email is being submitted to (Hint: Support@sas.com)*/
      console.log('Sending Email to support@sas.com'); 

      /* Submits Progress to Log */
      form.on('progress', function(bytesReceived, bytesExpected) {
      console.log("File Uploading: ", percentageUpload)
       });
    });

    /* Runs after File Transfer Finishes - fs.rename Renames the File - Grabs Info from Database - Sends Email*/
    form.on('end', function() {
        /* Grabs the Tracking Number w/ Use of the Generated User Identifier */
        db.collection('userinfov2').find({id:key}, {projection: { _id: 0, custEmail: 1, custTrackingNumber: 1}})
              .toArray((function(err, result){
              	   /* In case there is an error with the key, email, number being grabbed from MongoDB, an error will be logged */
                   if (err) throw err;
                  
                   /* The Resulting Tracking Number from the DB is an Object inside an Array */
                   let custTrackingNumber = result[0].custTrackingNumber; //This took some diving to find, just simply how formidable creates form objects
                   let custEmail = result[0].custEmail;
                   
                   /* Renames the File with the Tracking Number */
                   fs.rename('./uploads/'+key+'.zip', './uploads/'+custTrackingNumber+'.zip', function (err) {
                      if (err) throw err;
                  });

                  /* REGEX Email Validation Function */          
                  function validateEmail(email) //source: http://form.guide/best-practices/validate-email-address-using-javascript.html
                   {
                   	  /* Simple Regex that passes for almost every valid email */
                      var re = /^(?:[a-z0-9!#$%&amp;'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&amp;'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/;
                      return re.test(email); //Returns True if Emails Passes Test
                      /* Currently not being used, but may be useful in the future */
                   }

                  /* Setup Configuration to SAS FTP */
                      var ftps = new FTPS({
                          host: 'ftp.sas.com', // required
                          username: '', // Optional. Use empty username for anonymous access.
                          password: '', // Required if username is not empty, except when requiresPassword: false
                          protocol: 'ftp', // Optional, values : 'ftp', 'sftp', 'ftps', ... default: 'ftp'
                          requiresPassword: false, // Optional, defaults to true

                      });

                  /**************************************/
                  /*************** FTP ******************/
                  /**************************************/
                  /* FTP Logs to SAS */
                      ftps.ls() //List current directory (Logging Purposes)

                      /* Changes directory to /upload, and uploads the correct log */
                      /* NOTE: This will need to be updated for Tracks that have more than 1 log per Track */
                      ftps.cd('/techsup/upload').put('uploads/'+custTrackingNumber+'.zip').exec(console.log);
                     

                  /***************************************************/
                  /******** Send out the Email with Attachment *******/
                  /***************************************************/
                      async function main(){
                          // create reusable transporter object using the default SMTP transport
                          let transporter = nodemailer.createTransport({
                            host: "mailhost.fyi.sas.com",
                            port: 25,
                            secure: false, // true for 465, false for other ports
                            tls: {rejectUnauthorized: false},
                            debug: false,
                            logger: true 
                          });
                          // send mail with defined transport object
                          let info = await transporter.sendMail({
                            from: custEmail, // sender address
                            to: 'support@sas.com', // list of receivers
                            subject: '7612716859', // Subject line
                            attachments: {path: 'uploads/'+custTrackingNumber+'.zip'},
                            text: "", // plain text body
                            html: "<b>The attachment is for Tracking Number: "+custTrackingNumber+". It contains SDW logs.</b>" // html body
                          });
                          console.log("Message sent: %s", info.messageId);
                          // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
                      }
                      main().catch(console.error);
                    /*******************************************************************************/
         /* End of MongoDB Collection */
         }));
    /* End of FORM */
    });
   
    /* User needs a Post Response (Redirect to Home -> Bypass in Index) */
    res.redirect('/');
/* End of Post */
});
