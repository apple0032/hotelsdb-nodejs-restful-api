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

    app.post( "/pois", async(req, res) => {

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

    app.post( "/pois-info", async(req, res) => {

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


    app.post( "/trip-update", async(req, res) => {

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
    
    app.post( "/trip/search", async(req, res) => {
        
        var keyword =  req.body.keyword;
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
           var pois = await request.get(
               {
                   url: 'https://api.sygictravelapi.com/1.1/en/places/list?query='+keyword,
                   headers: {
                       "x-api-key": api_config.key.sygic
                   }
               }
           );
            pois = JSON.parse(pois);
        } else {
            pois = dummy_search; //hard code dummy json data to speed up development, disable in production
        }
        
        var places = pois['data']['places'];
        var result = [];
        for (const i in places) {
            if(places[i]['level'] == 'poi'){
                if(places[i]['parent_ids'].includes(city)){
                    result.push(places[i]);
                }
            }
        }
        
        res.json({
            result: "success",
            city: city,
            places: result
        });
    });
};