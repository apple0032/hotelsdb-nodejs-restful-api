const bcrypt = require('bcryptjs');

module.exports = (app, db , current) => {
  
  //Login user
  app.post( "/user/login", (req, res) => {

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
  
   /**
   * @swagger
   
   "/user/login": {
        "post": {
            "security": [
                {
                    "APIKeyHeader": []
                }
            ],
            "summary": "login check of a user by email & password",
            "description": "login check of a user by email & password",
            "tags" : ["user"],
            "parameters": [
                {
                    "description": "email of user",
                    "type": "string",
                    "name": "email",
                    "in": "formData",
                    "required" : "true"
                },
                {
                    "description": "password of user",
                    "type": "string",
                    "name": "password",
                    "in": "formData",
                    "required" : "true"
                }
            ],
            "responses": {
                "200": {
                    "description": "Success output",
                    "examples" : {
                        "application/json": {
                            "result": "success",
                            "name": "KenIP",
                            "email": "kenip0813@gmail.com",
                            "message": "Login successful"
                        }
                    }
                }
            }
        }
    }
   */
  
  //Generate new api_key by user_id
  app.put( "/user/api-key/:user_id", (req, res) => {
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
  
   /**
   * @swagger
   
   "/user/api-key/{user_id}": {
        "put": {
            "security": [
                {
                    "APIKeyHeader": []
                }
            ],
            "summary": "Generate a new api_key for a user",
            "description": "Generate a new api_key for a user, It will replace the old api_key.",
            "tags" : ["user"],
            "parameters": [
                {
                    "description": "id of user",
                    "type": "string",
                    "name": "user_id",
                    "in": "path",
                    "required" : "true"
                }
            ],
            "responses": {
                "200": {
                    "description": "Success output",
                    "examples" : {
                        "application/json": {
                            "result": "success",
                            "updated": {
                              "id": 3,
                              "name": "user01",
                              "email": "user01@email.com",
                              "phone": null,
                              "gender": null,
                              "role": "user",
                              "profile_image": null,
                              "profile_banner": null,
                              "profile_desc": null,
                              "password": "$2y$10$XxsK4QEmY6FdtJZVjo7lt.iFClmphVmSQkN7uhVdMWEgumenRx88C",
                              "api_key": "MjAyMC0wNS0wNCAxNjoyNjozOQ==",
                              "created_at": "2018-10-29 09:27:08",
                              "updated_at": "2020-05-04 16:26:39"
                            }
                        }
                    }
                }
            }
        }
    }
   */
  
  
  
  //Get user by user_id (user api)
  app.get( "/user/:user_id", (req, res) => {
       db.users.find( {
           where: {id: req.params.user_id} , 
             attributes: {
                exclude: ['password']
              }
       }).then( (result) => {
           if(result !== null){
              res.json({ result: 'success', data: result });
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
   
   "/user/{user_id}": {
        "get": {
            "security": [
                {
                    "APIKeyHeader": []
                }
            ],
            "summary": "Get user details by id",
            "description": "Get user details by id",
            "tags" : ["user"],
            "parameters": [
                {
                    "description": "id of user",
                    "type": "string",
                    "name": "user_id",
                    "in": "path",
                    "required" : "true"
                }
            ],
            "responses": {
                "200": {
                    "description": "Success output",
                    "examples" : {
                        "application/json": {
                            "result": "success",
                            "data": {
                              "id": 3,
                              "name": "user01",
                              "email": "user01@email.com",
                              "phone": null,
                              "gender": null,
                              "role": "user",
                              "profile_image": null,
                              "profile_banner": null,
                              "profile_desc": null,
                              "api_key": "MjAyMC0wNS0wNCAxNjozMjozNw==",
                              "created_at": "2018-10-29 09:27:08",
                              "updated_at": "2020-05-04 16:32:37"
                            }
                        }
                    }
                }
            }
        }
    }
   */
  
  
   //Update user details
  app.put( "/user/:user_id", (req, res) => {
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
  

  
   /**
   * @swagger
   
   "/user/{user_id}": {
        "put": {
            "security": [
                {
                    "APIKeyHeader": []
                }
            ],
            "summary": "Update user details by id",
            "description": "Update user details by id",
            "tags" : ["user"],
            "parameters": [
                {
                    "description": "id of user",
                    "type": "string",
                    "name": "user_id",
                    "in": "path",
                    "required" : "true"
                },
                {
                    "description": "name of user",
                    "type": "string",
                    "name": "name",
                    "in": "formData"
                },
                {
                    "description": "email of user",
                    "type": "string",
                    "name": "email",
                    "in": "formData"
                },
                {
                    "description": "phone of user",
                    "type": "string",
                    "name": "phone",
                    "in": "formData"
                },
                {
                    "description": "gender of user",
                    "type": "string",
                    "name": "gender",
                    "in": "formData"
                },
                {
                    "description": "role of user",
                    "type": "string",
                    "name": "role",
                    "in": "formData"
                },
                {
                    "description": "profile_image of user",
                    "type": "string",
                    "name": "profile_image",
                    "in": "formData"
                },
                {
                    "description": "profile_banner of user",
                    "type": "string",
                    "name": "profile_banner",
                    "in": "formData"
                },
                {
                    "description": "profile_desc of user",
                    "type": "string",
                    "name": "profile_desc",
                    "in": "formData"
                },
                {
                    "description": "password of user",
                    "type": "string",
                    "name": "password",
                    "in": "formData"
                }
            ],
            "responses": {
                "200": {
                    "description": "Success output",
                    "examples" : {
                        "application/json": {
                            "result": "success",
                            "updated": {
                              "id": 3,
                              "name": "kenjai",
                              "email": "user02@email.com",
                              "phone": null,
                              "gender": null,
                              "role": "user",
                              "profile_image": null,
                              "profile_banner": null,
                              "profile_desc": null,
                              "password": "$2y$10$XxsK4QEmY6FdtJZVjo7lt.iFClmphVmSQkN7uhVdMWEgumenRx88C",
                              "api_key": "MjAyMC0wNS0wNCAxNjozMjozNw==",
                              "created_at": "2018-10-29 09:27:08",
                              "updated_at": "2020-05-04 16:58:05"
                            }
                        }
                    }
                }
            }
        }
    }
   */
  
  
  
  //Create new user
  app.post( "/user", (req, res) => {
    console.log(req.body);
    var required_fields = [req.body.name, req.body.email, req.body.password];
    var validator = ApiFieldsValidation(required_fields);
    var duplicate = checkUniqueEmail(req.body.email,null);
    console.log(duplicate);
    
    if(validator === true){
        db.users.find( {
            where: {email: req.body.email} 
        }).then( (result) => {
            if(result == null){
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
                res.json({ result: 'error', message: 'Duplicate email address!' });
            }
        }).catch(err => {
             console.log(err);
        });
    } else {
         res.json({ result: 'error', message: 'Missing required parameters.' });
    }
  });



   /**
   * @swagger
   
   "/user": {
        "post": {
            "security": [
                {
                    "APIKeyHeader": []
                }
            ],
            "summary": "Create a new user",
            "description": "Create a new user",
            "tags" : ["user"],
            "parameters": [
                {
                    "description": "name of user",
                    "type": "string",
                    "name": "name",
                    "in": "formData",
                    "required" : "true"
                },
                {
                    "description": "email of user",
                    "type": "string",
                    "name": "email",
                    "in": "formData",
                    "required" : "true"
                },
                {
                    "description": "password of user",
                    "type": "string",
                    "name": "password",
                    "in": "formData",
                    "required" : "true"
                },
                {
                    "description": "phone of user",
                    "type": "string",
                    "name": "phone",
                    "in": "formData"
                },
                {
                    "description": "gender of user",
                    "type": "string",
                    "name": "gender",
                    "in": "formData"
                },
                {
                    "description": "role of user",
                    "type": "string",
                    "name": "role",
                    "in": "formData"
                },
                {
                    "description": "profile_image of user",
                    "type": "string",
                    "name": "profile_image",
                    "in": "formData"
                },
                {
                    "description": "profile_banner of user",
                    "type": "string",
                    "name": "profile_banner",
                    "in": "formData"
                },
                {
                    "description": "profile_desc of user",
                    "type": "string",
                    "name": "profile_desc",
                    "in": "formData"
                }
            ],
            "responses": {
                "200": {
                    "description": "Success output",
                    "examples" : {
                        "application/json": {
                            "result": "success",
                            "created": {
                              "id": 105,
                              "name": "test",
                              "email": "testtest@gmail.com",
                              "password": "$2a$10$.wH91CNBiHAc7Gh2hw7jzO8dkKPJMjwSLxlZPBBgpyjgNhqq8zb9O",
                              "phone": "67578444",
                              "created_at": "2020-05-04 17:06:41",
                              "updated_at": "2020-05-04 17:06:41"
                            }
                        }
                    }
                }
            }
        }
    }
   */
  
  
  
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
  
  function checkUniqueEmail(email,itself){
    console.log(email);
    
    var duplicate = false;
    db.users.find( {
        where: {email: email} 
    }).then( (result) => {
        if(result !== null){
           duplicate = true;
        }
    }).catch(err => {
         console.log(err);
    });
    
    return duplicate;
  }
  
  
};