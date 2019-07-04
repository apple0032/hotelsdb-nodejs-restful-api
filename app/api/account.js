const bcrypt = require('bcryptjs');

module.exports = (app, db , current) => {
  
  //Login user
  app.post( "/account/login", (req, res) => {

    var required_fields = [req.body.email, req.body.password];
    var validator = ApiFieldsValidation(required_fields);
    
    if(validator === true){
        
        //Find user by email
        db.users.findOne({
                where: {
                  email: req.body.email
                }
        }).then( (result) => {
            if(result !== null){
               //User found. Compare password by bcrypt
               const identify = bcrypt.compareSync(req.body.password, result.password);
               if(identify === true){
                   res.json({ result: 'success', name: result.name, email: result.email ,message: 'Login successful' });
               }else {
                   res.json({ result: 'error', hit: 'password_fail' ,message: 'Login fail. No user found.' });
               }
            } else {
               res.json({ result: 'error', hit: 'user_fail', message: 'Login fail. No user found.' });
            }
        }).catch(err => {
             console.log(err);
        });
        
    } else {
        res.json({ result: 'error', message: 'Missing required parameters.' });
    }
                
  });
  
  //Generate new api_key by user_id
  app.put( "/account/api-key/:user_id", (req, res) => {
       db.users.findById(req.params.user_id).then( (result) => {
           if(result !== null){
              //User found, generate and update new api key
                    db.users.update({
                        api_key: Buffer.from(current.create().format('Y-m-d H:M:S')).toString('base64'),
                        updated_at: current.create().format('Y-m-d H:M:S')
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
           } else {
              res.json({ result: 'error', message: 'No data found.' });
           }
       }).catch(err => {
            console.log(err);
       });
  });
  
  //Get user by user_id (user api)
  app.get( "/account/:user_id", (req, res) => {
       db.users.find( {
           where: {id: req.params.user_id} , 
             attributes: {
                exclude: ['password','api_key']
              }
       }).then( (result) => {
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
  
  
   //Update user details
  app.put( "/account/:user_id", (req, res) => {
//      console.log(req.params.user_id);
//      console.log(req.body);
    var apiRequired = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      gender: req.body.gender,
      role: req.body.role,
      profile_image: req.body.profile_image,
      profile_banner: req.body.profile_banner,
      profile_desc: req.body.profile_desc,
      updated_at: current.create().format('Y-m-d H:M:S')
    };
    
     if (typeof req.body.password !== 'undefined'){
         apiRequired.password = bcrypt.hashSync(req.body.password);
     }

    db.users.update(apiRequired,
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
  
  
  //Create new user
  app.post( "/account/create", (req, res) => {
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
          created_at: current.create().format('Y-m-d H:M:S'),
          updated_at: current.create().format('Y-m-d H:M:S')
        }).then( (result) => {
            res.json({ result: 'success', created: result });
        }).catch(err => {
            console.log(err);
        });
    } else {
         res.json({ result: 'error', message: 'Missing required parameters.' });
    }
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