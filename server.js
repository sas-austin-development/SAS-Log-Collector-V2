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
const bcrypt = require('bcrypt-nodejs');
const app = express();
const nodemailer = require("nodemailer");
const busboyBodyParser = require('busboy-body-parser');
var http = require('http');
var formidable = require('formidable');
var fs = require('fs');
app.use(bodyParser.urlencoded({extended: true}));
//parse multipart/form-data    
app.use(busboyBodyParser());

/*********** Setting the Port to Listen To ***********/
app.listen(3000, function() {
  console.log('listening on 3000')
})

/*********** Using Static Files like CSS/JS to Display with Response ***********/
app.use(express.static(__dirname + '/public'));
/*********** When User Gets / The Index.HTML is Displayed with Static CSS and JS ***********/
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
  console.log('Arrived at Index Home')

})



app.post('/informationRequest', (req, res) => {
    /*********************************************************/
    /********Setting up Varriables to intake Form Data *******/
    /*********************************************************/
    res.locals.custEmail = req.body.email;
    res.locals.custTrackingNumber = req.body.trackingNumber;
    res.locals.custOperatingSystem = req.body.operatingSystem;
    console.log(res.locals.custEmail);
    console.log(res.locals.custTrackingNumber);
    console.log(res.locals.custOperatingSystem);

    /*********************************************************************************/
    /******** Sending Email, Tracking Number, and Operating System to Database *******/
    /*********************************************************************************/
    db.collection('userinfo-new').save(req.body, (err, result) => {
    if (err) return console.log(err)
    console.log('Saved to database')
    res.redirect('/')
  })

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
        to: "saslogcollector@gmail.com", // list of receivers
        subject: "Tracking Number:  SDW Logs", // Subject line
        attachments: {path: 'logs/76198475_SDW.txt'},
        text: "", // plain text body
        html: "<b>The attachment is for Tracking Number. It contains SDW logs for the following Operating System.</b>" // html body
      });
      console.log("Message sent: %s", info.messageId);
      // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
    }
    main().catch(console.error);
    /*******************************************************************************/
})


app.post('/upload', function (req, res){
    console.log(req);
    console.log(req.body.trackingNumber);
    var form = new formidable.IncomingForm();
    form.parse(req);
    form.on('fileBegin', function (name, file){
        file.path = __dirname + '/uploads/' + "test7.txt";
    });
    form.on('file', function (name, file){
        console.log('Uploaded ' + file.name);
    });
    res.redirect('/')

});

