var Sequelize = require('sequelize');
const Op = Sequelize.Op;
const key = require("../../config/api_config");
var request = require('request-promise-native');

module.exports = (app, db , current) => {
  
    app.post( "/trip", async(req, res) => {
        
        var city = req.body.city;
        const vcity = await db.cities.find({
            where: {
               name: {
                 [Op.eq]: city
               }
            }
        });

        
        var result = await request.get(
            {
                url: 'https://api.sygictravelapi.com/1.1/en/places/list?parents='+vcity.city_id+'&level=poi&limit=100&categories=eating',
                headers: {
                    "x-api-key": key.sygic.api_key
                }
            }
        );
        

        res.json({
            city: vcity.city_id,
            result: "success",
            poi: JSON.parse(result)
        });
      
    });

};