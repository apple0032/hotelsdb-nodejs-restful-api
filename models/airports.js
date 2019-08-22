module.exports = (sequelize, DataTypes) => {
  const airports = sequelize.define('airports', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      ident: DataTypes.STRING,
      type: DataTypes.STRING,
      name: DataTypes.STRING,
      elevation_ft: DataTypes.INTEGER,
      continent: DataTypes.STRING,
      iso_country: DataTypes.STRING,
      iso_region: DataTypes.STRING,
      municipality: DataTypes.STRING,
      gps_code: DataTypes.STRING,
      iata_code: DataTypes.STRING,
      local_code: DataTypes.STRING,
      coordinates: DataTypes.STRING
    },
    {
      freezeTableName: true
    }
  );

  return airports;
};