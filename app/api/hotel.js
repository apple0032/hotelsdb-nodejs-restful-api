var Sequelize = require('sequelize');
const Op = Sequelize.Op;

module.exports = (app, db , current) => {
  
  //Get all hotels
  app.get( "/hotel/list", (req, res) => {
      offset = parseInt(req.query.offset);
      limit = parseInt(req.query.limit);
      if(isNaN(offset)){ offset = 0; }
      if(isNaN(limit)){ limit = 100; }
      console.log(offset,limit);
      
        db.hotel.findAll({offset: offset, limit: limit }).then(result => {
           if(result !== null){
              res.json({ 
                  result: 'success' , 
                  total: result.length , 
                  offset: offset,
                  limit: limit,
                  data: result 
              });
           } else {
              res.json({ result: 'error', message: 'No data found.' });
           }
        }).catch(err => {
            console.log(err);
        });
    }
  );
  
    /**
    * @swagger

        "/hotel/list": {
            "get": {
                "security": [
                    {
                        "APIKeyHeader": []
                    }
                ],
                "summary": "List out all hotel records",
                "description": "Retrieve all hotel data from database by only offset/limit",
                "tags" : ["hotel"],
                "parameters": [
                    {
                        "description": "limit number of records",
                        "type": "integer",
                        "name": "limit",
                        "in": "query"
                    },
                    {
                        "description": "offset number of records",
                        "type": "integer",
                        "name": "offset",
                        "in": "query"
                    }
                ],
                "responses": {
                    "200": {
                        "description": "Success output",
                        "examples" : {
                            "application/json": {
                                "result": "success",
                                "total": 1,
                                "offset": 0,
                                "limit": 1,
                                "data": [
                                    {
                                        "id": 40,
                                        "name": "The Peninsula Hong Kong",
                                        "star": 5,
                                        "phone": 23698741,
                                        "category_id": 9,
                                        "default_image": "19912",
                                        "image": "1544966763.jpg",
                                        "body": "rich hotel",
                                        "coordi_x": "22.295077",
                                        "coordi_y": "114.171799",
                                        "new": 0,
                                        "handling_price": 25,
                                        "created_at": "2018-12-16 20:00:00",
                                        "updated_at": "2019-01-08 22:37:52",
                                        "soft_delete": 0
                                    }
                                ]
                            }
                        }
                    }
                }
            }
        }
    */
  
  
  
  //Get a hotel by hotel_id
  app.get( "/hotel/:hotel_id", (req, res) => {
       db.hotel.findById(req.params.hotel_id).then( (result) => {
           if(result !== null){
                res.json({ 
                    result: 'success' , 
                    data: result 
                });
           } else {
              res.json({ result: 'error', message: 'No data found.' });
           }
       }).catch(err => {
            console.log(err);
       });
    }
  );
  
    /**
    * @swagger

    "/hotel/{hotel_id}": {
        "get": {
            "security": [
                {
                    "APIKeyHeader": []
                }
            ],
            "summary": "List out a hotel record by ID",
            "description": "Retrieve a hotel data from database by ID",
            "tags" : ["hotel"],
            "parameters": [
                {
                    "required": true,
                    "description": "id of hotel",
                    "type": "integer",
                    "name": "hotel_id",
                    "in": "path"
                }
            ],
            "responses": {
                "200": {
                    "description": "Success output",
                    "examples" : {
                        "application/json": {
                            "result": "success",
                            "data": [
                                {
                                    "id": 40,
                                    "name": "The Peninsula Hong Kong",
                                    "star": 5,
                                    "phone": 23698741,
                                    "category_id": 9,
                                    "default_image": "19912",
                                    "image": "1544966763.jpg",
                                    "body": "rich hotel",
                                    "coordi_x": "22.295077",
                                    "coordi_y": "114.171799",
                                    "new": 0,
                                    "handling_price": 25,
                                    "created_at": "2018-12-16 20:00:00",
                                    "updated_at": "2019-01-08 22:37:52",
                                    "soft_delete": 0
                                }
                            ]
                        }
                    }
                }
            }
        }
    }
    */
  
  
  
  //Get all comment by hotel_id
  app.get( "/hotel/comment/:hotel_id", (req, res) => {
        db.hotel_comment.findAll({
            where: {
              hotel_id: req.params.hotel_id
            }
        }).then((result) => {
            console.log(result);
           if(result != ''){
              res.json({
                  result: 'success',
                  data: result 
              });
           } else {
              res.json({ result: 'error', message: 'No data found.' });
           }
        }).catch(err => {
            console.log(err);
        });
    }
  );
  

  //Create new hotel comment
  app.post( "/hotel/comment/:hotel_id", (req, res) => {
    var required_fields = [req.body.star, req.body.comment,req.body.user_id];
    var validator = ApiFieldsValidation(required_fields);
    
    if(validator === true){
        db.hotel_comment.create({
          hotel_id: req.params.hotel_id,
          user_id: req.body.user_id,
          comment: req.body.comment,
          star: req.body.star,
          status: req.body.status, 
          created_at: current.create().format('Y-m-d H:M:S'),
          updated_at: current.create().format('Y-m-d H:M:S')
        }).then( (result) => {
            res.json(result);
        }).catch(err => {
            console.log(err);
        });
    } else {
        res.json({ result: 'error', message: 'Missing required parameters.' });
    }
  });
  
    /**
    * @swagger
     
    "/hotel/comment/{hotel_id}": {
        "get": {
            "security": [
                {
                    "APIKeyHeader": []
                }
            ],
            "summary": "List out all comments of a hotel by hotel ID",
            "description": "Retrieve all comments of a hotel by hotel ID",
            "tags" : ["hotel"],
            "parameters": [
                {
                    "required": true,
                    "description": "id of hotel",
                    "type": "integer",
                    "name": "hotel_id",
                    "in": "path"
                }
            ],
            "responses": {
                "200": {
                    "description": "Success output",
                    "examples" : {
                        "application/json": {
                            "result": "success",
                            "data": [
                                {
                                    "id": 7,
                                    "hotel_id": 40,
                                    "user_id": 5,
                                    "comment": "Great hotel ! Thank for the services.",
                                    "star": 4.5,
                                    "status": 1,
                                    "created_at": "2018-12-27 23:16:19",
                                    "updated_at": "2018-12-27 23:16:19"
                                },
                                {
                                    "id": 13,
                                    "hotel_id": 40,
                                    "user_id": 2,
                                    "comment": "fix bug",
                                    "star": 5,
                                    "status": 1,
                                    "created_at": "2019-01-07 00:43:23",
                                    "updated_at": "2019-01-07 00:43:23"
                                }
                            ]
                        }
                    }
                }
            }
        },

        "post": {
            "security": [
                {
                    "APIKeyHeader": []
                }
            ],
            "summary": "Post a comment of a hotel by hotel ID",
            "description": "Post a comment of a hotel by hotel ID",
            "tags" : ["hotel"],
            "parameters": [
                {
                    "required": true,
                    "description": "id of hotel",
                    "type": "integer",
                    "name": "hotel_id",
                    "in": "path"
                },
                {
                    "required": true,
                    "description": "id of user",
                    "type": "integer",
                    "name": "user_id",
                    "in": "formData"
                },
                {
                    "required": true,
                    "description": "Pure string format",
                    "type": "string",
                    "name": "comment",
                    "in": "formData"
                },
                {
                    "required": true,
                    "description": "Star value of the hotel",
                    "type": "number",
                    "name": "star",
                    "in": "formData"
                },
                {
                    "required": true,
                    "description": "Default is active",
                    "type": "integer",
                    "name": "status",
                    "in": "formData",
                    "default" : "1"
                },
            ],
            "responses": {
                "200": {
                    "description": "Success output",
                    "examples" : {
                        "application/json": {
                            "id": 22,
                            "hotel_id": "40",
                            "user_id": "1",
                            "comment": "testing",
                            "star": "3.5",
                            "status": "1",
                            "created_at": "2020-04-23 14:54:53",
                            "updated_at": "2020-04-23 14:54:53"
                        }
                    }
                }
            }
        }
    }
    
    */
  
  
   
  //Get all room by hotel_id
  app.get( "/hotel/room/:hotel_id", (req, res) => {
        db.hotel_room.findAll({
            where: {
              hotel_id: req.params.hotel_id
            },
            include: [db.room_type]
        }).then((result) => {
            console.log(result);
           if(result != ''){
              res.json({ 
                  result: 'success',
                  hotel_id : req.params.hotel_id,
                  data: result 
              });
           } else {
              res.json({ result: 'error', message: 'No data found.' });
           }
        }).catch(err => {
            console.log(err);
        });
    }
  );
  
  /**
   * @swagger

    "/hotel/room/{hotel_id}": {
        "get": {
            "security": [
                {
                    "APIKeyHeader": []
                }
            ],
            "summary": "List out all rooms by hotel ID",
            "description": "List out all rooms by hotel ID",
            "tags" : ["hotel"],
            "parameters": [
                {
                    "required": true,
                    "description": "id of hotel",
                    "type": "integer",
                    "name": "hotel_id",
                    "in": "path"
                },
                {
                    "description": "Default is active",
                    "type": "integer",
                    "name": "status",
                    "in": "formData",
                    "default" : "1"
                }
            ],
            "responses": {
                "200": {
                    "description": "Success output",
                    "examples" : {
                        "application/json": {
                            "result": "success",
                            "hotel_id" : "41",
                            "data": [
                                {
                                    "id": 23,
                                    "hotel_id": 41,
                                    "room_type_id": 1,
                                    "ppl_limit": 5,
                                    "price": 1000,
                                    "qty": 30,
                                    "availability": 1,
                                    "promo": 0,
                                    "created_at": "2018-12-16 22:37:28",
                                    "updated_at": "2018-12-16 22:37:28",
                                    "room_type": {
                                        "id": 1,
                                        "type": "普通房",
                                        "created_at": "0000-00-00 00:00:00",
                                        "updated_at": "0000-00-00 00:00:00"
                                    }
                                },
                                {
                                    "id": 24,
                                    "hotel_id": 41,
                                    "room_type_id": 2,
                                    "ppl_limit": 4,
                                    "price": 2000,
                                    "qty": 50,
                                    "availability": 1,
                                    "promo": 1,
                                    "created_at": "2018-12-16 22:37:43",
                                    "updated_at": "2018-12-16 22:37:43",
                                    "room_type": {
                                        "id": 2,
                                        "type": "高級房",
                                        "created_at": "0000-00-00 00:00:00",
                                        "updated_at": "0000-00-00 00:00:00"
                                    }
                                }
                            ]
                        }
                    }
                }
            }
        }
    }

   */
  
  
  
  //Searching hotel by postdata
  app.post( "/hotel/search/normal", async (req, res) => {
      
    console.log('SEARCHING.......');

    const criteria = {};
    
    if(typeof req.body.offset !== 'undefined'){
        criteria.offset = parseInt(req.body.offset); 
    } else { criteria.offset = 0; }
    if(typeof req.body.limit !== 'undefined'){
        criteria.limit = parseInt(req.body.limit); 
    } else { criteria.limit = 30; }
    
//    const criteria = { 
//        offset:0,
//        limit:100
//    };
    
    const query = {};
    query.soft_delete = {
        [Op.eq]: '0'
    };
    
    if(typeof req.body.name !== 'undefined'){
        query.name = {
            [Op.like]: '%'+req.body.name+'%'
        };
    }
    
    if(typeof req.body.category_id !== 'undefined'){
        query.category_id = {
            [Op.in]: req.body.category_id.split(",")
        };
    }
    
    if(typeof req.body.star !== 'undefined'){
        query.star = {
            [Op.eq]: req.body.star
        };
    }
    
    /******** Include joining hotel room & tag table ********/
        criteria.where = query; //The basic where condition on main model - Hotel

        //Include first model-Hotel_room by hotel<->hotel_room relationship
        const include = {model: db.hotel_room}; //define model
        const subCriteria = {};//define a empty where object

        if(typeof req.body.room_type !== 'undefined'){
            subCriteria.room_type_id =  req.body.room_type;
        }
        if(typeof req.body.ppl_limit !== 'undefined'){
            subCriteria.ppl_limit = {[Op.gte]: req.body.ppl_limit};
        }
        if(typeof req.body.price_low !== 'undefined'){
            subCriteria.price = {
                [Op.gte]: req.body.price_low,
                [Op.lte]: req.body.price_up
            };
        }
        
        if(Object.keys(subCriteria).length !== 0){
            include.where = subCriteria;
        }
        
        //Include second model-Tags through model post_tag
        const include_2 = {model: db.tags};
        const subCriteria_2 = {};//define a empty where object

        if(typeof req.body.tag_id !== 'undefined'){
            subCriteria_2.id =  {  [Op.in]: req.body.tag_id.split(",") };
            include_2.where = subCriteria_2;
        }
        
        
        //Merge both of the include object into an single array
        criteria.include = [include,include_2];
        console.log(include);
        
    /******** End of joining hotel room & tag ********/
    
    
    //criteria.attributes = {exclude: ['body']}; //Do not display body field
    criteria.attributes = ['id'];
    criteria.order =[['id', 'ASC']];
    console.log(criteria);
    
    /* Example of a criteria model based on the association of four tables
        {   
            offset: 0,
            limit: 100,
            where:{ 
                soft_delete: { [Symbol(eq)]: '0' },
                star: { [Symbol(eq)]: '5' } 
            },
            include:[ 
                { 
                    model: hotel_room, 
                    where: { 
                        room_type_id: '3',
                        ppl_limit: { 
                                [Symbol(gte)]: '1' 
                        },
                        price: { 
                            [Symbol(gte)]: '100', 
                            [Symbol(lte)]: '2000' 
                        } 
                    }
                },
                {   
                    model: tags, 
                    where: {
                        id : '5'
                    } 
                } 
            ],
            attributes: { exclude: [ 'body' ] },
            order: [ 
                [ 'id', 'ASC' ] 
            ]
        }
    */
    
    //Execute the query
        //    db.hotel.findAll(criteria).then(result => {
        //       if(result !== null){
        //          res.json({
        //            result: 'success' , 
        //            total: result.length , 
        //            offset: offset,
        //            limit: limit,
        //            data: result 
        //          });
        //       } else {
        //          res.json({ result: 'error', message: 'No data found.' });
        //       }
        //    }).catch(err => {
        //        console.log(err);
        //    });
        
        const hotel_result = await db.hotel.findAll(criteria);   //The final result basic on no room searching 
        
        const all_hotels = [];
        const all_rooms = [];
        hotel_result.forEach(function(element) {
            all_hotels.push(element.id);
            if(Object.keys(element.hotel_rooms).length !== 0){
                element.hotel_rooms.forEach(function(e2) {
                    all_rooms.push(e2.id);
                });
            }
        });
        
        //console.log(all_hotels);
        //console.log(all_rooms);
        
        const valid_hotel = [];
        if(typeof req.body.end !== 'undefined'){
            
            const current_start = current.create().format('Y-m-d');
            if(typeof req.body.start == 'undefined'){
                var start = current_start.split("-");
            } else {
                var start = req.body.start.split("-");
            }
            
            var end = req.body.end.split("-");
            var dates = getDates(new Date(parseInt(start[0]),parseInt(start[1]),parseInt(start[2])), new Date(parseInt(end[0]),parseInt(end[1]),parseInt(end[2])));                                                                                                           
            const valid_room = [];

            //all_rooms.forEach(function(room) {
            for (const room of all_rooms) {
                //dates.forEach(function(date) {
                for (const date of dates) {
                    //validateBooking(room,formatDate(date));
                    //console.log(room);
                    //console.log(formatDate(date));
                    
                    const rooms = await db.hotel_room.findById(room);
                    //console.log("ROOM "+rooms.qty);

                    const booking = await db.booking.findAndCountAll({
                        where: {
                           hotel_room_id: {
                             [Op.eq]: room
                           },
                           in_date: {
                             [Op.lte]: formatDate(date)
                           },
                           out_date: {
                             [Op.gt]: formatDate(date)
                           }
                        }
                     });

                    //console.log("COUNT "+booking.count);
                    
                    if(booking.count >= rooms.qty){
                        console.log("Full booking...");
                    } else {
                        valid_room.push(room);
                    }
                };
            };
            
            const unique = (value, index, self) => {
                return self.indexOf(value) === index;
            }

            const valid_unique_room = valid_room.filter(unique)

            //console.log(valid_room);
            console.log(valid_unique_room);
            
            //const hotel_result = await db.hotel.findAll(criteria);
            
            
            for (const rm of valid_unique_room) {
                const rms = await db.hotel_room.findById(rm);
                //console.log(rms.hotel_id);
                valid_hotel.push(rms.hotel_id);
            }

            //console.log(valid_hotel);
        }
        
        $r_hotel = [];
        if (typeof valid_hotel !== 'undefined' && valid_hotel.length > 0) {
            $r_hotel = valid_hotel;
        } else {
            $r_hotel = all_hotels;
        }
        
        console.log("------------");
        console.log($r_hotel);
        
        const f_crit = {};
        f_crit.where = {
            id: {
                [Op.in]: $r_hotel
            }
        };
        f_crit.order = [ [ 'id', 'ASC' ] ];
        
        const in1 = {model: db.hotel_room}
        const in2 = {model: db.tags}
        f_crit.include = [in1,in2];
        
        f_crit.attributes = {exclude: ['body']};
            
        const final_result = await db.hotel.findAll(f_crit);
        
        
        res.json({
            result: 'success' , 
            total: final_result.length , 
            offset: req.body.offset,
            limit: req.body.limit,
            data: final_result 
        });
        
        //console.log('result',hotel_result);

  });
  
  /**
   * @swagger
   * 
    "/hotel/search/normal": {
        "post": {
            "security": [
                {
                    "APIKeyHeader": []
                }
            ],
            "summary": "HotelsDB searching engine",
            "description": "Normal and basic searching",
            "tags" : ["hotel"],
            "parameters": [
                {
                    "description": "limit number of records",
                    "type": "integer",
                    "name": "limit",
                    "in": "formData"
                },
                {
                    "description": "offset number of records",
                    "type": "integer",
                    "name": "offset",
                    "in": "formData"
                },
                {
                    "description": "hotel name",
                    "type": "string",
                    "name": "name",
                    "in": "formData"
                },
                {
                    "description": "category ID",
                    "type": "string",
                    "name": "category_id",
                    "in": "formData"
                },
                {
                    "description": "star of hotel",
                    "type": "integer",
                    "name": "star",
                    "in": "formData"
                },
                {
                    "description": "room type ID of hotel",
                    "type": "integer",
                    "name": "room_type",
                    "in": "formData"
                },
                {
                    "description": "people limit number of a room of a hotel",
                    "type": "integer",
                    "name": "ppl_limit",
                    "in": "formData"
                },
                {
                    "description": "the expected lower price of room",
                    "type": "string",
                    "name": "price_low",
                    "in": "formData"
                },
                {
                    "description": "the expected upper price of room",
                    "type": "string",
                    "name": "price_up",
                    "in": "formData"
                },
                {
                    "description": "tag id of the hotel",
                    "type": "integer",
                    "name": "tag_id",
                    "in": "formData"
                },
                {
                    "description": "the expected time to start",
                    "type": "string",
                    "name": "start",
                    "in": "formData"
                },
                {
                    "description": "the expected time to end",
                    "type": "string",
                    "name": "end",
                    "in": "formData"
                }
            ],
            "responses": {
                "200": {
                    "description": "Success output",
                    "examples" : {
                        "application/json": {
                            "result": "success",
                            "total": 1,
                            "data": [
                                {
                                    "id": 40,
                                    "name": "The Peninsula Hong Kong",
                                    "star": 5,
                                    "phone": 23698741,
                                    "category_id": 9,
                                    "default_image": "19912",
                                    "image": "1544966763.jpg",
                                    "coordi_x": "          22.295077          ",
                                    "coordi_y": "          114.171799          ",
                                    "new": 0,
                                    "handling_price": 25,
                                    "created_at": "2018-12-16 20:00:00",
                                    "updated_at": "2019-01-08 22:37:52",
                                    "soft_delete": 0,
                                    "hotel_rooms": [
                                        {
                                            "id": 20,
                                            "hotel_id": 40,
                                            "room_type_id": 1,
                                            "ppl_limit": 2,
                                            "price": 500,
                                            "qty": 50,
                                            "availability": 1,
                                            "promo": 0,
                                            "created_at": "2018-12-16 22:36:07",
                                            "updated_at": "2018-12-16 22:36:07"
                                        },
                                        {
                                            "id": 21,
                                            "hotel_id": 40,
                                            "room_type_id": 2,
                                            "ppl_limit": 3,
                                            "price": 1500,
                                            "qty": 20,
                                            "availability": 1,
                                            "promo": 1,
                                            "created_at": "2018-12-16 22:36:20",
                                            "updated_at": "2018-12-16 22:36:20"
                                        },
                                        {
                                            "id": 22,
                                            "hotel_id": 40,
                                            "room_type_id": 3,
                                            "ppl_limit": 5,
                                            "price": 3000,
                                            "qty": 3,
                                            "availability": 1,
                                            "promo": 0,
                                            "created_at": "2018-12-16 22:36:46",
                                            "updated_at": "2018-12-16 22:36:46"
                                        }
                                    ],
                                    "tags": [
                                        {
                                            "id": 3,
                                            "name": "best hotel",
                                            "created_at": "2018-11-06 06:34:34",
                                            "updated_at": "2018-11-06 06:34:34",
                                            "post_tag": {
                                                "id": 406,
                                                "hotel_id": 40,
                                                "tag_id": 3,
                                                "created_at": "2019-01-08 22:37:52",
                                                "updated_at": "2019-01-08 22:37:52"
                                            }
                                        },
                                        {
                                            "id": 5,
                                            "name": "enjoy",
                                            "created_at": "2018-11-18 17:17:35",
                                            "updated_at": "2018-11-18 17:17:35",
                                            "post_tag": {
                                                "id": 407,
                                                "hotel_id": 40,
                                                "tag_id": 5,
                                                "created_at": "2019-01-08 22:37:52",
                                                "updated_at": "2019-01-08 22:37:52"
                                            }
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                }
            }
        }
    }
   
  
    */
  
  
  
  app.get( "/hotel/booking/validate", async (req, res) => {
      
    if ( (!req.query.hotel_id) || (!req.query.start) || (!req.query.end) ) {
        res.json({
            result: "fail" , 
            message: "Missing required parameters."
        });
    }
    
    hotel_id = parseInt(req.query.hotel_id);
    start = req.query.start;
    end = req.query.end;
    
    const rooms = await db.hotel_room.findAll({
            where: {
              hotel_id: hotel_id
            },
            attributes : ['id','qty']
        });
        
    const current_start = current.create().format('Y-m-d');
    var start = req.query.start.split("-");
    var end = req.query.end.split("-");
    var dates = getDates(new Date(parseInt(start[0]),parseInt(start[1]),parseInt(start[2])), new Date(parseInt(end[0]),parseInt(end[1]),parseInt(end[2])));     
        
    const valid_room = [];
    const invalid_room = [];
    var availabitiy = false;
    
    for (const date of dates) {
        for (const room of rooms) {
            console.log(room.id);

            const booking = await db.booking.findAndCountAll({
                where: {
                   hotel_room_id: {
                     [Op.eq]: room.id
                   },
                   in_date: {
                     [Op.lte]: formatDate(date)
                   },
                   out_date: {
                     [Op.gt]: formatDate(date)
                   }
                }
             });

            console.log("COUNT "+booking.count);

            if(booking.count >= room.qty){
                invalid_room.push({date:formatDate(date),room:room.id,qty:room.qty,count:booking.count});
            } else {
                valid_room.push({date:formatDate(date),room:room.id,qty:room.qty,count:booking.count});
            }
        }
    }

    const unique = (value, index, self) => {
        return self.indexOf(value) === index;
    };

    const invalid = invalid_room;
    const valid = valid_room;
    
    if(valid.length != 0){
        availabitiy = true;
    }
    
    res.json({
        start: req.query.start,
        end: req.query.end,
        hotel_id: hotel_id,
        rooms: rooms,
        valid_room: valid,
        invalid_room: invalid,
        availabitiy: availabitiy
    });
    
      
  });
  
  /**
   * @swagger
   
    "/hotel/booking/validate": {
        "get": {
            "security": [
                {
                    "APIKeyHeader": []
                }
            ],
            "summary": "Validate the booking status of a hotel",
            "description": "This API return all rooms and its booking status of a hotel",
            "tags" : ["hotel"],
            "parameters": [
                {
                    "description": "id of hotel",
                    "required": true,
                    "type": "integer",
                    "name": "hotel_id",
                    "in": "query"
                },
                {
                    "description": "the expected time to start",
                    "required": true,
                    "type": "string",
                    "name": "start",
                    "in": "query"
                },
                {
                    "description": "the expected time to end",
                    "required": true,
                    "type": "string",
                    "name": "end",
                    "in": "query"
                }
            ],
            "responses": {
                "200": {
                    "description": "Success output",
                    "examples" : {
                        "application/json": {
                            "start": "2020-04-23",
                            "end": "2020-04-24",
                            "hotel_id": 40,
                            "rooms": [
                                {
                                    "id": 20,
                                    "qty": 50
                                },
                                {
                                    "id": 21,
                                    "qty": 20
                                },
                                {
                                    "id": 22,
                                    "qty": 3
                                }
                            ],
                            "valid_room": [
                                {
                                    "date": "2020-04-23",
                                    "room": 20,
                                    "qty": 50,
                                    "count": 0
                                },
                                {
                                    "date": "2020-04-23",
                                    "room": 21,
                                    "qty": 20,
                                    "count": 0
                                },
                                {
                                    "date": "2020-04-23",
                                    "room": 22,
                                    "qty": 3,
                                    "count": 0
                                },
                                {
                                    "date": "2020-04-24",
                                    "room": 20,
                                    "qty": 50,
                                    "count": 0
                                },
                                {
                                    "date": "2020-04-24",
                                    "room": 21,
                                    "qty": 20,
                                    "count": 0
                                },
                                {
                                    "date": "2020-04-24",
                                    "room": 22,
                                    "qty": 3,
                                    "count": 0
                                }
                            ],
                            "invalid_room": [],
                            "availabitiy": true
                        }
                    }
                }
            }
        }
    }
    
   */
  
  
    app.get( "/hotel/booking/status", async (req, res) => {
        
        if ( (!req.query.hotel_id) || (!req.query.start) || (!req.query.end) ) {
            res.json({
                result: "fail" , 
                message: "Missing required parameters."
            });
        }
        
        criteria = {};
        criteria.where = {
            hotel_id: {
              [Op.eq]: req.query.hotel_id
            },
            out_date: {
              [Op.gt]: req.query.start
            },
            in_date: {
              [Op.lte]: req.query.end
            }
        };
        
        const in1 = {model: db.hotel_room};
        in1.include = {model: db.room_type};
        
        const in2 = {model: db.payment_method};
        criteria.include = [in1,in2];
        
        const booking = await db.booking.findAll(criteria);
        

        res.json({
            result: 'success' , 
            start: req.query.start,
            end: req.query.end,
            hotel_id: req.query.hotel_id,
            total: booking.length,
            booking: booking
        });
        
    });
    
    /**
     * @swagger
    
    "/hotel/booking/status": {
        "get": {
            "security": [
                {
                    "APIKeyHeader": []
                }
            ],
            "summary": "List out all bookings status of a hotel by hotel ID",
            "description": "List out all bookings status of a hotel by hotel ID",
            "tags" : ["hotel"],
            "parameters": [
                {
                    "description": "id of hotel",
                    "required": true,
                    "type": "integer",
                    "name": "hotel_id",
                    "in": "query"
                },
                {
                    "description": "the expected time to start",
                    "required": true,
                    "type": "string",
                    "name": "start",
                    "in": "query"
                },
                {
                    "description": "the expected time to end",
                    "required": true,
                    "type": "string",
                    "name": "end",
                    "in": "query"
                }
            ],
            "responses": {
                "200": {
                    "description": "Success output",
                    "examples" : {
                        "application/json": {
                            "result": "success",
                            "start": "2018-12-23",
                            "end": "2019-12-31",
                            "hotel_id": "40",
                            "total": 11,
                            "booking": [
                                {
                                    "id": 76,
                                    "user_id": 11,
                                    "hotel_id": 40,
                                    "hotel_room_id": 22,
                                    "people": 2,
                                    "in_date": "2018-12-27 00:00:00",
                                    "out_date": "2018-12-31 00:00:00",
                                    "book_date": "2018-12-27 21:50:59",
                                    "total_price": 12025,
                                    "payment_method_id": 1,
                                    "approved": 1,
                                    "status": 1,
                                    "created_at": "2018-12-27 21:50:59",
                                    "updated_at": "2018-12-27 21:50:59",
                                    "hotel_room": {
                                        "id": 22,
                                        "hotel_id": 40,
                                        "room_type_id": 3,
                                        "ppl_limit": 5,
                                        "price": 3000,
                                        "qty": 3,
                                        "availability": 1,
                                        "promo": 0,
                                        "created_at": "2018-12-16 22:36:46",
                                        "updated_at": "2018-12-16 22:36:46",
                                        "room_type": {
                                            "id": 3,
                                            "type": "總統套房",
                                            "created_at": "0000-00-00 00:00:00",
                                            "updated_at": "0000-00-00 00:00:00"
                                        }
                                    },
                                    "payment_method": {
                                        "id": 1,
                                        "type": "VISA"
                                    }
                                }
                            ]
                        }
                    }
                }
            }
        }
    }
    */
    
    
    
    app.get( "/hotel/booking/:user_id", async (req, res) => {
    
        //console.log(req.query.hotel_id);
        criteria = {};
        cwhere = {
            user_id: {
              [Op.eq]: req.params.user_id
            }
        };
        
        if(req.query.hotel_id){
            cwhere.hotel_id = {
              [Op.eq]: req.query.hotel_id
            };
        }
        if(req.query.start){
            cwhere.in_date = {
              [Op.lte]: req.query.end
            };
        }
        if(req.query.end){
            cwhere.out_date = {
              [Op.gt]: req.query.start
            };
        }
        
        criteria.where = cwhere;
        
        const in1 = {model: db.hotel_room};
        in1.include = {model: db.room_type};
        
        const in2 = {model: db.payment_method};
        const in3 = {model: db.hotel , attributes : ['id', 'name']};
        criteria.include = [in1,in2,in3];
        
        const booking = await db.booking.findAll(criteria);
        

        res.json({
            result: 'success' , 
            start: req.query.start,
            end: req.query.end,
            hotel_id: req.query.hotel_id,
            total: booking.length,
            booking: booking
        });
        
    });
    
    /**
     * @swagger

    "/hotel/booking/{user_id}": {
        "get": {
            "security": [
                {
                    "APIKeyHeader": []
                }
            ],
            "summary": "List out all bookings status of a user by user ID",
            "description": "List out all bookings status of a user by user ID",
            "tags" : ["hotel"],
            "parameters": [
                {
                    "required": true,
                    "description": "id of user",
                    "type": "integer",
                    "name": "user_id",
                    "in": "path"
                },
                {
                    "description": "id of hotel",
                    "type": "integer",
                    "name": "hotel_id",
                    "in": "query"
                },
                {
                    "description": "the expected time to start",
                    "type": "string",
                    "name": "start",
                    "in": "query"
                },
                {
                    "description": "the expected time to end",
                    "type": "string",
                    "name": "end",
                    "in": "query"
                }
            ],
            "responses": {
                "200": {
                    "description": "Success output",
                    "examples" : {
                        "application/json": {
                            "result": "success",
                            "hotel_id": "40",
                            "total": 1,
                            "booking": [
                                {
                                    "id": 76,
                                    "user_id": 11,
                                    "hotel_id": 40,
                                    "hotel_room_id": 22,
                                    "people": 2,
                                    "in_date": "2018-12-27 00:00:00",
                                    "out_date": "2018-12-31 00:00:00",
                                    "book_date": "2018-12-27 21:50:59",
                                    "total_price": 12025,
                                    "payment_method_id": 1,
                                    "approved": 1,
                                    "status": 1,
                                    "created_at": "2018-12-27 21:50:59",
                                    "updated_at": "2018-12-27 21:50:59",
                                    "hotel_room": {
                                        "id": 22,
                                        "hotel_id": 40,
                                        "room_type_id": 3,
                                        "ppl_limit": 5,
                                        "price": 3000,
                                        "qty": 3,
                                        "availability": 1,
                                        "promo": 0,
                                        "created_at": "2018-12-16 22:36:46",
                                        "updated_at": "2018-12-16 22:36:46",
                                        "room_type": {
                                            "id": 3,
                                            "type": "總統套房",
                                            "created_at": "0000-00-00 00:00:00",
                                            "updated_at": "0000-00-00 00:00:00"
                                        }
                                    },
                                    "payment_method": {
                                        "id": 1,
                                        "type": "VISA"
                                    },
                                    "hotel": {
                                        "id": 40,
                                        "name": "The Peninsula Hong Kong"
                                    }
                                }
                            ]
                        }
                    }
                }
            }
        }
    }
    
    */
    
    
    
    app.get( "/hotel/booking/details/:book_id", async (req, res) => {
        
        criteria = {};
        
        criteria.where = {
            id: {
              [Op.eq]: req.params.book_id
            }
        };
        
        const room = {model: db.hotel_room};
        room.include = {model: db.room_type};
        
        const user = {model: db.users};
        user.attributes = {exclude: ['password','api_key']};
        
        const hotel = {model: db.hotel};
        hotel.attributes = {exclude: ['body']};
        
        const method = {model: db.payment_method};
        const payment = {model: db.booking_payment};
        const guest = {model: db.booking_guest};
        
        criteria.include = [room,user,hotel,method,payment,guest];
        
        console.log(criteria);
        
//      Raw format of criteria object
//        {   
//            where: { 
//              id: { [Symbol(eq)]: '100' } 
//            },
//            include:
//                [ 
//                    { model: hotel_room, include: {model: db.room_type} },
//                    { model: payment_method },
//                    { model: users, attributes: {exclude: ['password','api_key']} },
//                    { model: hotel, attributes: {exclude: ['body']} },
//                    { model: booking_payment },
//                    { model: booking_guest } 
//                ] 
//        }
     
        const details = await db.booking.find(criteria);
        
        res.json({
            result: 'success',
            bookng_id: req.params.book_id,
            details: details
        });
    });
    
    /**
     * @swagger
     
    "/hotel/booking/details/{book_id}": {
        "get": {
            "security": [
                {
                    "APIKeyHeader": []
                }
            ],
            "summary": "List out a booking details by booking ID",
            "description": "List out a booking details by booking ID",
            "tags" : ["hotel"],
            "parameters": [
                {
                    "required": true,
                    "description": "id of booking object",
                    "type": "integer",
                    "name": "book_id",
                    "in": "path"
                }
            ],
            "responses": {
                "200": {
                    "description": "Success output",
                    "examples" : {
                        "application/json": {
                            "result": "success",
                            "bookng_id": "76",
                            "details": {
                                "id": 76,
                                "user_id": 11,
                                "hotel_id": 40,
                                "hotel_room_id": 22,
                                "people": 2,
                                "in_date": "2018-12-27 00:00:00",
                                "out_date": "2018-12-31 00:00:00",
                                "book_date": "2018-12-27 21:50:59",
                                "total_price": 12025,
                                "payment_method_id": 1,
                                "approved": 1,
                                "status": 1,
                                "created_at": "2018-12-27 21:50:59",
                                "updated_at": "2018-12-27 21:50:59",
                                "hotel_room": {
                                    "id": 22,
                                    "hotel_id": 40,
                                    "room_type_id": 3,
                                    "ppl_limit": 5,
                                    "price": 3000,
                                    "qty": 3,
                                    "availability": 1,
                                    "promo": 0,
                                    "created_at": "2018-12-16 22:36:46",
                                    "updated_at": "2018-12-16 22:36:46",
                                    "room_type": {
                                        "id": 3,
                                        "type": "總統套房",
                                        "created_at": "0000-00-00 00:00:00",
                                        "updated_at": "0000-00-00 00:00:00"
                                    }
                                },
                                "user": {
                                    "id": 11,
                                    "name": "dada",
                                    "email": "dada@gmail.com",
                                    "phone": "98765432",
                                    "gender": "F",
                                    "role": "user",
                                    "profile_image": null,
                                    "profile_banner": null,
                                    "profile_desc": null,
                                    "created_at": "2018-12-26 21:00:21",
                                    "updated_at": "2018-12-28 20:34:12"
                                },
                                "hotel": {
                                    "id": 40,
                                    "name": "The Peninsula Hong Kong",
                                    "star": 5,
                                    "phone": 23698741,
                                    "category_id": 9,
                                    "default_image": "19912",
                                    "image": "1544966763.jpg",
                                    "coordi_x": "          22.295077          ",
                                    "coordi_y": "          114.171799          ",
                                    "new": 0,
                                    "handling_price": 25,
                                    "created_at": "2018-12-16 20:00:00",
                                    "updated_at": "2019-01-08 22:37:52",
                                    "soft_delete": 0
                                },
                                "payment_method": {
                                    "id": 1,
                                    "type": "VISA"
                                },
                                "booking_payment": {
                                    "id": 56,
                                    "booking_id": 76,
                                    "user_id": 11,
                                    "single_price": 3000,
                                    "handling_price": 25,
                                    "total_price": 12025,
                                    "payment_method_id": 1,
                                    "card_number": 2147483647,
                                    "expired_date": "2020-10",
                                    "security_number": 987,
                                    "status": 1
                                },
                                "booking_guests": [
                                    {
                                        "id": 47,
                                        "booking_id": 76,
                                        "name": "fufu",
                                        "phone": 98765432,
                                        "gender": "F",
                                        "email": "fu@gmail.com",
                                        "created_at": "2018-12-27 21:50:59",
                                        "updated_at": "2018-12-27 21:50:59"
                                    },
                                    {
                                        "id": 48,
                                        "booking_id": 76,
                                        "name": "ken",
                                        "phone": 67578441,
                                        "gender": "M",
                                        "email": "ken@gmail.com",
                                        "created_at": "2018-12-27 21:50:59",
                                        "updated_at": "2018-12-27 21:50:59"
                                    }
                                ]
                            }
                        }
                    }
                }
            }
        }
    }
    */
    
    
    
    app.post( "/hotel/booking/create", async(req, res) => {
        
        create_obj = {
            user_id : req.body.user_id,
            hotel_id : req.body.hotel_id,
            hotel_room_id: req.body.hotel_room_id,
            people: req.body.people,
            in_date: req.body.in_date,
            out_date: req.body.out_date,
            book_date: req.body.book_date,
            total_price: req.body.total_price,
            payment_method_id: req.body.payment_method_id,
            approved: 1,
            status: 1,
            created_at: current.create().format('Y-m-d H:M:S'),
            updated_at: current.create().format('Y-m-d H:M:S')
        };
        
        const booking = await db.booking.create(create_obj);
        
        res.json({
            result: 'success',
            booking: booking
        });
    
    });
    
    /**
     * @swagger
    
    "/hotel/booking/create": {
        "post": {
            "security": [
                {
                    "APIKeyHeader": []
                }
            ],
            "summary": "Create a new hotel booking",
            "description": "Create a new hotel booking",
            "tags" : ["hotel"],
            "parameters": [
                {
                    "description": "id of user",
                    "type": "integer",
                    "required" : true,
                    "name": "user_id",
                    "in": "formData"
                },
                {
                    "description": "id of hotel",
                    "type": "integer",
                    "required" : true,
                    "name": "hotel_id",
                    "in": "formData"
                },
                {
                    "description": "id of hotel room",
                    "type": "integer",
                    "required" : true,
                    "name": "hotel_room_id",
                    "in": "formData"
                },
                {
                    "description": "number of people in a booking",
                    "type": "integer",
                    "required" : true,
                    "name": "people",
                    "in": "formData"
                },
                {
                    "description": "start date of a booking",
                    "type": "string",
                    "required" : true,
                    "name": "in_date",
                    "in": "formData"
                },
                {
                    "description": "end date of a booking",
                    "type": "string",
                    "required" : true,
                    "name": "out_date",
                    "in": "formData"
                },
                {
                    "description": "booking date of a booking",
                    "type": "string",
                    "required" : true,
                    "name": "book_date",
                    "in": "formData"
                },
                {
                    "description": "total price of the booking",
                    "type": "number",
                    "required" : true,
                    "name": "total_price",
                    "in": "formData"
                },
                {
                    "description": "id of payment method",
                    "type": "integer",
                    "required" : true,
                    "name": "payment_method_id",
                    "in": "formData"
                }
            ],
            "responses": {
                "200": {
                    "description": "Success output",
                    "examples" : {
                        "application/json": {
                            "result": "success",
                            "booking": {
                              "id": 106,
                              "user_id": "11",
                              "hotel_id": "40",
                              "hotel_room_id": "21",
                              "people": "1",
                              "in_date": "2020-04-24",
                              "out_date": "2020-04-26",
                              "book_date": "2020-04-24",
                              "total_price": "1001",
                              "payment_method_id": "1",
                              "approved": 1,
                              "status": 1,
                              "created_at": "2020-04-24 12:51:06",
                              "updated_at": "2020-04-24 12:51:06"
                            }
                        }
                    }
                }
            }
        }
    }
    
     */
    
    
    app.post( "/hotel/booking/payment/:book_id", async(req, res) => {
        
        const booking = await db.booking.findById(req.params.book_id);
        const hotel = await db.hotel.findById(booking.hotel_id);
        const hotel_room = await db.hotel_room.findById(booking.hotel_room_id);
        
        create_obj = {
            booking_id : req.params.book_id,
            user_id : booking.user_id,
            single_price : hotel_room.price,
            handling_price : hotel.handling_price,
            total_price: booking.total_price,
            payment_method_id: req.body.payment_method_id,
            created_at: current.create().format('Y-m-d H:M:S'),
            updated_at: current.create().format('Y-m-d H:M:S')
        };
        
        if(typeof req.body.payment_method_id !== 'undefined'){
            if(req.body.payment_method_id == 5){
                create_obj.status = 0;
            } else {
                create_obj.status = 1;
                create_obj.card_number = req.body.card_number;
                create_obj.expired_date = req.body.expired_date;
                create_obj.security_number = req.body.security_number;
            }
        }
        
        const payment = await db.booking_payment.create(create_obj);
        
        res.json({
            result: 'success',
            book_id: req.params.book_id,
            create_obj: create_obj,
            payment: payment
        });
        
    });
    
    /**
     * @swagger
    
    "/hotel/booking/payment/{book_id}": {
        "post": {
            "security": [
                {
                    "APIKeyHeader": []
                }
            ],
            "summary": "Create a new payment object for a booking",
            "description": "Create a new payment object for a booking",
            "tags" : ["hotel"],
            "parameters": [
                {
                    "description": "id of a booking object",
                    "type": "integer",
                    "required" : true,
                    "name": "book_id",
                    "in": "path"
                },
                {
                    "description": "id of a payment method",
                    "type": "integer",
                    "required" : true,
                    "name": "payment_method_id",
                    "in": "formData"
                }
            ],
            "responses": {
                "200": {
                    "description": "Success output",
                    "examples" : {
                        "application/json": {
                            "result": "success",
                            "book_id": "106",
                            "create_obj": {
                              "booking_id": "106",
                              "user_id": 11,
                              "single_price": 1500,
                              "handling_price": 25,
                              "total_price": 1001,
                              "payment_method_id": "1",
                              "created_at": "2020-04-24 14:52:43",
                              "updated_at": "2020-04-24 14:52:43",
                              "status": 1
                            },
                            "payment": {
                              "id": 108,
                              "booking_id": "106",
                              "user_id": 11,
                              "single_price": 1500,
                              "handling_price": 25,
                              "total_price": 1001,
                              "payment_method_id": "1",
                              "status": 1
                            }
                        }
                    }
                }
            }
        }
    }
    
    */
    
    
    app.post( "/hotel/booking/guest/:book_id", async(req, res) => {
        
        const guests = JSON.parse(req.body.guest_json);
        /*JSON example -
         * 
            { "guest":
                [
                    {
                        "name": "KENIP",
                        "phone": "12345678",
                        "gender": "M",
                        "email" : "test@gmail.com"
                    },
                    {
                        "name": "KENCHAN",
                        "phone": "63269874",
                        "gender": "F",
                        "email" : "test2@gmail.com"
                    }
                ]
            }
         * 
         */
        
        var created = [];
        for (const guest of guests.guest) {
            const gt = await db.booking_guest.create(
                {
                    booking_id : req.params.book_id,
                    name : guest.name,
                    phone : guest.phone,
                    gender : guest.gender,
                    email : guest.email,
                    created_at: current.create().format('Y-m-d H:M:S'),
                    updated_at: current.create().format('Y-m-d H:M:S')
                }
            );
    
            created.push(gt);
        };

        res.json({
            result: 'success',
            book_id: req.params.book_id,
            guest_json: guests,
            created: created
        });
        
    });
    
    /**
     * @swagger
    
    "/hotel/booking/guest/{book_id}": {
        "post": {
            "security": [
                {
                    "APIKeyHeader": []
                }
            ],
            "summary": "Create a new payment object for a booking",
            "description": "Create a new payment object for a booking",
            "tags" : ["hotel"],
            "parameters": [
                {
                    "description": "id of a booking object",
                    "type": "integer",
                    "required" : true,
                    "name": "book_id",
                    "in": "path"
                },
                {
                    "description": "JSON string of guest infomation of a booking",
                    "type": "string",
                    "required" : true,
                    "name": "guest_json",
                    "in": "formData"
                }
            ],
            "responses": {
                "EXAMPLE": {
                    "description": "Example json string of guest details",
                    "examples" : {
                        "application/json": {
                            "guest": [
                              {
                                "name": "KENIP",
                                "phone": "12345678",
                                "gender": "M",
                                "email": "test@gmail.com"
                              },
                              {
                                "name": "KENCHAN",
                                "phone": "63269874",
                                "gender": "F",
                                "email": "test2@gmail.com"
                              }
                            ]
                        }
                    }
                },
                "200": {
                    "description": "The example json object format of guest_json",
                    "examples" : {
                        "application/json": {
                            "result": "success",
                            "book_id": "106",
                            "guest_json": {
                              "guest": [
                                {
                                  "name": "KENIP",
                                  "phone": "12345678",
                                  "gender": "M",
                                  "email": "test@gmail.com"
                                },
                                {
                                  "name": "KENCHAN",
                                  "phone": "63269874",
                                  "gender": "F",
                                  "email": "test2@gmail.com"
                                }
                              ]
                            },
                            "created": [
                              {
                                "id": 109,
                                "booking_id": "106",
                                "name": "KENIP",
                                "phone": "12345678",
                                "gender": "M",
                                "email": "test@gmail.com",
                                "created_at": "2020-04-24 15:14:18",
                                "updated_at": "2020-04-24 15:14:18"
                              },
                              {
                                "id": 110,
                                "booking_id": "106",
                                "name": "KENCHAN",
                                "phone": "63269874",
                                "gender": "F",
                                "email": "test2@gmail.com",
                                "created_at": "2020-04-24 15:14:18",
                                "updated_at": "2020-04-24 15:14:18"
                              }
                            ]
                        }
                    }
                }
            }
        }
    }
    
    */
    
    
    app.put( "/hotel/trip_match/:tripid/:bookid", (req, res) => {
        var bookid = req.params.bookid;
        if(bookid == 0){
            bookid = null;
        }
        db.trip.update({
            booking_id: bookid
          },
          {
            where: {
              id: req.params.tripid
            }
          }).then( (result) => {
              res.json({ result: 'success' });
          }).catch(err => {
              res.json({ result: 'error' });
          });
    });
    
    /**
     * @swagger
    
    "/hotel/trip_match/{tripid}/{bookid}": {
        "put": {
            "security": [
                {
                    "APIKeyHeader": []
                }
            ],
            "summary": "Match a trip object and booking object",
            "description": "Match a trip object and booking object",
            "tags" : ["hotel"],
            "parameters": [
                {
                    "description": "id of a trip object",
                    "type": "integer",
                    "required" : true,
                    "name": "tripid",
                    "in": "path"
                },
               {
                    "description": "id of a booking object",
                    "type": "integer",
                    "required" : true,
                    "name": "bookid",
                    "in": "path"
                }
            ],
            "responses": {
                "200": {
                    "description": "The example json object format of guest_json",
                    "examples" : {
                        "application/json": {
                            "result": "success"
                        }
                    }
                }
            }
        }
    }
    
    */
    
    
    var getDates = function(startDate, endDate) {
        var dates = [],
            currentDate = startDate,
            addDays = function(days) {
              var date = new Date(this.valueOf());
              date.setDate(date.getDate() + days);
              return date;
            };
        while (currentDate <= endDate) {
          dates.push(currentDate);
          currentDate = addDays.call(currentDate, 1);
        }
        return dates;
    };

    function padding1(num, length) {
        for(var len = (num + "").length; len < length; len = num.length) {
            num = "0" + num;            
        }
        return num;
    }

    function formatDate(date) {
        var day = date.getDate();
        day =  padding1(day, 2);
        var month = date.getMonth();
        month =  padding1(month, 2);
        var year = date.getFullYear();

        return year+'-'+month+'-'+day;
    }
  
    function ApiFieldsValidation(params){
        var result = true;
        params.forEach(function(item, index, array){
          if (typeof item == 'undefined' || item == ''){
              result = false;
              return false;
          }
        });

        return result;
    }
  
};