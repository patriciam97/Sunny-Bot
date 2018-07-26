const express        = require('express');
const MongoClient    = require('mongodb').MongoClient;
const bodyParser     = require('body-parser');
const db             = require('./config/db');
const cors           = require('express-cors');
const app            = express();
const port = 8000;
app.use(cors({
    allowedOrigins:[
      'http://127.0.0.1:5500',
      'http://127.0.0.1/'
    ]
}))
app.use(bodyParser.urlencoded({ extended: true }));


MongoClient.connect(db.url, (err, database) => {
  if (err) return console.log(err)
  require('./app/routes')(app, database);
  
  app.listen(port, () => {
    console.log('We are live on ' + port);
  });               
})