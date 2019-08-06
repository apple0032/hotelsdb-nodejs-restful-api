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
    offset = parseInt(req.body.offset);
    limit = parseInt(req.body.limit);
    if(isNaN(offset)){ offset = 0; }
    if(isNaN(limit)){ limit = 100; }
    
    const criteria = {
        offset:offset,
        limit:limit
    };
    
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
    
    
    criteria.attributes = {exclude: ['body']}; //Do not display body field
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
        
        const hotel_result = await db.hotel.findAll(criteria);
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
        
        console.log(all_hotels);
        console.log(all_rooms);
        
        if(typeof req.body.start !== 'undefined'){
            var start = req.body.start.split("-");
            var end = req.body.end.split("-");
            var dates = getDates(new Date(parseInt(start[0]),parseInt(start[1]),parseInt(start[2])), new Date(parseInt(end[0]),parseInt(end[1]),parseInt(end[2])));                                                                                                           

            all_rooms.forEach(function(room) {
                dates.forEach(function(date) {
                    validateBooking(room,formatDate(date));
                });
            });
        }
        
        res.json({
            result: 'success' , 
            total: hotel_result.length , 
            offset: offset,
            limit: limit,
            data: hotel_result 
        });
        //console.log('result',hotel_result);

  });
  
    async function validateBooking(hotel_room_id,book_date){
        
        const rooms = await db.hotel_room.findById(hotel_room_id);
        //console.log(rooms.qty);
//        
//        const booking = await db.booking.findAndCountAll({
//            where: {
//               id: {
//                 [Op.eq]: hotel_room_id
//               }
//            }
//         });
        
        console.log(hotel_room_id);
        console.log(book_date);
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