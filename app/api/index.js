const path = require('path');

module.exports = (app, db , current) => {

  app.get( "/index", (req, res) => {

      //res.json({ result: 'success', message: 'The node.js application is running.' });
      res.sendFile(path.join(__dirname+'/../../index.html'));
  });
  
};