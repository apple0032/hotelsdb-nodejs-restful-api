const Sequelize = require('sequelize');
const request = require('request-promise-native');
const Op = Sequelize.Op;
const dummy_json = require('../../config/dummy.json');
const dummy_pool = require('../../config/dummy_pool.json');
const dummy_matrix = require('../../config/dummy_matrix.json');
const dummy_pois = require('../../config/dummy_pois.json');
const dummy_search = require('../../config/dummy_search.json');
const api_config = require("../../config/api_config");
const sysconfig    = require(__dirname + '/../../config/config.json')['development'];

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
               //currently disable to speed up development
        if(sysconfig.sygic) {
           var pois = await request.get(
               {
                   url: 'https://api.sygictravelapi.com/1.1/en/places/list?parents='+vcity.city_id+'&level=poi&limit='+sources_limit,
                   headers: {
                       "x-api-key": api_config.key.sygic
                   }
               }
           );
        } else {
            pois = JSON.stringify(dummy_json); //hard code dummy json data to speed up development, disable in production
        }

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

            var datelist = getDaysArray(new Date(start),new Date(end));
            var dates = [];
            for (var date of datelist) {
                date = date.toLocaleString('en-GB', {timeZone: 'Asia/Hong_Kong'});
                thedate = date.split(',');
                dates.push(thedate[0]);
            }

            //Then calculate total pois of the pool
            var total_pool = trip_days * 15;

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
                        all_pois.splice(apoi, 1);
                        group_pool[p] = {poi: thecategory};
                    }
                }
            }

            //Filter the random POIs according to the category abstract number
            var hottest = req.body.hottest;
            var poi_arr = {};
            var pool = [];

            //Select poi randomly
            if(typeof hottest == 'undefined'){
                for (var p in priority) {
                    var poigp = [];
                    if (group_pool.hasOwnProperty(p)) {
                        var gp_cat = group_pool[p]['poi']; //Category array pool

                        for (var i = 0; i < (gp_cat.length) + 2; i++) {
                            //new_priority[p]['abstract']
                            //console.log(poigp.length);
                            if (poigp.length < new_priority[p]['abstract']) {
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
            } else if (hottest === "1" || hottest === 'true') {  //Select poi according to the rating
                for (var p in priority) {
                    var poigp = [];
                    if (group_pool.hasOwnProperty(p)) {
                        var gp_cat = group_pool[p]['poi'];
                        for (var i = 0; i < (gp_cat.length); i++) {
                            if (poigp.length < new_priority[p]['abstract']) {
                                poigp.push(gp_cat[i]);
                                pool.push(gp_cat[i]);
                                poi_arr[p] = {total: poigp.length};
                            }
                        }
                    }
                }
            }


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
            var related_flight_id = req.body.related_flight_id;
            if(typeof related_flight_id == 'undefined'){
                var related_flight_id = null;
            }
            
            //Generate itinerary process

            //Create dummy pool to enhance development
            var fake_pool = dummy_pool;
            //pool = fake_pool;
            pool_total = pool.length;


            var schedule = [];
            var itinerary_pois = [];
            for (const eachday in dates) {
                day = dates[eachday].split(",");
                var theday = day[0]; //Get the exact day

                var itinerary = await getSchedule(pool,theday,start_time,dayend_time,start_coordinate,end_coordinate,start_location,end_location,"create");
                itinerary_obj = {};
                itinerary_obj[theday] = itinerary;
                schedule.push(itinerary_obj);
                
                
                //console.log(itinerary);
                
                //Remove POI from last pool
                let selected_poi = [];
                for (const k in itinerary) {
                    if(itinerary[k].hasOwnProperty('poi_id')){
                        selected_poi.push(itinerary[k]['poi_id']);
                    }
                    
                    if(itinerary[k]['poi_id'] != null){
                        itinerary_pois.push(itinerary[k]['poi_id']);
                    }
                }

                let new_pool = [];
                for (const index in pool) {
                    if(!selected_poi.includes(pool[index]['id'])){
                        new_pool.push(pool[index]);
                    }
                }
                pool = new_pool; //Create a new pool

                //Suffle the pool to ensure we can get the random POI

                if(typeof hottest === 'undefined') {
                    shuffle(pool);
                }
            }


        /********* STEP4 - Search for the details and media from the itinerary's POI by Sygic API*********/
        
        //Moved to pois API
        
        

        res.json({
            result: "success",
            city: vcity.city_id,
            city_name: city,
            trip_start: trip_start,
            trip_end: trip_end,
            trip_days: trip_days,
            sources_limit: sources_limit,
            original_total_poi: total_poi,
            priority:priority,
            new_priority:new_priority,
            group_pool: poi_arr,
            pool_total: pool_total,
            //pool: pool,
            schedule: schedule,
            total_itinerary_pois: itinerary_pois.length,
            itinerary_pois: itinerary_pois,
            dates:dates,
            related_flight_id: related_flight_id
        });
      
    });

    async function getSchedule(pool,theday,start_time,dayend_time,start_coordinate,end_coordinate,start_location,end_location,mode){


        //Init time object
        var start_time_obj = new Date(theday+" "+start_time);
        var dayend_time_obj = new Date(theday+" "+dayend_time);
        var current_time = start_time_obj; //The current time will keep updating start from start_time_obj
        var schedule = [];
        schedule.push({
                type : "timeflag",
                starttime : start_time,
                endtime : dayend_time
            });
        seetime = convertDateFormat(current_time);

        //Init variables
        var matrix_string = '';
        var new_pool = [];


        //Check if the start point inputted
        if(start_coordinate != null){
            //current_time.setMinutes(current_time.getMinutes() + 20);
            //current_time = new Date(current_time);
            //schedule.push({location: start_location, coordinate: start_coordinate, seetime:seetime});
            var sc = start_coordinate.split(",");
            //matrix_string += start_coordinate + "%7C";
            schedule.push({
                type: start_location,
                poi_id: start_location,
                location:start_location,
                coordinate: sc[0]+','+sc[1],
                duration: 0,
                rating : 0,
                schedule_time: theday+', '+start_time+':00',
                perex: "Starting",
                thumbnail_url: ""
            });

            schedule.push({
                type: "transport",
                duration: 0,
                distance: 0
            });
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
        if(sysconfig.google) {
            var matrix = await request.get(
                {
                    url: 'https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&key=' + api_config.key.google_distance_matrix + '&origins=' + matrix_string + '&destinations=' + matrix_string,
                }
            );
            matrix = JSON.parse(matrix);
        } else {
            //Create dummy matrix to speed up development
            var matrix = dummy_matrix;
        }
        //console.log(dummy_matrix);
        //console.log(matrix_string);

        if(new_pool[0]['id'] === "hotel"){ var type = "hotel";} else {var type = "poi";}

        //Handle the staring point
        schedule.push({
            type: type,
            poi_id: new_pool[0]['id'],
            location: new_pool[0]['name'],
            coordinate: new_pool[0]['location']['lat']+','+new_pool[0]['location']['lng'],
            duration:  new_pool[0]['duration'],
            rating: new_pool[0]['rating'],
            schedule_time:seetime,
            perex: new_pool[0]['perex'], 
            thumbnail_url: new_pool[0]['thumbnail_url']
            //source: new_pool[0]
        });
        current_time = adjustCurrentTime(current_time, (new_pool[0]['duration']/60));
        dayend_time_obj = adjustCurrentTime(dayend_time_obj, -90);

        var martix_gp = [];  //Non-repeatable identifier array
        var next_poi = 0;
        var martix_i = 1;
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
                console.log(matrix_duration);
                for (const k in matrix_ele) {
                    if(matrix_ele[k]['duration']['value'] === matrix_min) {   //Search in loop again, see which element will be next point
                        if(mode === "create"){
                            next_poi = k
                        } else {
                            next_poi = martix_i;
                        }
                        martix_gp.push(next_poi);

                        if(mode === "create"){
                            schedule.push({
                                type: "transport",
                                duration: matrix_min,
                                distance: matrix_ele[k]['distance']['value']
                            });
                        } else {
                            schedule.push({
                                type: "transport",
                                duration: matrix_ele[martix_i]['duration']['value'],
                                distance: matrix_ele[martix_i]['distance']['value']
                            });
                        }

                        current_time = adjustCurrentTime(current_time, ((matrix_min/60))); //Keep updating current time
                    }
                }

                //console.log(next_poi);
                //console.log(matrix_min);
                //console.log(martix_gp);
                martix_i++;


                //Push the next POI to schedule, keep updating current time
                //console.log(current_time);
                seetime = convertDateFormat(current_time);
                var coordinate = new_pool[next_poi]['location']['lat']+','+new_pool[next_poi]['location']['lng'];
                let adjust_duration = 0;
                if(mode === "create"){
                    adjust_duration = 1800;
                }
                schedule.push({
                    type: "poi",
                    poi_id: new_pool[next_poi]['id'],
                    location: new_pool[next_poi]['name'],
                    coordinate: coordinate,
                    duration: (new_pool[next_poi]['duration']) + adjust_duration,
                    rating: new_pool[next_poi]['rating'],
                    schedule_time:seetime,
                    perex: new_pool[next_poi]['perex'],
                    thumbnail_url: new_pool[next_poi]['thumbnail_url']
                    //source: new_pool[next_poi]
                });

                //add POI duration to the current time
                var new_mins = ((new_pool[next_poi]['duration'])/60) + 30;
                current_time = adjustCurrentTime(current_time, new_mins);
            }
        }


        //Handle back to the end point
        if(end_coordinate != null){
            if(sysconfig.google) {
                var url = 'https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&key='+api_config.key.google_distance_matrix+'&origins='+schedule[schedule.length - 1]['coordinate']+'&destinations='+end_coordinate;
                var matrix = await request.get({url: url});

                matrix = JSON.parse(matrix);
            }
            var ele = matrix['rows'][0]['elements'][0];

            if(ele['status'] === "OK") {
                var st_distance = ele['distance']['value'];
                var st_duration = ele['duration']['value'];

                schedule.push({type: "transport", duration: st_duration, distance: st_distance});  //Push transport json

            } else {
                schedule.push({type: "transport", duration: 0, distance: 0});
            }

            current_time = adjustCurrentTime(current_time,30);
            seetime = convertDateFormat(current_time);

            if(end_location === "hotel"){ var type = "hotel";} else {var type = "poi";}

            var sc = end_coordinate.split(",");
            schedule.push({
                type: type,
                poi_id: end_location,
                location: end_location,
                coordinate: sc[0]+','+sc[1],
                duration:  0,
                rating: 0,
                schedule_time:seetime,
                perex: "Ending",
                thumbnail_url: null
            });
        }


        if(start_coordinate !== null){
            if(sysconfig.google) {
                var url = 'https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&key=' + api_config.key.google_distance_matrix + '&origins=' + schedule[0]['coordinate'] + '&destinations=' + schedule[2]['coordinate'];
                var matrix = await request.get({url: url});

                matrix = JSON.parse(matrix);
            }
            var ele = matrix['rows'][0]['elements'][0];

            if(ele['status'] === "OK") {
                var st_distance = ele['distance']['value'];
                var st_duration = ele['duration']['value'];
                schedule[1]['duration'] = st_duration;
                schedule[1]['distance'] = st_distance;

                for (const sc in schedule) {
                    if(sc > 1 && schedule[sc]['type'] === "poi") {
                        var time = new Date(schedule[sc]['schedule_time']);
                        time = adjustCurrentTime(time, st_duration/60);
                        time = convertDateFormat(time);
                        schedule[sc]['schedule_time'] = time;
                    }
                }
            }
        }

        return schedule;
    }
    
    function adjustCurrentTime(current_time, minutes){
        current_time.setMinutes(current_time.getMinutes() + minutes);
        current_time = new Date(current_time);
        
        return current_time;
    }
    
    function convertDateFormat(date){
        date = date.toLocaleString('en-US', {timeZone: 'Asia/Hong_Kong',hour12:false});
        return date;
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
    
    
    var getDaysArray = function(start, end) {
        for(var arr=[],dt=start; dt<=end; dt.setDate(dt.getDate()+1)){
            arr.push(new Date(dt));
        }
        return arr;
    };



    /**
     * @swagger
    
    "/trip": {
        "post": {
            "security": [
                {
                    "APIKeyHeader": []
                }
            ],
            "summary": "Generate new itinerary JSON string",
            "description": "Generate new itinerary JSON string",
            "tags" : ["trip"],
            "parameters": [
                {
                    "description": "city name",
                    "type": "string",
                    "name": "city",
                    "in": "formData",
                    "required" : true
                },
                {
                    "description": "Trip start date",
                    "type": "string",
                    "name": "trip_start",
                    "in": "formData",
                    "required" : true
                },
                {
                    "description": "Trip end date",
                    "type": "string",
                    "name": "trip_end",
                    "in": "formData",
                    "required" : true
                },
                {
                    "description": "Priority JSON string",
                    "type": "string",
                    "name": "priority",
                    "in": "formData",
                    "required" : true
                },
                {
                    "description": "limit number",
                    "type": "integer",
                    "name": "limit",
                    "in": "formData"
                },
                {
                    "description": "Hot attraction flag",
                    "type": "integer",
                    "name": "hottest",
                    "in": "formData"
                },
                {
                    "description": "Trip Start Time",
                    "type": "string",
                    "name": "start_time",
                    "in": "formData"
                },
                {
                    "description": "Trip End Time",
                    "type": "string",
                    "name": "dayend_time",
                    "in": "formData"
                },
                {
                    "description": "start coordination",
                    "type": "string",
                    "name": "start_point",
                    "in": "formData"
                },
                {
                    "description": "end coordination",
                    "type": "string",
                    "name": "end_point",
                    "in": "formData"
                },
                {
                    "description": "start location string such as HOTEL",
                    "type": "string",
                    "name": "start_location",
                    "in": "formData"
                },
                {
                    "description": "end location string such as HOTEL",
                    "type": "string",
                    "name": "end_location",
                    "in": "formData"
                },
                {
                    "description": "related flight id",
                    "type": "string",
                    "name": "related_flight_id",
                    "in": "formData"
                }
            ],
            "responses": {
                "EXAMPLE": {
                    "description": "Example json string of priority",
                    "examples" : {
                        "application/json": {
                            "shopping":5,
                            "eating":5,
                            "relaxing":5,
                            "sightseeing":5,
                            "playing":5,
                            "going_out":5,
                            "discovering": 5
                        }
                    }
                },
                "200": {
                    "description": "Success output",
                    "examples" : {
                        "application/json": {
                            "result": "success",
                            "city": "city:476",
                            "city_name": "osaka",
                            "trip_start": "2020-05-05",
                            "trip_end": "2020-05-07",
                            "trip_days": 3,
                            "sources_limit": 200,
                            "original_total_poi": 200,
                            "priority": {
                              "shopping": 5,
                              "eating": 5,
                              "relaxing": 5,
                              "sightseeing": 5,
                              "playing": 5,
                              "going_out": 5,
                              "discovering": 5,
                              "hiking": 1
                            },
                            "new_priority": {
                              "shopping": {
                                "percentage": "0.14",
                                "abstract": 6
                              },
                              "eating": {
                                "percentage": "0.14",
                                "abstract": 6
                              },
                              "relaxing": {
                                "percentage": "0.14",
                                "abstract": 6
                              },
                              "sightseeing": {
                                "percentage": "0.14",
                                "abstract": 6
                              },
                              "playing": {
                                "percentage": "0.14",
                                "abstract": 6
                              },
                              "going_out": {
                                "percentage": "0.14",
                                "abstract": 6
                              },
                              "discovering": {
                                "percentage": "0.14",
                                "abstract": 6
                              },
                              "hiking": {
                                "percentage": "0.03",
                                "abstract": 1
                              }
                            },
                            "group_pool": {
                              "shopping": {
                                "total": 6
                              },
                              "eating": {
                                "total": 6
                              },
                              "relaxing": {
                                "total": 6
                              },
                              "sightseeing": {
                                "total": 6
                              },
                              "playing": {
                                "total": 5
                              },
                              "going_out": {
                                "total": 5
                              },
                              "discovering": {
                                "total": 6
                              },
                              "hiking": {
                                "total": 1
                              }
                            },
                            "pool_total": 41,
                            "schedule": [
                              {
                                "5/5/2020": [
                                  {
                                    "type": "timeflag",
                                    "starttime": "09:00",
                                    "endtime": "22:00"
                                  },
                                  {
                                    "type": "poi",
                                    "poi_id": "poi:22723",
                                    "location": "Dōtonbori Area",
                                    "coordinate": "34.668688,135.502045",
                                    "duration": 9000,
                                    "rating": 1.2591260586039,
                                    "schedule_time": "5/5/2020, 09:00:00",
                                    "perex": "One of the most popular areas of Osaka and a great place to visit if you want to taste delicious Japanese cuisine or do some souvenir…",
                                    "thumbnail_url": "https://media-cdn.sygictraveldata.com/media/poi:22723"
                                  },
                                  {
                                    "type": "transport",
                                    "duration": 1903,
                                    "distance": 18485
                                  },
                                  {
                                    "type": "poi",
                                    "poi_id": "poi:22744",
                                    "location": "American Village",
                                    "coordinate": "34.6719835,135.4988101",
                                    "duration": 7200,
                                    "rating": 0.20615733117298,
                                    "schedule_time": "5/5/2020, 12:01:00",
                                    "perex": "Also known as \"Amerikamura\", this small neighborhood is crammed with Western retail stores selling imported goods since the 70s.",
                                    "thumbnail_url": "https://media-cdn.sygictraveldata.com/media/poi:22744"
                                  },
                                  {
                                    "type": "transport",
                                    "duration": 386,
                                    "distance": 3504
                                  },
                                  {
                                    "type": "poi",
                                    "poi_id": "poi:22769",
                                    "location": "Tenjimbashi-Suji Shopping Street",
                                    "coordinate": "34.700307,135.511549",
                                    "duration": 5400,
                                    "rating": 0.3505957309341,
                                    "schedule_time": "5/5/2020, 14:07:00",
                                    "perex": "2.5-kilometers-long, this roofed shopping street is crammed with dozens of small stores selling virtually anything imaginable.",
                                    "thumbnail_url": "https://media-cdn.sygictraveldata.com/media/poi:22769"
                                  },
                                  {
                                    "type": "transport",
                                    "duration": 430,
                                    "distance": 1962
                                  },
                                  {
                                    "type": "poi",
                                    "poi_id": "poi:12405503",
                                    "location": "Ichiran Ramen",
                                    "coordinate": "34.6692398,135.5030675",
                                    "duration": 5400,
                                    "rating": 0.055547099592855,
                                    "schedule_time": "5/5/2020, 15:44:00",
                                    "perex": null,
                                    "thumbnail_url": "https://media-cdn.sygictraveldata.com/media/poi:12405503"
                                  },
                                  {
                                    "type": "transport",
                                    "duration": 676,
                                    "distance": 3360
                                  },
                                  {
                                    "type": "poi",
                                    "poi_id": "poi:6447937",
                                    "location": "Kani Douraku",
                                    "coordinate": "34.6688658,135.5058912",
                                    "duration": 5400,
                                    "rating": 0.034048211807038,
                                    "schedule_time": "5/5/2020, 17:25:00",
                                    "perex": "If hungry, visit this branch of a popular Japanese restaurant chain focusing on fresh seafood such as lobsters, crabs, shrimps and much…",
                                    "thumbnail_url": "https://media-cdn.sygictraveldata.com/media/poi:6447937"
                                  },
                                  {
                                    "type": "transport",
                                    "duration": 685,
                                    "distance": 3994
                                  },
                                  {
                                    "type": "poi",
                                    "poi_id": "poi:22780",
                                    "location": "Nipponbashi Denden Town",
                                    "coordinate": "34.660252,135.506009",
                                    "duration": 5400,
                                    "rating": 0.49044461392093,
                                    "schedule_time": "5/5/2020, 19:06:00",
                                    "perex": "This district is the place to go for people who love electronic gadgets or collectables.",
                                    "thumbnail_url": "https://media-cdn.sygictraveldata.com/media/poi:22780"
                                  }
                                ]
                              },
                              {
                                "5/6/2020": [
                                  {
                                    "type": "timeflag",
                                    "starttime": "09:00",
                                    "endtime": "22:00"
                                  },
                                  {
                                    "type": "poi",
                                    "poi_id": "poi:55168",
                                    "location": "Pokemon Center",
                                    "coordinate": "34.7019066,135.4964453",
                                    "duration": 1800,
                                    "rating": 0.21780396292088,
                                    "schedule_time": "5/6/2020, 09:00:00",
                                    "perex": "If you are a Pokémon fan, this is the place not to miss. Bring your kids, collect stickers and buy some toys and merchandise such as shirts…",
                                    "thumbnail_url": "https://media-cdn.sygictraveldata.com/media/poi:55168"
                                  },
                                  {
                                    "type": "transport",
                                    "duration": 1903,
                                    "distance": 18485
                                  },
                                  {
                                    "type": "poi",
                                    "poi_id": "poi:22729",
                                    "location": "Kanidoraku",
                                    "coordinate": "34.6688906,135.5015158",
                                    "duration": 5400,
                                    "rating": 0.019142477574944,
                                    "schedule_time": "5/6/2020, 10:01:00",
                                    "perex": "If you want to taste traditional Japanese crab, head to this restaurant. You can try very unusual and unexpected, yet delicious dishes here.",
                                    "thumbnail_url": "https://media-cdn.sygictraveldata.com/media/poi:22729"
                                  },
                                  {
                                    "type": "transport",
                                    "duration": 386,
                                    "distance": 3504
                                  },
                                  {
                                    "type": "poi",
                                    "poi_id": "poi:22760",
                                    "location": "Osaka Takoyaki Museum",
                                    "coordinate": "34.6686421,135.4374525",
                                    "duration": 7200,
                                    "rating": 0.058701249583113,
                                    "schedule_time": "5/6/2020, 11:37:00",
                                    "perex": "This unique museum is dedicated to one of the most popular food in Japan - takoyaki - a traditional dish consisting of dumplings filled…",
                                    "thumbnail_url": "https://media-cdn.sygictraveldata.com/media/poi:22760"
                                  },
                                  {
                                    "type": "transport",
                                    "duration": 430,
                                    "distance": 1962
                                  },
                                  {
                                    "type": "poi",
                                    "poi_id": "poi:22732",
                                    "location": "Shitennoji",
                                    "coordinate": "34.6547332,135.5165088",
                                    "duration": 10800,
                                    "rating": 0.3177697579867,
                                    "schedule_time": "5/6/2020, 13:44:00",
                                    "perex": "One of the oldest Buddhist temples in Japan. The temple was completely rebuilt in 1963, but it still retains its former charm.",
                                    "thumbnail_url": "https://media-cdn.sygictraveldata.com/media/poi:22732"
                                  },
                                  {
                                    "type": "transport",
                                    "duration": 676,
                                    "distance": 3360
                                  },
                                  {
                                    "type": "poi",
                                    "poi_id": "poi:5315304",
                                    "location": "Nakanoshima Park",
                                    "coordinate": "34.6924277,135.5077775",
                                    "duration": 3600,
                                    "rating": 0.14370567638139,
                                    "schedule_time": "5/6/2020, 16:55:00",
                                    "perex": null,
                                    "thumbnail_url": "https://media-cdn.sygictraveldata.com/media/poi:5315304"
                                  },
                                  {
                                    "type": "transport",
                                    "duration": 685,
                                    "distance": 3994
                                  },
                                  {
                                    "type": "poi",
                                    "poi_id": "poi:22755",
                                    "location": "Shinsaibashi OPA",
                                    "coordinate": "34.6732957,135.4998002",
                                    "duration": 9000,
                                    "rating": 0.17350093397088,
                                    "schedule_time": "5/6/2020, 18:06:00",
                                    "perex": "This famous mall and the surrounding shopping district have a long tradition.",
                                    "thumbnail_url": "https://media-cdn.sygictraveldata.com/media/poi:22755"
                                  }
                                ]
                              },
                              {
                                "5/7/2020": [
                                  {
                                    "type": "timeflag",
                                    "starttime": "09:00",
                                    "endtime": "22:00"
                                  },
                                  {
                                    "type": "poi",
                                    "poi_id": "poi:17301254",
                                    "location": "Takimi-koji Alley",
                                    "coordinate": "34.7045485,135.4906374",
                                    "duration": 3600,
                                    "rating": 0.024125620174681,
                                    "schedule_time": "5/7/2020, 09:00:00",
                                    "perex": null,
                                    "thumbnail_url": null
                                  },
                                  {
                                    "type": "transport",
                                    "duration": 1903,
                                    "distance": 18485
                                  },
                                  {
                                    "type": "poi",
                                    "poi_id": "poi:19343392",
                                    "location": "Keitakuen Garden",
                                    "coordinate": "34.6496996,135.5115699",
                                    "duration": 3600,
                                    "rating": 0.03309461195153,
                                    "schedule_time": "5/7/2020, 10:31:00",
                                    "perex": null,
                                    "thumbnail_url": "https://media-cdn.sygictraveldata.com/media/poi:19343392"
                                  },
                                  {
                                    "type": "transport",
                                    "duration": 386,
                                    "distance": 3504
                                  },
                                  {
                                    "type": "poi",
                                    "poi_id": "poi:22757",
                                    "location": "Osaka Castle Park",
                                    "coordinate": "34.6863661,135.5275329",
                                    "duration": 9000,
                                    "rating": 0.45560227963257,
                                    "schedule_time": "5/7/2020, 11:37:00",
                                    "perex": "This green spot situated in the heart of Osaka surrounds the Osaka Castle and serves as a place of relaxation and rest for the citizens, as…",
                                    "thumbnail_url": "https://media-cdn.sygictraveldata.com/media/poi:22757"
                                  },
                                  {
                                    "type": "transport",
                                    "duration": 430,
                                    "distance": 1962
                                  },
                                  {
                                    "type": "poi",
                                    "poi_id": "poi:22731",
                                    "location": "Floating Garden Observatory",
                                    "coordinate": "34.7054535,135.4899372",
                                    "duration": 3600,
                                    "rating": 0.64450093594607,
                                    "schedule_time": "5/7/2020, 14:14:00",
                                    "perex": "More than 170 meters tall and 40 storeys high, this architectural wonder is one of the most imposing sights in Osaka.",
                                    "thumbnail_url": "https://media-cdn.sygictraveldata.com/media/poi:22731"
                                  },
                                  {
                                    "type": "transport",
                                    "duration": 676,
                                    "distance": 3360
                                  },
                                  {
                                    "type": "poi",
                                    "poi_id": "poi:22725",
                                    "location": "Osaka Aquarium Kaiyukan",
                                    "coordinate": "34.6548091,135.428938",
                                    "duration": 9000,
                                    "rating": 0.36339461564569,
                                    "schedule_time": "5/7/2020, 15:25:00",
                                    "perex": "One of the most popular aquariums in the world. It is home to more than 15 tanks, each representing a different region with various kinds of…",
                                    "thumbnail_url": "https://media-cdn.sygictraveldata.com/media/poi:22725"
                                  },
                                  {
                                    "type": "transport",
                                    "duration": 685,
                                    "distance": 3994
                                  },
                                  {
                                    "type": "poi",
                                    "poi_id": "poi:21981187",
                                    "location": "Maikoya tea ceremony geisha house",
                                    "coordinate": "34.6763728,135.4948871",
                                    "duration": 9000,
                                    "rating": 0.015626378254427,
                                    "schedule_time": "5/7/2020, 18:06:00",
                                    "perex": null,
                                    "thumbnail_url": null
                                  }
                                ]
                              }
                            ],
                            "total_itinerary_pois": 18,
                            "itinerary_pois": [
                              "poi:22723",
                              "poi:22744",
                              "poi:22769",
                              "poi:12405503",
                              "poi:6447937",
                              "poi:22780",
                              "poi:55168",
                              "poi:22729",
                              "poi:22760",
                              "poi:22732",
                              "poi:5315304",
                              "poi:22755",
                              "poi:17301254",
                              "poi:19343392",
                              "poi:22757",
                              "poi:22731",
                              "poi:22725",
                              "poi:21981187"
                            ],
                            "dates": [
                              "5/5/2020",
                              "5/6/2020",
                              "5/7/2020"
                            ],
                            "related_flight_id": null
                        }
                    }
                }
            }
        }
    }
    
    */
   
   
   
    app.post( "/trip/pois", async(req, res) => {

        var itinerary_pois = req.body.pois;  //["poi:50762","poi:19886","poi:19853","poi:19820","poi:19850","poi:19849","poi:19822"]
        if(typeof itinerary_pois == 'undefined'){
            res.json({
                result: "error",
                message: "Sorry, pois not found."
            });
        }

        itinerary_pois = JSON.parse(itinerary_pois);
        avg_itinerary_pois = itinerary_pois.length/64;

        var places_list = [];
        var n = 63;
        var z = n;
        var x = 0;

        for (var i = 0; i < (avg_itinerary_pois); i++) {
            //console.log("x : "+x);
            //console.log("n : "+z);
            var place_str = '';
            for (const po in itinerary_pois) {
                if(po >= x && po <= z ){
                    //console.log(itinerary_pois[po]);
                    place_str = place_str+itinerary_pois[po]+'%7C';
                }
            }

            places_list.push(place_str);

            x = (i+1)*n + (i+1);
            z = (i+2)*n + (i+1);
        }

        res.json({
            result: "success",
            places_list: places_list
        });

    });



    /**
     * @swagger
    
    "/trip/pois": {
        "post": {
            "security": [
                {
                    "APIKeyHeader": []
                }
            ],
            "summary": "Regroup a pois array, split them every 64 elements",
            "description": "Regroup a pois array, split them every 64 elements",
            "tags" : ["trip"],
            "parameters": [
                {
                    "description": "pois",
                    "type": "string",
                    "name": "pois",
                    "in": "formData",
                    "required" : true
                }
            ],
            "responses": {
                "pois EXAMPLE": {
                    "description": "[\"poi:50762\",\"poi:19886\",\"poi:19853\",\"poi:19820\",\"poi:19850\",\"poi:19849\"]"
                },
                "200": {
                    "description": "Success output",
                    "examples" : {
                        "application/json": {
                            "result": "success",
                            "places_list": [
                              "poi:50762%7Cpoi:19886%7Cpoi:19853%7Cpoi:19820%7Cpoi:19850%7Cpoi:19849%7Cpoi:19822%7C"
                            ]
                        }
                    }
                }
            }
        }
    }
    
    */
   
   
   
    app.post( "/trip/pois-info", async(req, res) => {

        var pois = req.body.pois;  //poi:50762%7Cpoi:19886%7Cpoi:19853%7Cpoi:19820%7Cpoi:19850%7Cpoi:19849%7Cpoi:19822%7C
        if(typeof pois == 'undefined'){
            res.json({
                result: "error",
                message: "Sorry, pois not found."
            });
        }

        var group = await getPoiDetailsFromSygic(pois);

        res.json({
            result: "success",
            details: group
        });
    });

    async function getPoiDetailsFromSygic(poi_str) {

        let details;

        if(sysconfig.sygic) {
            details = await request.get(
                {
                    url: 'https://api.sygictravelapi.com/1.1/en/places?ids='+poi_str,
                    headers: {
                        "x-api-key": api_config.key.sygic
                    }
                }
            );
            details = JSON.parse(details);
        } else {
            details = dummy_pois;
        }

        var places = details['data']['places'];

        var group = {};
        for (const i in places) {
            group[places[i]['id']] = places[i];
        }

        return group;
    }



    /**
     * @swagger
    
    "/trip/pois-info": {
        "post": {
            "security": [
                {
                    "APIKeyHeader": []
                }
            ],
            "summary": "Get all attractions details by poi string",
            "description": "Get all attractions details by poi string",
            "tags" : ["trip"],
            "parameters": [
                {
                    "description": "pois",
                    "type": "string",
                    "name": "pois",
                    "in": "formData",
                    "required" : true
                }
            ],
            "responses": {
                "pois EXAMPLE": {
                    "description": "poi:50762%7Cpoi:19886%7Cpoi:19853%7Cpoi:19820%7Cpoi:19850%7Cpoi:19849%7Cpoi:19822%7C"
                },
                "200": {
                    "description": "Success output",
                    "examples" : {
                        "application/json": {
                            "result": "success",
                            "details": {
                              "poi:50762": {
                                "id": "poi:50762",
                                "level": "poi",
                                "rating": 1.25216955223,
                                "rating_local": 1.6215285208763062,
                                "quadkey": "133002112310210323221",
                                "location": {
                                  "lat": 35.7021331,
                                  "lng": 139.7752593
                                },
                                "bounding_box": null,
                                "name": "Akihabara District",
                                "name_suffix": "Tokyo, Japan",
                                "original_name": "Akihabara",
                                "url": "https://go.sygic.com/travel/place?id=poi:50762",
                                "duration": 2700,
                                "marker": "shopping",
                                "categories": [
                                  "shopping",
                                  "sightseeing"
                                ],
                                "parent_ids": [
                                  "region:2009424",
                                  "city:848054",
                                  "city:865329",
                                  "city:865324",
                                  "city:729274",
                                  "city:846468",
                                  "city:762676",
                                  "region:465",
                                  "city:2585",
                                  "poi:28260670",
                                  "country:75",
                                  "continent:4"
                                ],
                                "perex": "If you are a fan of anime which has, as a style, took the western comic book stores and animated movies market by storm, this is the place…",
                                "customer_rating": null,
                                "star_rating": null,
                                "star_rating_unofficial": null,
                                "thumbnail_url": "https://media-cdn.sygictraveldata.com/media/poi:50762",
                                "tags": [
                                  {
                                    "key": "Maid Café",
                                    "name": "Maid Café"
                                  },
                                  {
                                    "key": "Computer Goods",
                                    "name": "Computer Goods"
                                  },
                                  {
                                    "key": "Gadgets",
                                    "name": "Gadgets"
                                  },
                                  {
                                    "key": "Manga",
                                    "name": "Manga"
                                  },
                                  {
                                    "key": "Electronics",
                                    "name": "Electronics"
                                  },
                                  {
                                    "key": "Anime",
                                    "name": "Anime"
                                  }
                                ],
                                "area": 0,
                                "address": "Tokyo, Japan",
                                "address_is_approximated": true,
                                "admission": null,
                                "email": null,
                                "opening_hours": null,
                                "is_deleted": false,
                                "phone": null,
                                "description": {
                                  "text": "If you are a fan of anime which has, as a style, took the western comic book stores and animated movies market by storm, this is the place for you to be. If not, come and find out what the fuss is all about. The area is also famous for selling all things technological, hence its nickname, the \"Electric Town\".\n\nThe entire area around the Chuo-Dori street is full of various shops and even cafés, catering to the needs of the otaku, as the fans of the anime are called. You can browse through the comic books in designated stores, have a snack in a bar, where the waitress is dressed like a character from an anime story, or observe people on the streets wearing cosplay.\n\nThe easiest way to get here is via train, as the centre of the district is the Akihabara train station. You can also use the subway, exiting at a station of the same name.",
                                  "provider": null,
                                  "translation_provider": null,
                                  "link": null,
                                  "is_translated": true
                                },
                                "opening_hours_raw": null,
                                "media_count": 11,
                                "main_media": {
                                  "usage": {
                                    "square": "m:2488057",
                                    "video_preview": null,
                                    "portrait": "m:2488054",
                                    "landscape": "m:2488054"
                                  },
                                  "media": [
                                    {
                                      "original": {
                                        "size": null,
                                        "width": 2048,
                                        "height": 1536
                                      },
                                      "suitability": [
                                        "square"
                                      ],
                                      "url_template": "https://media-cdn.sygictraveldata.com/media/{size}/612664395a40232133447d33247d3832343838303537",
                                      "created_at": "2015-02-16T10:05:39+0000",
                                      "source": {
                                        "provider": "wikipedia",
                                        "name": "Wikimedia Commons",
                                        "external_id": null
                                      },
                                      "type": "photo",
                                      "created_by": "4fe441ce2d0ec",
                                      "url": "https://media-cdn.sygictraveldata.com/media/612664395a40232133447d33247d3832343838303537.jpg",
                                      "quadkey": "100110010110001011",
                                      "attribution": {
                                        "title_url": "http://commons.wikimedia.org/wiki/File:Akihabara_-27.jpg",
                                        "license": "CC BY-SA 3.0",
                                        "other": null,
                                        "author_url": "http://commons.wikimedia.org/wiki/User:Aimaimyi",
                                        "author": "Aimaimyi",
                                        "title": "The Gamers Main store in the Akihabara. This location is in Chiyoda, Tokyo, Japan.",
                                        "license_url": "http://creativecommons.org/licenses/by-sa/3.0"
                                      },
                                      "location": {
                                        "lat": 139.771543,
                                        "lng": 35.699778
                                      },
                                      "id": "m:2488057"
                                    },
                                    {
                                      "original": {
                                        "size": null,
                                        "width": 2048,
                                        "height": 1360
                                      },
                                      "suitability": [
                                        "landscape",
                                        "portrait"
                                      ],
                                      "url_template": "https://media-cdn.sygictraveldata.com/media/{size}/612664395a40232133447d33247d3832343838303534",
                                      "created_at": "1970-01-01T00:00:00+0000",
                                      "source": {
                                        "provider": "wikipedia",
                                        "name": "Wikimedia Commons",
                                        "external_id": null
                                      },
                                      "type": "photo",
                                      "created_by": "4fe441ce2d0ec",
                                      "url": "https://media-cdn.sygictraveldata.com/media/612664395a40232133447d33247d3832343838303534.jpg",
                                      "quadkey": null,
                                      "attribution": {
                                        "title_url": "http://commons.wikimedia.org/wiki/File:Akihabara_03.jpg",
                                        "license": "CC BY-SA 3.0",
                                        "other": null,
                                        "author_url": "http://commons.wikimedia.org/wiki/User:Ocdp",
                                        "author": "Ocdp",
                                        "title": "Akihabara Chuo street",
                                        "license_url": "http://creativecommons.org/licenses/by-sa/3.0"
                                      },
                                      "location": null,
                                      "id": "m:2488054"
                                    }
                                  ]
                                },
                                "references": [
                                  {
                                    "id": 1483439,
                                    "title": "Wikipedia",
                                    "type": "wiki",
                                    "language_id": "en",
                                    "url": "https://en.wikipedia.org/wiki/Akihabara",
                                    "supplier": "wiki",
                                    "priority": 0,
                                    "currency": null,
                                    "price": null,
                                    "flags": []
                                  },
                                  {
                                    "id": 16452874,
                                    "title": "About Tokyo/Akihabara",
                                    "type": "guide",
                                    "language_id": "en",
                                    "url": "https://guides.travel.sygic.com/production/en/Tokyo/Akihabara",
                                    "supplier": "wikivoyage",
                                    "priority": 503,
                                    "currency": null,
                                    "price": null,
                                    "flags": [
                                      "destination_menu"
                                    ]
                                  }
                                ],
                                "external_ids": [
                                  {
                                    "id": "node:4158305100",
                                    "type": "osm",
                                    "language_id": null
                                  },
                                  {
                                    "id": "en:Akihabara",
                                    "type": "wikipedia",
                                    "language_id": "en"
                                  },
                                  {
                                    "id": "Q418096",
                                    "type": "wikidata",
                                    "language_id": null
                                  }
                                ],
                                "collection_count": 0,
                                "satellite": null
                              }
                            }
                        }
                    }
                }
            }
        }
    }
    
    */
   
   

    app.post( "/trip/update", async(req, res) => {

        var theday = req.body.date;
        var pois = req.body.pois;
        var start_time =  req.body.start_time;
        var end_time =  req.body.end_time;
        pois = JSON.parse(pois);
        /*
        {
            "pois": [
                        {
                           "poi":"26611751",
                           "duration" : "1800"
                        },
                        {
                           "poi":"19859",
                           "duration" : "1200"
                        },
                        {
                           "poi":"59297",
                           "duration" : "1800"
                        },
                        {
                           "poi":"10536422",
                           "duration" : "1800"
                        },
                        {
                           "poi":"50936",
                           "duration" : "1800"
                        },
                        {
                           "poi":"17766238",
                           "duration" : "1800"
                        },
                        {
                           "poi":"5538146",
                           "duration" : "1800"
                        },
                        {
                           "poi":"19925",
                           "duration" : "1800"
                        },
                        {
                           "poi":"25307973",
                           "duration" : "1400"
                        }
                    ]
        }
         */

        let poi_str = '';
        for (const p of pois['pois']) {
            poi_str += 'poi:'+p['poi']+'%7C';
        }

        var details = await getPoiDetailsFromSygic(poi_str);
        //details
        // res.json({
        //     details: details,
        //     pois: pois
        // });

        let pool = [];
        let k = 0;
        for (const index in details) {
            details[index]['duration'] = parseInt(pois['pois'][k]['duration']);
            pool.push(details[index]);
            k++;
        }

        var remain_coordinate = null;
        var remain_location = null;
        if(req.body.hotel != null){
            remain_coordinate = req.body.hotel;
            remain_location = "hotel";
        }

        var schedule = [];
        var itinerary = await getSchedule(pool,theday,start_time,end_time,remain_coordinate,remain_coordinate,remain_location,remain_location,"update");
        itinerary_obj = {};
        itinerary_obj[theday] = itinerary;
        schedule.push(itinerary_obj);

        res.json({
            result: "success",
            theday: theday,
            pois: pois,
            poi_str: poi_str,
            number_of_pois: pool.length,
            dates: [theday],
            schedule: schedule,
            details: details,
            related_flight_id: null
        });
    });
    
    
    
    /**
    * @swagger
    
    "/trip/update": {
        "post": {
            "security": [
                {
                    "APIKeyHeader": []
                }
            ],
            "summary": "Update Itinerary JSON string",
            "description": "Update Itinerary JSON string",
            "tags" : ["trip"],
            "parameters": [
                {
                    "description": "Date of the trip",
                    "type": "string",
                    "name": "date",
                    "in": "formData",
                    "required" : true
                },
                {
                    "description": "Group of pois",
                    "type": "string",
                    "name": "pois",
                    "in": "formData",
                    "required" : true
                },
                {
                    "description": "Start time of the trip",
                    "type": "string",
                    "name": "start_time",
                    "in": "formData",
                    "required" : true
                },
                {
                    "description": "End time of the trip",
                    "type": "string",
                    "name": "end_time",
                    "in": "formData",
                    "required" : true
                },
                {
                    "description": "Coordination of the hotel",
                    "type": "string",
                    "name": "hotel",
                    "in": "formData"
                }
            ],
            "responses": {
                "pois EXAMPLE": {
                    "description": "Success output",
                    "examples" : {
                        "application/json": {
                            "pois": [
                                {
                                   "poi":"26611751",
                                   "duration" : "1800"
                                },
                                {
                                   "poi":"19859",
                                   "duration" : "1200"
                                },
                                {
                                   "poi":"59297",
                                   "duration" : "1800"
                                },
                                {
                                   "poi":"10536422",
                                   "duration" : "1800"
                                },
                                {
                                   "poi":"50936",
                                   "duration" : "1800"
                                },
                                {
                                   "poi":"17766238",
                                   "duration" : "1800"
                                },
                                {
                                   "poi":"5538146",
                                   "duration" : "1800"
                                },
                                {
                                   "poi":"19925",
                                   "duration" : "1800"
                                },
                                {
                                   "poi":"25307973",
                                   "duration" : "1400"
                                }
                            ]
                        }
                    }
                },
                "200": {
                    "description": "Success output",
                    "examples" : {
                        "application/json": {
                            "result": "success",
                            "theday": "2020-05-06",
                            "pois": {
                              "pois": [
                                {
                                  "poi": "26611751",
                                  "duration": "1800"
                                },
                                {
                                  "poi": "19859",
                                  "duration": "1200"
                                },
                                {
                                  "poi": "59297",
                                  "duration": "1800"
                                },
                                {
                                  "poi": "10536422",
                                  "duration": "1800"
                                },
                                {
                                  "poi": "50936",
                                  "duration": "1800"
                                },
                                {
                                  "poi": "17766238",
                                  "duration": "1800"
                                },
                                {
                                  "poi": "5538146",
                                  "duration": "1800"
                                },
                                {
                                  "poi": "19925",
                                  "duration": "1800"
                                },
                                {
                                  "poi": "25307973",
                                  "duration": "1400"
                                }
                              ]
                            },
                            "poi_str": "poi:26611751%7Cpoi:19859%7Cpoi:59297%7Cpoi:10536422%7Cpoi:50936%7Cpoi:17766238%7Cpoi:5538146%7Cpoi:19925%7Cpoi:25307973%7C",
                            "number_of_pois": 9,
                            "dates": [
                              "2020-05-06"
                            ],
                            "schedule": [
                              {
                                "2020-05-06": [
                                  {
                                    "type": "timeflag",
                                    "starttime": "09:00",
                                    "endtime": "18:30"
                                  },
                                  {
                                    "type": "poi",
                                    "poi_id": "poi:26611751",
                                    "location": "Tōgū Palace",
                                    "coordinate": "35.6780291,139.7251272",
                                    "duration": 1800,
                                    "rating": 0.0095778151498294,
                                    "schedule_time": "5/6/2020, 09:00:00",
                                    "perex": "The Tōgū Palace is located in the Akasaka Estate in Akasaka, Tokyo. Tōgū literally means \"East Palace\", the traditional name for the…",
                                    "thumbnail_url": "https://media-cdn.sygictraveldata.com/media/poi:26611751"
                                  },
                                  {
                                    "type": "transport",
                                    "duration": 2606,
                                    "distance": 26333
                                  },
                                  {
                                    "type": "poi",
                                    "poi_id": "poi:19859",
                                    "location": "Hie Shrine",
                                    "coordinate": "35.6747447,139.7398626",
                                    "duration": 1200,
                                    "rating": 0.089804183232222,
                                    "schedule_time": "5/6/2020, 10:01:00",
                                    "perex": "Dating back to the 14th century, this picturesque Shinto shrine was destroyed during WWII and reconstructed in the following years.",
                                    "thumbnail_url": "https://media-cdn.sygictraveldata.com/media/poi:19859"
                                  },
                                  {
                                    "type": "transport",
                                    "duration": 748,
                                    "distance": 6993
                                  },
                                  {
                                    "type": "poi",
                                    "poi_id": "poi:59297",
                                    "location": "University of Tokyo (Hongo Campus)",
                                    "coordinate": "35.7119959,139.7628678",
                                    "duration": 1800,
                                    "rating": 0.057888149123311,
                                    "schedule_time": "5/6/2020, 11:03:00",
                                    "perex": "The Hongō campus is one of five campuses of University of Tokyo. Most of the more specified and advanced undergraduate course are taken here…",
                                    "thumbnail_url": "https://media-cdn.sygictraveldata.com/media/poi:59297"
                                  },
                                  {
                                    "type": "transport",
                                    "duration": 780,
                                    "distance": 3598
                                  },
                                  {
                                    "type": "poi",
                                    "poi_id": "poi:10536422",
                                    "location": "Ekoin Temple",
                                    "coordinate": "35.6933385,139.7920396",
                                    "duration": 1800,
                                    "rating": 0.019122623047824,
                                    "schedule_time": "5/6/2020, 12:10:00",
                                    "perex": "Ekō-in, also known as Honjo Ekō-in, is a Pure Land Buddhist temple in Ryōgoku, Tokyo.",
                                    "thumbnail_url": "https://media-cdn.sygictraveldata.com/media/poi:10536422"
                                  },
                                  {
                                    "type": "transport",
                                    "duration": 482,
                                    "distance": 1987
                                  },
                                  {
                                    "type": "poi",
                                    "poi_id": "poi:50936",
                                    "location": "St. Mary's Cathedral",
                                    "coordinate": "35.7142596,139.7265757",
                                    "duration": 1800,
                                    "rating": 0.034930358737447,
                                    "schedule_time": "5/6/2020, 13:18:00",
                                    "perex": "Designed in a modernist style by Kenzo Tange, this church, opened to the public in 1964, is the seat of the Roman Catholic Archdiocese in…",
                                    "thumbnail_url": "https://media-cdn.sygictraveldata.com/media/poi:50936"
                                  },
                                  {
                                    "type": "transport",
                                    "duration": 793,
                                    "distance": 6092
                                  },
                                  {
                                    "type": "poi",
                                    "poi_id": "poi:17766238",
                                    "location": "Harry's Hedgehog Cafe",
                                    "coordinate": "35.6622439,139.7319888",
                                    "duration": 1800,
                                    "rating": 0.032660635001973,
                                    "schedule_time": "5/6/2020, 14:24:00",
                                    "perex": null,
                                    "thumbnail_url": null
                                  },
                                  {
                                    "type": "transport",
                                    "duration": 963,
                                    "distance": 7060
                                  },
                                  {
                                    "type": "poi",
                                    "poi_id": "poi:5538146",
                                    "location": "Mikimoto Headquarters",
                                    "coordinate": "35.6718884,139.7653537",
                                    "duration": 1800,
                                    "rating": 0.00056143643939215,
                                    "schedule_time": "5/6/2020, 15:36:00",
                                    "perex": null,
                                    "thumbnail_url": null
                                  },
                                  {
                                    "type": "transport",
                                    "duration": 863,
                                    "distance": 4368
                                  },
                                  {
                                    "type": "poi",
                                    "poi_id": "poi:19925",
                                    "location": "Shibamata Taishakuten Temple",
                                    "coordinate": "35.7584185,139.8786862",
                                    "duration": 1800,
                                    "rating": 0.026321335453857,
                                    "schedule_time": "5/6/2020, 16:42:00",
                                    "perex": "Shibamata Taishakuten is a Buddhist temple in Katsushika, Tokyo, Japan. Founded in 1629, the main image is of Taishakuten.",
                                    "thumbnail_url": "https://media-cdn.sygictraveldata.com/media/poi:19925"
                                  }
                                ]
                              }
                            ],
                            "details": {

                            },
                            "related_flight_id": null
                        }
                    }
                }
            }
        }
    }
    
    */
   
   
   
    app.post( "/trip/search", async(req, res) => {
        
        var keyword =  encodeURI(req.body.keyword);
        var city =  req.body.city;
        if(typeof keyword == 'undefined'){
            res.json({
                result: "error",
                message: "Sorry, keyword not found."
            });
        }
        if(typeof city == 'undefined'){
            res.json({
                result: "error",
                message: "Sorry, Need city name to match searching"
            });
        }
        
        if(sysconfig.sygic) {
            var url = 'https://api.sygictravelapi.com/1.1/en/places/list?query='+keyword;
            var pois = await request.get(
               {
                   url: url,
                   headers: {
                       "x-api-key": api_config.key.sygic
                   }
               }
           );
            pois = JSON.parse(pois);
        } else {
            pois = dummy_search; //hard code dummy json data to speed up development, disable in production
        }
        
        var country = await db.cities.find({
            where: {
               city_id: {
                 [Op.eq]: city
               }
            }
        });
        
        if(country !== null){
            country = country.country_id;
        }
            
        var places = pois['data']['places'];
        var result = [];
        for (const i in places) {
            if(places[i]['level'] == 'poi'){
                if(places[i]['parent_ids'].includes(city)){
                    result.push(places[i]);
                } else {
                    if(country !== null){
                        if(places[i]['parent_ids'].includes(country)){
                            result.push(places[i]);
                        }
                    }
                }
            }
        }
        
        res.json({
            result: "success",
            city: city,
            country: country,
            places: result
        });
    });
    
    
    
    /**
    * @swagger
    
    "/trip/search": {
        "post": {
            "security": [
                {
                    "APIKeyHeader": []
                }
            ],
            "summary": "Update Itinerary JSON string",
            "description": "Update Itinerary JSON string",
            "tags" : ["trip"],
            "parameters": [
                {
                    "description": "keyword to search",
                    "type": "string",
                    "name": "keyword",
                    "in": "formData",
                    "required" : true
                },
                {
                    "description": "city id, example: city:476",
                    "type": "string",
                    "name": "city",
                    "in": "formData",
                    "required" : true
                }
            ],
            "responses": {
                "200": {
                    "description": "Success output",
                    "examples" : {
                        "application/json": {
                            "result": "success",
                            "city": "city:476",
                            "country": "country:75",
                            "places": [
                              {
                                "id": "poi:19822",
                                "level": "poi",
                                "rating": 1.687820097566,
                                "rating_local": 2.9636666018473696,
                                "quadkey": "133002112310122302011",
                                "location": {
                                  "lat": 35.7140806,
                                  "lng": 139.7961142
                                },
                                "bounding_box": {
                                  "south": 35.7109656,
                                  "west": 139.7941888,
                                  "north": 35.7162404,
                                  "east": 139.7976925
                                },
                                "name": "Senso-ji",
                                "name_suffix": "Asakusa, Tokyo, Japan",
                                "original_name": "金龍山 浅草寺",
                                "url": "https://go.sygic.com/travel/place?id=poi:19822",
                                "duration": 5400,
                                "marker": "other:place_of_worship:temple",
                                "categories": [
                                  "sightseeing"
                                ],
                                "parent_ids": [
                                  "region:2009424",
                                  "poi:29291796",
                                  "city:848054",
                                  "city:865329",
                                  "city:846468",
                                  "city:762676",
                                  "poi:36579807",
                                  "city:2585",
                                  "poi:36125237",
                                  "poi:36368651",
                                  "country:75",
                                  "continent:4"
                                ],
                                "perex": "Built in the early 7th century AD, this is the oldest as well as the most visited temple in Tokyo.",
                                "customer_rating": null,
                                "star_rating": null,
                                "star_rating_unofficial": null,
                                "thumbnail_url": "https://media-cdn.sygictraveldata.com/media/poi:19822"
                              }
                            ]
                        }
                    }
                }
            }
        }
    }
    
    */
   
   
   
};