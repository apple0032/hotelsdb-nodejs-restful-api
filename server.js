const express = require("express");
const bodyParser = require("body-parser");
const faker = require("faker");
const times = require("lodash.times");
const random = require("lodash.random");
const db = require("./models");
const request = require('request');

const apiIndex = require("./app/api/index");
const apiUsers = require("./app/api/admin/users");
const apiHotel = require("./app/api/hotel");
const apiFlight = require("./app/api/flight");
const apiAccount = require("./app/api/account");
const apiTrip = require("./app/api/trip");

const app = express();
//app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("app/public"));

const current = require('node-datetime');
const listEndpoints = require('express-list-endpoints');
//const dt = dateTime.create();
//const current = dateTime.create().format('Y-m-d H:M:S');
//console.log(current.create().format('Y-m-d H:M:S'));

//Swagger widget
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

const options = {
  swaggerDefinition : {
        info :{
            title: "HotelsDB API Documentation",
            version: "1.1.0",
            description: "This is HotelsDB API Documentation. \n\n# Introduction\nThis API is documented in **Swagger format** and is based on HotelsDB website content provided by **Hotelsdb development team.** \n Currently, HotelsDB API is not released for public use. It only provides API specification for developer to read and test. \n For internal use, `API-KEY` header is required for authentication. Error message will display without the key. For more information, please contact out Chief Software Engineer - **Ken Ip** by email. \n \n# Copyright\n© 2020 Apple0032 | KenIp , All Rights Reserved",
            contact:{
                name: "KENIP",
                email: "kenip0813@gmail.com"
            }
        },
        securityDefinitions:{
          APIKeyHeader: {
              type: "apiKey",
              in: "header",
              name: "api_key"
          }
        },
        schemes: ["http"],
        consumes: [
            "application/x-www-form-urlencoded",
        ],
        produces: [
            "application/json"
        ],
        tags: [
            {
                description: " - Hotel client side APIs",
                name: "hotel"
            },
            {
                description: " - Flight client side APIs",
                name: "flight"
            },
            {
                description: " - User client side APIs",
                name: "user"
            },
            {
                description: " - Trip client side APIs",
                name: "trip"
            },
            {
                description: " - User Admin Management APIs",
                name: "admin-user"
            }
        ]
  },
  apis: [
      "server.js",
      "app/api/hotel.js",
      "app/api/flight.js",
      "app/api/trip.js",
      "app/api/account.js",
      "app/api/admin/users.js"
  ]
};

const swaggerDocs = swaggerJsDoc(options);
app.use("/api-docs",swaggerUI.serve, swaggerUI.setup(swaggerDocs));



//API authentication before all request
app.all('/*', function(req, res, next) {
    console.log('Intercepting requests ...');
    console.log('Running for API authentication......');
    
    ApiKeyChecking(req, res, next);
});

function ApiKeyChecking(req, res, next){
    
    /* Validation algorithm
     * - Only admin level api_key allow to access admin control api
     * - For user control api, request any of one api_key in users table
     * - Some of exceptional api path inside exception array should bypass the validation
     */
    var ApiRequest = req.originalUrl;
    console.log(ApiRequest);
    
    var AdminResult = ApiRequest.includes("admin");
    
    var exception = [
        '/account/login',
        '/hotel/search/normal',
        '/index'
    ];
    var ExceptResult = exception.includes(ApiRequest);
    
    if(ExceptResult == false){
        if((!(req.header('api_key')))){
            res.json({ result: 'error', message: 'Missing api_key' });
        } else {

            var api_key = req.header('api_key');
            var apiRequired = {api_key:api_key};
            if(AdminResult == true){
                apiRequired.role = 'superadmin';
            }

            //Find api_key inside users table 
            db.users.findOne({
                    where: apiRequired
            }).then( (result) => {
                console.log(result);
                if(result !== null){
                   initApi(next);
                } else {
                   res.json({ result: 'error', message: 'Invalid api_key.' });
                }
            }).catch(err => {
                 console.log(err);
            });
            
        }
    } else {
        initApi(next);
    }
}

function initApi(next){
    apiIndex(app);
    apiUsers(app, db, current);
    apiHotel(app, db, current);
    apiFlight(app, db, current);
    apiAccount(app,db,current);
    apiTrip(app,db,current);
    next();
    
    app.use('*', function(req, res){
        res.send({
            result: 'error',
            code: '404',
            message: 'Sorry, invalid route or request method found.'
        });
    });
}



//Database table association & relationship
db.hotel_room.belongsTo(db.room_type,{foreignKey: 'room_type_id'});
db.room_type.hasMany(db.hotel_room,{foreignKey: 'id'});

db.hotel_room.belongsTo(db.hotel,{foreignKey: 'id'});
db.hotel.hasMany(db.hotel_room,{foreignKey: 'hotel_id'});

db.hotel.belongsToMany(db.tags,{  through: 'post_tag', otherKey: 'tag_id', foreignKey: 'hotel_id'});
db.tags.belongsToMany(db.hotel,{  through: 'post_tag', otherKey: 'hotel_id', foreignKey: 'tag_id'});

db.booking.belongsTo(db.hotel,{foreignKey: 'hotel_id'});
db.hotel.hasMany(db.booking,{foreignKey: 'id'});

