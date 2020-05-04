const bcrypt = require('bcryptjs');

module.exports = (app, db , current) => {
  
  //Get all user data
  app.get( "/admin/user", (req, res) => {
      
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

    
   /**
   * @swagger
   
   "/admin/user": {
        "get": {
            "security": [
                {
                    "APIKeyHeader": []
                }
            ],
            "summary": "Get all users",
            "description": "Get all users",
            "tags" : ["admin-user"],
            "parameters": [
                
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
                                "id": 2,
                                "name": "KenIP",
                                "email": "kenip0813@gmail.com",
                                "phone": "67578441",
                                "gender": "M",
                                "role": "superadmin",
                                "profile_image": "1550258539.jpg",
                                "profile_banner": "1550260093.png",
                                "profile_desc": "desc",
                                "password": "$2y$10$QXpuVXA6F9/CsjuaLEGy1uFaGuiqUNArd/SUYpyFy9.jvU2tijQpu",
                                "api_key": "m67578441",
                                "created_at": "2018-10-27 13:04:14",
                                "updated_at": "2019-08-28 16:29:43"
                              }
                             ]
                        }
                    }
                }
            }
        }
    }
   */
  
  
  
  //Get user by user_id
  app.get( "/admin/user/:user_id", (req, res) => {
       db.users.findById(req.params.user_id).then( (result) => {
           if(result !== null){
              res.json({ result: 'success' , data: result });
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
   
   "/admin/user/{user_id}": {
        "get": {
            "security": [
                {
                    "APIKeyHeader": []
                }
            ],
            "summary": "Get user details by id",
            "description": "Get user details by id",
            "tags" : ["admin-user"],
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
  
  
  
  //Delete user by use_id
   app.delete( "/admin/user/:user_id", (req, res) => {
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
  
  
  
   /**
   * @swagger
   
   "/admin/user/{user_id}": {
        "delete": {
            "security": [
                {
                    "APIKeyHeader": []
                }
            ],
            "summary": "Delete user by id",
            "description": "Delete user by id",
            "tags" : ["admin-user"],
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
                            "deleted": {
                              "id": 105,
                              "name": "test",
                              "email": "testtest@gmail.com",
                              "phone": "67578444",
                              "gender": null,
                              "role": "user",
                              "profile_image": null,
                              "profile_banner": null,
                              "profile_desc": null,
                              "password": "$2a$10$.wH91CNBiHAc7Gh2hw7jzO8dkKPJMjwSLxlZPBBgpyjgNhqq8zb9O",
                              "api_key": null,
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

  
};