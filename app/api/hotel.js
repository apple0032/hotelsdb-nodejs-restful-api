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
  app.post( "/hotel/search/normal", (req, res) => {
      
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
    
    /**** Include joining hotel room table ****/
        criteria.where = query;

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
        criteria.include = [include];

        console.log(include);
    /**** End of joining hotel room ****/
    
    criteria.attributes = {exclude: ['body']}; //Do not display body field
    
    //Execute the query
    db.hotel.findAll(criteria).then(result => {
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
        
  });
  
  
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