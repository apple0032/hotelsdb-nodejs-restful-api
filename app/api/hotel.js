
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
  

  
};