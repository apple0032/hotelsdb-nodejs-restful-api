const bcrypt = require('bcryptjs');

module.exports = (app, db , current) => {
  
  //Get all user data
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