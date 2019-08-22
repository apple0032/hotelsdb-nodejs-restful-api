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
  
  
  //Get a hotel by hotel_id
  app.get( "/hotel/:hotel_id", (req, res) => {
       db.hotel.findById(req.params.hotel_id).then( (result) => {
           if(result !== null){
              res.json(result);
           } else {
              res.json({ result: 'error', message: 'No data found.' });
           }
       }).catch(err => {
            console.log(err);
       });
    }
  );
  
  
  
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
  
  //Searching hotel by postdata
  app.post( "/hotel/search/normal", async (req, res) => {
      
    console.log('SEARCHING.......');

    const criteria = {};
    
    if(typeof req.body.offset !== 'undefined'){
        criteria.offset = parseInt(req.body.offset); 
    }
    if(typeof req.body.limit !== 'undefined'){
        criteria.limit = parseInt(req.body.limit); 
    }
    
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
            [Op.eq]: req.body.category_id
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
            subCriteria_2.id =  req.body.tag_id;
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