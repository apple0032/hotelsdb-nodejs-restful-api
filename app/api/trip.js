const Sequelize = require('sequelize');
const request = require('request-promise-native');
const Op = Sequelize.Op;
const dummy_json = require('../../config/dummy.json');
const dummy_pool = require('../../config/dummy_pool.json');
const dummy_matrix = require('../../config/dummy_matrix.json');
const api_config = require("../../config/api_config");

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
                        "x-api-key": api_config.key.sygic
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
                Standard categories = shopping,eating,relaxing,sightseeing,playing,going_out,discovering,hiking
            */

            //First, we need the trip start and end date to count the total days of trip
            var trip_start = req.body.trip_start;
            var trip_end = req.body.trip_end;
            var trip_days =  Math.floor(( Date.parse(trip_end) - Date.parse(trip_start) ) / 86400000) + 1;
            
            //Get all date by the date period
            var start = trip_start.split("-");
            var end = trip_end.split("-");
            var dates = getDates(new Date(parseInt(start[0]),parseInt(start[1]),parseInt(start[2])), new Date(parseInt(end[0]),parseInt(end[1]),parseInt(end[2])));     

            //Then calculate total pois of the pool
            var total_pool = trip_days * 13;

            //Get the priority of the categories
            /* Example of json format
                    {"traveling": 5,"shopping": 4,"eating" : 3,"relaxing" : 2,"sightseeing" : 3}
                    {"shopping": 4,"eating" : 3,"relaxing" : 2,"sightseeing" : 3, "playing": 3}
             */
            var priority = req.body.priority;
            if(typeof priority == 'undefined'){
                priority = `{"shopping":5,"eating":5,"relaxing":5,"sightseeing":5,"playing":5,"going_out":5,"discovering": 5}`;
            }
            
            //Convert json string to json object
            try{
                var priority = JSON.parse(priority);
            } catch(e) {
                res.json({
                    result: "error",
                    message: "Invalid format of priority, it should be a standard JSON format."
                });
            }

            var standard_categories = ["shopping","eating","relaxing","sightseeing","playing","going_out","discovering","hiking"];
            standard_categories.forEach(function(item,k){
                if(!priority.hasOwnProperty(item)){
                    priority[item] = 1;
                }
            });
            
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

            //Filter the random POIs according to the category abstract number
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
                            poi_arr[p] = {total: poigp.length};
                            //poi_arr[p] = {total: poigp.length, poi: poigp};
                            gp_cat.splice(n, 1);
                        }
                    }
                    //console.log(gp_cat.length);
                    //poi_arr[p] = {poi: gp_cat[0]};
                }
            }
            
            //Suffle the pool to ensure we can get the random POI
            shuffle(pool);

        /********* STEP3 - Start the itinerary generating process  *********/
        
            /*
             * function generateSchedule
                pool //not accept default

                start_coordinate // city or airport coordinate/first poi coordinate 
                end_coordinate // last poi coordinate

                start_location //null/hotel_name/airport name
                end_location   //null/hotel_name/airport name

                start_time  // 9:00
                end_time // 22:00
             * 
             */
            var start_time = req.body.start_time;
            if(typeof start_time == 'undefined'){
                var start_time = "09:00";
            }
            var dayend_time = req.body.dayend_time;
            if(typeof req.body.dayend_time == 'undefined'){
                var dayend_time = "22:00";
            }
            var start_coordinate = req.body.start_point;
            if(typeof start_coordinate == 'undefined'){
                var start_coordinate = null;
            }
            var end_coordinate = req.body.end_point;
            if(typeof end_coordinate == 'undefined'){
                var end_coordinate = null;
            }
            var start_location = req.body.start_location;
            if(typeof start_location == 'undefined'){
                var start_location = "STARTING POINT";
            }
            var end_location = req.body.end_location;
            if(typeof end_location == 'undefined'){
                var end_location = null;
            }
            
            //Generate itinerary process

            //Get the exact day
            dates = dates[0].split(",");
            var theday = dates[0];



            //var schedule = [];
            var schedule = await getSchedule(pool,theday,start_time,dayend_time,start_coordinate,end_coordinate,start_location,end_location);
            //schedule.push({day1: ccc});
            //schedule.push({day2: ccc});
            

        res.json({
            result: "success",
            city: vcity.city_id,
            trip_start: trip_start,
            trip_end: trip_end,
            trip_days: trip_days,
            sources_limit: sources_limit,
            original_total_poi: total_poi,
            priority:priority,
            new_priority:new_priority,
            group_pool: poi_arr,
            pool_total: pool.length,
            //pool: pool,
            schedule: schedule
        });
      
    });

    async function getSchedule(pool,theday,start_time,dayend_time,start_coordinate,end_coordinate,start_location,end_location){

        //Create dummy pool to enhance development
        var fake_pool = dummy_pool;
        pool = fake_pool;
        //console.log(fake_pool);


        //Init time object
        var start_time_obj = new Date(theday+" "+start_time);
        var dayend_time_obj = new Date(theday+" "+dayend_time);
        var current_time = start_time_obj; //The current time will keep updating start from start_time_obj
        var schedule = [];
        seetime = current_time.toLocaleString('en-US', {timeZone: 'Asia/Hong_Kong'});

        //Init variables
        var matrix_string = '';
        var new_pool = [];


        //Check if the start point inputted
        if(start_coordinate != null){
            //current_time.setMinutes(current_time.getMinutes() + 20);
            //current_time = new Date(current_time);
            //schedule.push({location: start_location, coordinate: start_coordinate, seetime:seetime});
            var sc = start_coordinate.split(",");
            matrix_string += start_coordinate + "%7C";
            new_pool.push({id: start_location, name:start_location, location: {lat:sc[0], lng: sc[1]}, duration: 0});
        }

        //console.log(matrix_string);

        //Select 10 POI randomly from the POOL
        for (var i = 0; i < pool.length; i++) {
            if(i < 9) {
                var temp_string;
                temp_string = (pool[i]['location']['lat']) + ',' + (pool[i]['location']['lng']);
                matrix_string += temp_string + '%7C';
                new_pool.push(pool[i]);
            }
        }


        //Get distance matrix from GOOGLE API
        // var matrix = await request.get(
        //     {
        //         url: 'https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&key='+api_config.key.google_distance_matrix+'&origins='+matrix_string+'&destinations='+matrix_string,
        //     }
        // );
        // matrix = JSON.parse(matrix);

        //Create dummy matrix to speed up development
        var matrix = dummy_matrix;
        //console.log(dummy_matrix);
        //console.log(matrix_string);



        //Handle the staring point
        schedule.push({
            id: new_pool[0]['id'],
            location: new_pool[0]['name'],
            coordinate: new_pool[0]['location']['lat']+','+new_pool[0]['location']['lng'],
            duration:  new_pool[0]['duration'],
            seetime:seetime
        });
        current_time.setMinutes(current_time.getMinutes() + (new_pool[0]['duration']/60) + 15);
        current_time = new Date(current_time);



        var martix_gp = [];  //Non-repeatable identifier array
        var next_poi = 0;
        for (let index = 0; index < new_pool.length-1; index++) {
            //console.log(index);
            if(current_time < dayend_time_obj){

                var matrix_ele = matrix['rows'][next_poi]['elements'];   //Get the matrix distance by the next_poi->this value keep update
                var matrix_duration = [];
                for (const el in matrix_ele) {  //Search for the nearest point where it is not itself and not go before
                    if(el > 0) {
                        if (matrix_ele[el]['duration']['value'] !== 0 && !martix_gp.includes(el)) {
                            matrix_duration.push(matrix_ele[el]['duration']['value']);
                        }
                    }
                }
                var matrix_min = Math.min(...matrix_duration);  //Find the minimum duration time
                for (const k in matrix_ele) {
                    if(matrix_ele[k]['duration']['value'] === matrix_min) {   //Search in loop again, see which element will be next point
                        next_poi = k;
                        martix_gp.push(next_poi);
                        schedule.push({type: "transport", duration: matrix_min, distance: matrix_ele[k]['distance']['value']});  //Push transport json

                        current_time.setMinutes(current_time.getMinutes() + (matrix_min/60) + 15);  //Keep updating current time
                        current_time = new Date(current_time);
                    }
                }

                //console.log(next_poi);
                //console.log(matrix_min);
                //console.log(martix_gp);



                //Push the next POI to schedule, keep updating current time
                //console.log(current_time);
                seetime = current_time.toLocaleString('en-US', {timeZone: 'Asia/Hong_Kong'});
                var coordinate = new_pool[next_poi]['location']['lat']+','+new_pool[next_poi]['location']['lng'];
                schedule.push({id: new_pool[next_poi]['id'], location: new_pool[next_poi]['name'], coordinate: coordinate, duraion: new_pool[next_poi]['duration'], seetime:seetime});

                //add POI duration to the current time
                var new_mins = (new_pool[next_poi]['duration'])/60;
                current_time.setMinutes(current_time.getMinutes() + new_mins);
                current_time = new Date(current_time);
            }
        }


        //Handle back to the end point
        schedule.push({type: "transport", duration: 1800, distance: "unknown"});  //Push transport json

        current_time.setMinutes(current_time.getMinutes() + 30);  //Keep updating current time
        current_time = new Date(current_time);

        seetime = current_time.toLocaleString('en-US', {timeZone: 'Asia/Hong_Kong'});
        schedule.push({
            id: "END POINT",
            seetime:seetime
        });



        return schedule;
    }


    function shuffle(a) {
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }
    
    
    var getDates = function(startDate, endDate) {
        var dates = [],
            currentDate = startDate,
            addDays = function(days) {
              var date = new Date(this.valueOf());
              date.setDate(date.getDate() + days);
              return date;
            };
        while (currentDate <= endDate) {
          dates.push(currentDate.toLocaleString('en-US', {timeZone: 'Asia/Hong_Kong'}));
          currentDate = addDays.call(currentDate, 1);
        }
        return dates;
    };
    
};