const express = require("express");
const bodyParser = require("body-parser");
const faker = require("faker");
const times = require("lodash.times");
const random = require("lodash.random");
const db = require("./models");

const apiUsers = require("./app/api/users");
const apiHotel = require("./app/api/hotel");
const apiAccount = require("./app/api/account");

const app = express();
//app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("app/public"));

const dateTime = require('node-datetime');
const dt = dateTime.create();
const current = dt.format('Y-m-d H:M:S');


//API authentication before all request
app.all('/*', function(req, res, next) {
    console.log('Intercepting requests ...');
    console.log('Running for API authentication......');
    
    if((!(req.header('api_key')))){
        res.json({ result: 'error', message: 'Missing api_key' });
    } else {
    
        var api_key = req.header('api_key');
            
        //Find api_key inside users table 
        db.users.findOne({
                where: {
                  api_key: api_key,
                  role: 'superadmin'
                }
        }).then( (result) => {
            console.log(result);
            if(result !== null){
                apiUsers(app, db, current);
                apiHotel(app, db, current);
                apiAccount(app,db,current);
                next();
            } else {
               res.json({ result: 'error', message: 'Invalid api_key.' });
            }
        }).catch(err => {
             console.log(err);
        });
    }
});


//Database table association & relationship
db.hotel_room.belongsTo(db.room_type,{foreignKey: 'room_type_id'});
db.room_type.hasMany(db.hotel_room,{foreignKey: 'id'});


//**** Dummy & testing area ****//

//Password encryption algorithm same as laravel
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('123');
console.log(hash);
console.log(bcrypt.compareSync('123', hash)); 


//db.sequelize.sync().then(() => {
//  app.listen(8080, () => console.log("App listening on port 8080!"));
//});
app.listen(8080, () => console.log("App listening on port 8080!"));