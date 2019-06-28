const bcrypt = require('bcryptjs');

module.exports = (app, db , current) => {
  
  //Get all user data
  app.get( "/admin/users", (req, res) => {
      
      //const api_key = req.header('api_key');
      //console.log(api_key);
      //var valid = auth.check();
      
        db.users.findAll().then(result => {
           if(result != null){
              res.json({ result: 'success' , total: result.length , data: result });
           } else {
              res.json({ result: 'error', message: 'No data found.' });
           }
        }).catch(err => {
            console.log(err);
        });
    }
  );
  
  
  //Get user by user_id
  app.get( "/admin/users/:user_id", (req, res) => {
       db.users.findById(req.params.user_id).then( (result) => {
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
  
  
  //Delete user by use_id
   app.delete( "/admin/users/:user_id", (req, res) => {
       db.users.findById(req.params.user_id).then( (result) => {
           if(result !== null){
                const deleted_user = result;
               
                db.users.destroy({
                  where: {
                    id: req.params.user_id
                  }
                }).then( (result) => res.json({ result: 'success', deleted: deleted_user }) );
           } else {
              res.json({ result: 'error', message: 'No data found.' });
           }
       }).catch(err => {
            console.log(err);
       });
    }
  );
  
  
  //Create new user
  app.post( "/admin/users", (req, res) => {
    console.log(req.body);
    var required_fields = [req.body.name, req.body.email, req.body.password];
    var validator = ApiFieldsValidation(required_fields);
    
    if(validator === true){
        db.users.create({
          name: req.body.name,
          email: req.body.email,
          password: bcrypt.hashSync(req.body.password),
          phone: req.body.phone,
          gender: req.body.gender,
          role: req.body.role,
          profile_image: req.body.profile_image,
          profile_banner: req.body.profile_banner,
          profile_desc: req.body.profile_desc,
          created_at: current,
          updated_at: current
        }).then( (result) => {
            res.json(result);
        }).catch(err => {
            console.log(err);
        });
    } else {
         res.json({ result: 'error', message: 'Missing required parameters.' });
    }
  });
  
  
  //Update user details
  app.put( "/admin/users/:user_id", (req, res) => {
//      console.log(req.params.user_id);
//      console.log(req.body);
    db.users.update({
      name: req.body.name,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password),
      phone: req.body.phone,
      gender: req.body.gender,
      role: req.body.role,
      profile_image: req.body.profile_image,
      profile_banner: req.body.profile_banner,
      profile_desc: req.body.profile_desc,
      updated_at: current
    },
    {
      where: {
        id: req.params.user_id
      }
    }).then( (result) => {
       db.users.findById(req.params.user_id).then( (result) => {
            res.json({ result: 'success', updated: result });
       });
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