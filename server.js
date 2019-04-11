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
var http = require('http');
var formidable = require('formidable');
var fs = require('fs');
app.use(bodyParser.urlencoded({extended: true}))

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

app.post('/upload', function (req, res){
    var form = new formidable.IncomingForm();
    form.parse(req);
    form.on('fileBegin', function (name, file){
        file.path = __dirname + '/uploads/' + file.name;
    });
    form.on('file', function (name, file){
        console.log('Uploaded ' + file.name);
    });
    res.redirect('/')
});


app.post('/informationRequest', (req, res) => {

    db.collection('userinfo-new').save(req.body, (err, result) => {
    if (err) return console.log(err)
    console.log('Saved to database')
    res.redirect('/')


    /****************************************************/
    async function main(){
      // Generate test SMTP service account from Gmail Email
      let testAccount = await nodemailer.createTestAccount();

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
        subject: "Track 76198475 SDW Logs", // Subject line
        attachments: {path: 'logs/76198475_SDW.txt'},
        text: "", // plain text body
        html: "<b>The attachment is for 76198475. It contains SDW logs.</b>" // html body
      });
      console.log("Message sent: %s", info.messageId);
      // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
    }
    main().catch(console.error);
    /*******************************************************************************/

  })
})


/* Ideas on how to implement */
/* 
1) Have JS hold their email (will be in console.log)
2) When they submit the logs, have node check their mongodb email & tracking email with the one in JS
3) If there is a match, go ahead and submit the logs with the correct information in the backend after grabbing the text files
*/