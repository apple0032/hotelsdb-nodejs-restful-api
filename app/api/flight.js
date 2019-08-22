var Sequelize = require('sequelize');
const request = require('request');
const Op = Sequelize.Op;

module.exports = (app, db , current) => {
  
  
    app.get( "/flight/searchCounty/:q", async(req, res) => {

      const url = 'https://restcountries.eu/rest/v2/name/'+req.params.q;

      request(
        { method: 'GET',
          uri: url,
          gzip: true
        },
      function (error, response, result) {
          // body is the decompressed response body
          console.log(url);
          //console.log('server encoded the data as: ' + (response.headers['content-encoding'] || 'identity'));
          //console.log('the decoded data is: ' + body);

          result = JSON.parse(result);
    //        var countries = [];
    //        for (const re of result) {
    //            countries.push({name: re.name, code: re.alpha2Code});
    //        };

          res.setHeader('Content-Type', 'application/json');
          res.send({
              result: 'success',
              countries: result
          });
        }
      )
      .on('data', function(data) {
        // decompressed data as it is received
       // console.log('decoded chunk: ' + data);
      })
      .on('response', function(response) {
        // unmodified http.IncomingMessage object
        response.on('data', function(data) {
          // compressed data as it is received
          //console.log('received ' + data.length + ' bytes of compressed data');
        });
      });

      }
    );

  
    app.get( "/flight/searchAirport/:q", async(req, res) => {
        
        const airports = await db.airports.findAll({
            where: {
               iso_country: {
                 [Op.eq]: req.params.q
               },
               iata_code: {
                 [Op.ne]: null
               },
               municipality: {
                 [Op.ne]: ''
               },
               type: {
                 [Op.eq]: "large_airport"
               }
            },
            order : [['name', 'ASC']],
            attributes : ['id','iata_code','name','municipality']
        });
        
        res.send({
            result: 'success',
            country_code: req.params.q,
            total: airports.length,
            airports: airports
        });
        
      }
    );
  
};