db.booking.belongsTo(db.hotel_room,{foreignKey: 'hotel_room_id'});
db.hotel_room.hasMany(db.booking,{foreignKey: 'id'});

db.booking.belongsTo(db.payment_method,{foreignKey: 'payment_method_id'});
db.payment_method.hasMany(db.booking,{foreignKey: 'id'});

db.booking.belongsTo(db.users,{foreignKey: 'user_id'});
db.users.hasMany(db.booking,{foreignKey: 'id'});

db.booking.hasOne(db.booking_payment,{foreignKey: 'booking_id'});
db.booking_payment.belongsTo(db.booking,{foreignKey: 'id'});

db.booking.hasMany(db.booking_guest,{foreignKey: 'booking_id'});
db.booking_guest.belongsTo(db.booking,{foreignKey: 'id'});

db.flight_booking.hasMany(db.flight_passenger,{foreignKey: 'flight_booking_id'});
db.flight_passenger.belongsTo(db.flight_booking,{foreignKey: 'id'});
//**** Dummy & testing area ****//

//Password encryption algorithm same as laravel
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('123');
//console.log(hash);
//console.log(bcrypt.compareSync('123', hash));

//api_key hashing algorithm
//console.log(Buffer.from(current).toString('base64'));

//HTTP request / restful API Demo/example code
app.get( "/rest-api", (req, res) => {

    var q =  req.query.q;
    var loc = req.query.loc;

        request(
          { method: 'GET',
            uri: 'http://api.openweathermap.org/data/2.5/weather?q='+loc+'&appid='+q+'&units=metric',
            gzip: true
          },
        function (error, response, body) {
            // body is the decompressed response body
            //console.log('server encoded the data as: ' + (response.headers['content-encoding'] || 'identity'));
            //console.log('the decoded data is: ' + body);
            res.setHeader('Content-Type', 'application/json');
            res.send(body);
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
        
     //api.openweathermap.org/data/2.5/forecast?q=tokyo&units=metric&appid=; //forecast for 5 days
     //https://www.weatherbit.io/api //other weather source
  }
);

//Test async/await function
app.get( "/async-test", async (req, res) => {
    const util = require('util');
    const requestPromise = util.promisify(request);
    const response = await requestPromise('https://www.google.com');
    console.log('response', response.body);
  }
);
  
app.get( "/list", async (req, res) => {
    
    var list = listEndpoints(app);
    list[0] = null;
    
    var endpoints = [];
    for (const li of list) {
        if(li != null){
            endpoints.push(li.path);
        }
    }
    
    res.send({
        result: 'success',
        total: endpoints.length,
        endpoints: endpoints
    });
    
  }
);

//Node.js server listener

//db.sequelize.sync().then(() => {
//  app.listen(8080, () => console.log("App listening on port 8080!"));
//});
app.listen(8080, () => console.log("App listening on port 8080!"));


//API specification
/*
 * *The user-control & data access will be first priority for hotelsdb restful api
 * *because the mobile version of hotelsdb will be coming soon.
 *  
 * # Account
 *  - [POST] /account/login
 *  - [PUT]  /account/api-key/{userid} *generate new api-key
 *  - [GET]  /account/{userid}
 *  - [PUT]  /account/{userid}
 *  - [POST] /account/create
 * 
 * # Hotel
 *  - [GET]  /hotel/list
 *  - [GET]  /hotel/{hotelid}
 *  - [GET]  /hotel/comment/{hotelid}
 *  - [POST] /hotel/comment/{hotelid}
 *  - [GET]  /hotel/room/{hotelid}
 *  
 * # Searching Hotel
 *  - [POST] /hotel/search/normal
 *  - [POST] /hotel/search/advanced //Pending for researching...
 *  
 * # Booking Hotel
 *  - [GET]  /hotel/booking/status?hotel_id=&start=&end=   *check room status by hotel
 *  - [GET]  /hotel/booking/validate?hotel_id=&start=&end=   *validate a hotel room by room_id
 *  - [GET]  /hotel/booking/{userid} *get all hotel booking by userid
 *  - [GET]  /hotel/booking/details/{bookid}
 *  - [POST] /hotel/booking/create
 *  - [POST] /hotel/booking/payment/{bookid}
 *  - [post] /hotel/bookong/guest/{bookid}
 * 
 * # Searching Flight
 *  - [GET] /flight/searchCounty/{text}  *search country
 *  - [GET] /flight/searchAirport/{countrycode} *search airports by country code
 *  - [GET] /flight/result/{from}/{to}/{date} *search all flights
 *  
 * # Booking Flight
 *  - [GET]  /flight/booking/{userid}
 *  - [GET]  /flight/booking/details/{bookingid}
 *  - [GET]  /flight/seat?code=&date=&seat=
 *  - [POST] /flight/seat/{bookingid}
 *  - [POST] /flight/booking
 *  - [POST] /flight/payment
 *  - [POST] /flight/passenger
 *  
 * # Trip management
 *  
 * 
 * 
 */


    
    
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
                    "description": "",
                    "examples" : {
                        "application/json": {
                            
                        }
                    }
                }
            }
        }
    }
    
    */