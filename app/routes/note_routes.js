const base= "/api";
var upperCase = require('upper-case');
var upperCaseFirst = require('upper-case-first');
module.exports = function(app, db) {
  

    app.get(base, (req, res) => {
        res.send("Welcome to API");
    });

    app.get(base+'/pvs/id/:id', (req, res) => {
        const id = req.params.id;
        const details = { '_id': id };
        db.collection('ALLPVS').findOne(details, (err, item) => {
          if (err) {
            res.send({'error':'An error has occurred'});
          } else {
            res.send(item);
          }
        });
    });

    app.get(base+'/pvs/name/:name', (req, res) => {
      const name = req.params.name;
      const regex = RegExp("/.*" + name + ".*/");
      const details = { 'System': new RegExp(name,'i')};

      db.collection('DirectoryCollection').find(details).toArray(function(err, result) {
        if (err) throw err;
        res.send(result);
      });
  });

    app.get(base+'/pvs', (req, res) => {
      db.collection("PVSystemProfiles").find({}).toArray(function(err, result) {
        if (err) throw err;
        res.send(result);
      });
    });

      app.get(base+'/pvs/country/:country', (req, res) => {   
        const country = upperCase(req.params.country);
        if (country!="ALL"){
          var query = { "Country":country };
        
          db.collection("DirectoryCollection").find(query).toArray(function(err, result) {
            if (err) throw err;
            res.send(result)
            });
        }else{
          db.collection("DirectoryCollection").find({}).toArray(function(err, result) {
            if (err) throw err;
            res.send(result)
            });
        }
        });
        
  

       app.get(base+'/getCountries', (req, res) => {  
        db.collection("DirectoryCollection").distinct("Country",function(err, result) {
          if (err) throw err;
          res.send(result)
        });
       });

  };