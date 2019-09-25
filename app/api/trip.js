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
            var sources_limit = req.body.limit;
            typeof sources_limit == 'undefined' ? sources_limit = 200 : sources_limit =req.body.limit;


            //Executing sygic API to get all POIs
            /*   //currently disable to speed up development
            var pois = await request.get(
                {
                    url: 'https://api.sygictravelapi.com/1.1/en/places/list?parents='+vcity.city_id+'&level=poi&limit='+sources_limit,
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

            //First, we need the trip start and end date to count the total days of trip
            var trip_start = req.body.trip_start;
            var trip_end = req.body.trip_end;
            var trip_days =  Math.floor(( Date.parse(trip_end) - Date.parse(trip_start) ) / 86400000) + 1;

            //Then calculate total pois of the pool
            var total_pool = trip_days * 10;

            //Get the priority of the categories
            /* Example of json format
                    {"traveling": 5,"shopping": 4,"eating" : 3,"relaxing" : 2,"sightseeing" : 3}
             */
            var priority = req.body.priority;
            if(typeof priority == 'undefined'){
                priority = `{"sightseeing" : 5}`;
            }
            
            //Convert json string to json object
            var priority = JSON.parse(priority);
            
            //Calculate the total base number of priority
            var total_priority = 0;
            for (var p in priority) {
                total_priority += priority[p];
            }
            
            //Calculate ratio & actual abstract number
            var new_priority = {};
            for (var p in priority) {
                var percentage = (priority[p]/total_priority);
                new_priority[p] = {percentage:percentage.toFixed(2), abstract:Math.floor(total_pool*percentage)};
            }
            
            //Group the poi by their category
            var group_pool = {};
            for (var p in priority) {
                var thecategory = [];
                for (const apoi in all_pois) {
                    var category = all_pois[apoi].categories;
                    if(category.includes(p)){
                        thecategory.push(all_pois[apoi]);
                        all_pois.splice(apoi, 1)
                        group_pool[p] = {poi: thecategory};
                    }
                }
            }
            
            //Filter the random POIs according to the category absract number
            var poi_arr = {};
            var pool = [];
            for (var p in priority) {
                var poigp = [];
                if(group_pool.hasOwnProperty(p)){
                    var gp_cat = group_pool[p]['poi']; //Category array pool
                    
                    for (var i = 0; i < (gp_cat.length)+2; i++) {
                        //new_priority[p]['abstract']
                        //console.log(poigp.length);
                        if(poigp.length < new_priority[p]['abstract']){
                            var n = Math.floor(Math.random() * gp_cat.length);
                            var rand = gp_cat[n];
                            poigp.push(rand);
                            pool.push(rand);
                            poi_arr[p] = {total: poigp.length, poi: poigp};
                            gp_cat.splice(n, 1);
                        }
                    }
                    //console.log(gp_cat.length);
                    //poi_arr[p] = {poi: gp_cat[0]};
                }
            }
            
            

        res.json({
            result: "success",
            city: vcity.city_id,
            trip_start: trip_start,
            trip_end: trip_end,
            trip_days: trip_days,
            sources_limit: sources_limit,
            original_total_poi: total_poi,
            total_pool:total_pool,            
            priority:priority,
            new_priority:new_priority,
            //group_pool: poi_arr,
            pool: pool
        });
      
    });

};