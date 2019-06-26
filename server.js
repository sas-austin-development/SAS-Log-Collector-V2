/********************************************************/
/******************** Express Server ********************/
/********************************************************/

/*********** Setting up DATABASE Connection ***********/
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();
var db;

/*********** DATABASE info is in .ENV File ***********/
MongoClient.connect(process.env.DATABASE, (err, client) => {
  if (err) return console.log(err);
  db = client.db('log-collector-demo'); // whatever your database name is
  console.log(`MongoDB connection open on ${process.env.DATABASE}`);
})
/*To Start the MONGODB service: sudo service mongod start */


/*********** Requirements and Server Setup ***********/
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const app = express();
const nodemailer = require("nodemailer");
var formidable = require('formidable');
var fs = require('fs');
app.use(bodyParser.urlencoded({extended: true}));
const _cliProgress = require('cli-progress');
var cmd=require('node-cmd');
var FTPS = require('ftps'); //https://www.npmjs.com/package/ftps


/*********** HostName & Port ***********/
const hostname = '172.25.73.162';
const port = 80;
const httpServer = http.createServer(app);



/*********** FTP Requirements ***********/
const ftp = require("basic-ftp");


/*********** Setting the Port to Listen To ***********/
// app.listen(3000, function() {
//   console.log('listening on 3000')
// })
httpServer.listen(port, hostname);


/*********** Using Static Files like CSS/JS to Display with Response ***********/
app.use(express.static(__dirname + '/public'));

/*********** When User Gets / The Index.HTML is Displayed with Static CSS and JS ***********/
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
  console.log('Arrived at Index Home')
})


/*Idea, send info to Database, set equal to key, pull info from database on form.on*/
/*********** Formidable Node.JS Library to Import User Submitted Form & Save to Disk ***********/
app.post('/upload', function (req, res){
    /* Formidable Default Variable for Form Function */
    var form = new formidable.IncomingForm();
    /* Later Make This a Hash Key */
    var key = Math.floor(Math.random() * Math.floor(9999999999999999));
    console.log(key);

    /* Creating a Document (ROW) in MongoDB with a Key (ID) for the Customer for later Matching */
    db.collection('userinfov2').insert({id: key});
   
    /* Getting the req.body Info (Tracking Number, Email, OS) */
    form.parse(req, function(err, fields, files, name, file) 
          {
            let custTrackingNumber2 = fields.trackingNumber;
            let custEmail2 = fields.email;
            let custOperatingSystem2 = fields.operatingSystem;
            let custInfoArray2 = [custTrackingNumber2, custEmail2, custOperatingSystem2];
            db.collection('userinfov2').update({id: key}, {$set: {"custEmail": custEmail2}});
            db.collection('userinfov2').update({id: key}, {$set: {"custTrackingNumber": custTrackingNumber2}});
            db.collection('userinfov2').update({id: key}, {$set: {"custOperatingSystem": custOperatingSystem2}});
            console.log(custInfoArray2); 
     });

    /* Change Default Options | Sets the Path Name and Submits it 
    /* fileBegin - Emitted whenever a new file is detected in the upload stream. 
    /* Use this event if you want to stream the file to somewhere else while buffering the upload on the file system*/
    form.on('fileBegin', function (name, file){
      form.on('progress', function(bytesReceived, bytesExpected) {
      /*The bellow to variables are outputting a Percentage Complete*/
      let percentageUpload = 100*bytesReceived/bytesExpected;
      let percentageUploadFixed = percentageUpload.toFixed(2) + '%';

      const bar1 = new _cliProgress.Bar({}, _cliProgress.Presets.shades_classic);
      bar1.start(bytesExpected,bytesReceived);
      bar1.update(bytesReceived);
      console.log("File Uploading", percentageUploadFixed)
       });
      file.path = __dirname + '/uploads/'+key+'.zip' ;   
      console.log("File Path Set to: "+  file.path);
    });

    /* Submits Confirmation Message for the File to Defined Directory */
    /* file command - Emitted whenever a field / file pair has been received. file is an instance of File. */
    form.on('file', function (name, file){;

      console.log('Upload Complete: ' + file.name); 
      console.log('Sending Email to support@sas.com'); 
      form.on('progress', function(bytesReceived, bytesExpected) {
      console.log("File Uploading1", percentageUpload)
       });
    });

    /* Runs after File Transfer Finishes - fs.rename Renames the File - Grabs Info from Database - Sends Email*/
    form.on('end', function() {
        /* Grabs the Tracking Number w/ Use of the Generated User Identifier */
        db.collection('userinfov2').find({id:key}, {projection: { _id: 0, custEmail: 1, custTrackingNumber: 1}})
              .toArray((function(err, result){
                   if (err) throw err;
                  
                   /* The Resulting Tracking Number from the DB is an Object inside an Array */
                   let custTrackingNumber = result[0].custTrackingNumber;
                   let custEmail = result[0].custEmail;
                   // console.log(custTrackingNumber);
                   // console.log(custEmail);
                   
                   /* Renames the File with the Tracking Number */
                   fs.rename('./uploads/'+key+'.zip', './uploads/'+custTrackingNumber+'.zip', function (err) {
                      if (err) throw err;
                      // console.log('renamed complete');
                  });

                  /* REGEX Email Validation Function */
                  function validateEmail(email) //source: http://form.guide/best-practices/validate-email-address-using-javascript.html
                   {
                      var re = /^(?:[a-z0-9!#$%&amp;'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&amp;'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/;
                      return re.test(email); //Returns True if Emails Passes Test
                   }

                  /* Setup Configuration to SAS FTP */
                      var ftps = new FTPS({
                          host: 'ftp.sas.com', // required
                          username: '', // Optional. Use empty username for anonymous access.
                          password: '', // Required if username is not empty, except when requiresPassword: false
                          protocol: 'ftp', // Optional, values : 'ftp', 'sftp', 'ftps', ... default: 'ftp'
                          requiresPassword: false, // Optional, defaults to true

                      });
                  /* FTP Logs to SAS */
                      ftps.ls()
                      ftps.cd('/techsup/upload').put('uploads/'+custTrackingNumber+'.zip').exec(console.log);
                     

                  /* Email Validator - Just in Case Frontend Validator fails */
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
         }));
    });
   
    /* User needs a Post Response (Redirect to Home -> Bypass in Index) */
    res.redirect('/');
});
