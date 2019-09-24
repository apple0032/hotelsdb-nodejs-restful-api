var Sequelize = require('sequelize');
const Op = Sequelize.Op;
const key = require("../../config/api_config");
var request = require('request-promise-native');
var dummy_json = require('../../config/dummy.json');


module.exports = (app, db , current) => {
  
    app.post( "/trip", async(req, res) => {

        /********* STEP1 - Get all POIs from place/list API by input parameters *********/

            //Search city_id in database
            var city = req.body.city;
            const vcity = await db.cities.find({
                where: {
                   name: {
                     [Op.eq]: city
                   }
                }
            });

            //If no city found, stop process.
            if(vcity == null){
                res.json({
                    result: "error",
                    message: "Sorry, city not found."
                });
            }

            //Setting default limit value if not passed
            var limit = req.body.limit;
            typeof limit == 'undefined' ? limit = 200 : limit =req.body.limit;


            //Executing sygic API to get all POIs
            /*   //currently disable to speed up development
            var pois = await request.get(
                {
                    url: 'https://api.sygictravelapi.com/1.1/en/places/list?parents='+vcity.city_id+'&level=poi&limit='+limit,
                    headers: {
                        "x-api-key": key.sygic.api_key
                    }
                }
            );
            */
            pois = JSON.stringify(dummy_json); //hard code dummy json data to speed up development, disable in production

            var all_pois = JSON.parse(pois);
            all_pois = all_pois['data']['places'];
            var total_poi = all_pois.length;

        /********* STEP2 - Filter POIs by given categories priority *********/

        /*
            Categories & tags list : https://docs.google.com/spreadsheets/d/1VZvr3W6AJYULigHucHkUq4agZ_O5VP1UL4yfaU3ry0A/edit#gid=0
            Supported categories are : traveling,shopping,eating,doing_sports,hiking,relaxing,playing,going_out,sightseeing,discovering
        */






        res.json({
            result: "success",
            city: vcity.city_id,
            limit: limit,
            total_poi: total_poi,
            poi:all_pois
        });
      
    });

};