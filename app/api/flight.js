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
    
    
    app.get( "/flight/result/:from/:to/:date", async(req, res) => {
        
        const json = `{"data":[{"type":"flight-offer","id":"1566473655344-23579278","offerItems":[{"services":[{"segments":[{"flightSegment":{"departure":{"iataCode":"HKG","terminal":"1","at":"2019-08-25T17:00:00+08:00"},"arrival":{"iataCode":"KIX","terminal":"1","at":"2019-08-25T22:00:00+09:00"},"carrierCode":"HX","number":"612","aircraft":{"code":"333"},"operating":{"carrierCode":"HX","number":"612"},"duration":"0DT4H0M"},"pricingDetailPerAdult":{"travelClass":"ECONOMY","fareClass":"S","availability":9,"fareBasis":"SAVW1HS"}}]}],"price":{"total":"2321","totalTaxes":"391"},"pricePerAdult":{"total":"2321","totalTaxes":"391"}}]},{"type":"flight-offer","id":"1566473655344-1499934033","offerItems":[{"services":[{"segments":[{"flightSegment":{"departure":{"iataCode":"HKG","terminal":"1","at":"2019-08-25T01:50:00+08:00"},"arrival":{"iataCode":"KIX","terminal":"1","at":"2019-08-25T06:30:00+09:00"},"carrierCode":"CX","number":"566","aircraft":{"code":"333"},"operating":{"carrierCode":"CX","number":"566"},"duration":"0DT3H40M"},"pricingDetailPerAdult":{"travelClass":"ECONOMY","fareClass":"B","availability":6,"fareBasis":"BAAROWF8"}}]}],"price":{"total":"7302","totalTaxes":"392"},"pricePerAdult":{"total":"7302","totalTaxes":"392"}}]},{"type":"flight-offer","id":"1566473655344-1093828157","offerItems":[{"services":[{"segments":[{"flightSegment":{"departure":{"iataCode":"HKG","terminal":"1","at":"2019-08-25T15:20:00+08:00"},"arrival":{"iataCode":"KIX","terminal":"1","at":"2019-08-25T20:05:00+09:00"},"carrierCode":"NH","number":"874","aircraft":{"code":"737"},"operating":{"carrierCode":"NH","number":"874"},"duration":"0DT3H45M"},"pricingDetailPerAdult":{"travelClass":"ECONOMY","fareClass":"U","availability":9,"fareBasis":"URFJ0O"}}]}],"price":{"total":"5154","totalTaxes":"504"},"pricePerAdult":{"total":"5154","totalTaxes":"504"}}]},{"type":"flight-offer","id":"1566473655344-1364760032","offerItems":[{"services":[{"segments":[{"flightSegment":{"departure":{"iataCode":"HKG","terminal":"1","at":"2019-08-25T01:50:00+08:00"},"arrival":{"iataCode":"KIX","terminal":"1","at":"2019-08-25T06:30:00+09:00"},"carrierCode":"JL","number":"7050","aircraft":{"code":"333"},"operating":{"carrierCode":"CX","number":"7050"},"duration":"0DT3H40M"},"pricingDetailPerAdult":{"travelClass":"ECONOMY","fareClass":"H","availability":4,"fareBasis":"HLN0OGED"}}]}],"price":{"total":"5904","totalTaxes":"504"},"pricePerAdult":{"total":"5904","totalTaxes":"504"}}]},{"type":"flight-offer","id":"1566473655344--723467474","offerItems":[{"services":[{"segments":[{"flightSegment":{"departure":{"iataCode":"HKG","terminal":"2","at":"2019-08-25T15:05:00+08:00"},"arrival":{"iataCode":"KIX","terminal":"1","at":"2019-08-25T20:00:00+09:00"},"carrierCode":"UO","number":"688","aircraft":{"code":"321"},"operating":{"carrierCode":"UO","number":"688"},"duration":"0DT3H55M"},"pricingDetailPerAdult":{"travelClass":"ECONOMY","fareClass":"V","availability":4,"fareBasis":"VGDD"}}]}],"price":{"total":"1379","totalTaxes":"329"},"pricePerAdult":{"total":"1379","totalTaxes":"329"}}]}],"dictionaries":{"carriers":{"HX":"HONG KONG AIRLINES","JL":"JAPAN AIRLINES","CX":"CATHAY PACIFIC","NH":"ALL NIPPON AIRWAYS","UO":"HONG KONG EXPRESS AIRWAYS"},"currencies":{"HKD":"HONGKONG DOLLAR"},"aircraft":{"321":"AIRBUS INDUSTRIE A321","333":"AIRBUS INDUSTRIE A330-300","737":"BOEING 737 ALL SERIES PASSENGER"},"locations":{"HKG":{"subType":"AIRPORT","detailedName":"INTERNATIONAL"},"KIX":{"subType":"AIRPORT","detailedName":"KANSAI INTERNATIONAL"}}},"meta":{"links":{"self":"https://api.amadeus.com/v1/shopping/flight-offers?origin=HKG&destination=KIX&departureDate=2019-08-25&adults=1&nonStop=true&currency=HKD&max=5"},"currency":"HKD"}}`;
        const result = JSON.parse(json);
        
        //flights = ReformingJsonData(result);
        
//        res.send({
//            result: 'success',
//            total: result.length,
//            data: flights
//        });
        
        
        const formData = {
            client_id:     'xChYNnOdtNv79sVHz6rOODrAGnP513h9', 
            client_secret: 'PYUVzTH118ds6P9M', 
            grant_type:  'client_credentials'
        };

        request.post(
            {
                url: 'https://api.amadeus.com/v1/security/oauth2/token',
                form: formData
            },
            function (err, httpResponse, result) {
                
                result = JSON.parse(result);
                var access_token = result.access_token;
                
//                res.setHeader('Content-Type', 'application/json');
//                res.send({
//                    access_token: access_token
//                });
                    
                
                request.get(
                    {
                        url: 'https://api.amadeus.com/v1/shopping/flight-offers?origin='+req.params.from+'&destination='+req.params.to+'&departureDate='+req.params.date+'&nonStop=true&currency=HKD&adults=1&max=50',
                        headers: {
                            Authorization: 'Bearer '+access_token
                        }
                    },
                    function (err, httpResponse, result) {

                            result = JSON.parse(result);
                            result = ReformingJsonData(result);

                            res.setHeader('Content-Type', 'application/json');
                            res.send({
                                result: 'success',
                                total: result.length,
                                data: result
                            });
                    }
                );
                
               
            }
        );
        
        
    });
        
    function ReformingJsonData(result){
        const flights = [];
        for (const data of result.data) {
            const segments = data.offerItems[0].services[0].segments[0];
            const dep_ter = (typeof segments.flightSegment.departure.terminal !== 'undefined') ? 
            segments.flightSegment.departure.terminal : null;
            
            const dep_timezone = segments.flightSegment.departure.at.substr(-6);
            const dep_date = segments.flightSegment.departure.at.substr(0,10);
            const dep_time = segments.flightSegment.departure.at.substr(11,8);
            
            const arr_ter = (typeof segments.flightSegment.arrival.terminal !== 'undefined') ? 
            segments.flightSegment.arrival.terminal : null;
            
            const arr_timezone = segments.flightSegment.arrival.at.substr(-6);
            const arr_date = segments.flightSegment.arrival.at.substr(0,10);
            const arr_time = segments.flightSegment.arrival.at.substr(11,8);
            
            const duration = segments.flightSegment.duration.substring(3);
            const flight_class = segments.pricingDetailPerAdult.travelClass;
            const carrier = segments.flightSegment.carrierCode;
            const number = segments.flightSegment.number;
            const aircraft = segments.flightSegment.aircraft.code;
            const basic = data.offerItems[0].price.total;
            const taxes = data.offerItems[0].price.totalTaxes;
            
            
            flight_obj = {
                departure_airport: segments.flightSegment.departure.iataCode,
                departure_terminal: dep_ter,
                departure_timezone: dep_timezone,
                departure_date: dep_date,
                departure_time: dep_time,
                arrival_airport: segments.flightSegment.arrival.iataCode,
                arrival_terminal: arr_ter,
                arrival_timezone: arr_timezone,
                arrival_date: arr_date,
                arrival_time: arr_time,
                duration: duration,
                class: flight_class,
                carrier: carrier,
                number: number,
                aircraft: aircraft,
                price_basic: basic,
                aircraft_gp: result.dictionaries.aircraft
            };
            flights.push(flight_obj);
        }
        
        // sort by carrier DESC
        flights.sort(function(a, b) {
          var nameA = a.carrier.toUpperCase(); // ignore upper and lowercase
          var nameB = b.carrier.toUpperCase(); // ignore upper and lowercase
          if (nameA > nameB) {
            return -1;
          }
          if (nameA < nameB) {
            return 1;
          }
          // names must be equal
          return 0;
        });
        
        return flights;
    }
  
};