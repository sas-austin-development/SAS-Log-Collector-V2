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

/*********** Requirements and Server Setup ***********/
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const nodemailer = require("nodemailer");
var formidable = require('formidable');
var fs = require('fs');
app.use(bodyParser.urlencoded({extended: true}));

/*********** Setting the Port to Listen To ***********/
app.listen(3000, function() {
  console.log('listening on 3000')
})

/*********** Using Static Files like CSS/JS to Display with Response ***********/
app.use(express.static(__dirname + '/public'));

/*********** When User Gets / The Index.HTML is Displayed with Static CSS and JS ***********/
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/indexTest.html')
  console.log('Arrived at Index Home')

})

/*Idea, send info to Database, set equal to key, pull info from database on form.on*/
/*********** Formidable Node.JS Library to Import User Submitted Form & Save to Disk ***********/
app.post('/upload', function (req, res){
   /* Formidable Default Variable for Form Function */
    var form = new formidable.IncomingForm();
    /* Later Make This a Hash Key */
    var key = Math.floor(Math.random() * Math.floor(9999999999999));
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
      console.log("test fileBegin", bytesReceived, bytesExpected)
       });
      file.path = __dirname + '/uploads/'+key+'.txt' ;   
      console.log("File Path Set to: "+  file.path);
    });


    /* Submits Confirmation Message for the File to Defined Directory */
    /* file command - Emitted whenever a field / file pair has been received. file is an instance of File. */
    form.on('file', function (name, file){;
        console.log('Uploaded ' + file.name); 
      form.on('progress', function(bytesReceived, bytesExpected) {
      console.log("test file", bytesReceived, bytesExpected)
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
                   console.log(custTrackingNumber);
                   console.log(custEmail);
                   
                   /* Renames the File with the Tracking Number */
                   fs.rename('./uploads/'+key+'.txt', './uploads/'+custTrackingNumber+'.txt', function (err) {
                      if (err) throw err;
                      console.log('renamed complete');
                  });

                     /***************************************************/
                     /******** Send out the Email with Attachment *******/
                     /***************************************************/
                        async function main(){
                          // create reusable transporter object using the default SMTP transport
                          let transporter = nodemailer.createTransport({
                            host: "smtp.gmail.com",
                            port: 587,
                            secure: false, // true for 465, false for other ports
                            auth: {
                                user: 'saslogcollector@gmail.com',
                                pass: 'test01**test'
                            }
                          });
                          // send mail with defined transport object
                          let info = await transporter.sendMail({
                            from: '"SAS Log Collector" <saslogcollector@gmail.com>', // sender address
                            to: custEmail, // list of receivers
                            subject: custTrackingNumber, // Subject line
                            attachments: {path: 'uploads/'+custTrackingNumber+'.txt'},
                            text: "", // plain text body
                            html: "<b>The attachment is for Tracking Number. It contains SDW logs for the following Operating System.</b>" // html body
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