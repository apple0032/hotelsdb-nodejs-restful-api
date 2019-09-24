module.exports = (sequelize, DataTypes) => {
  const cities = sequelize.define('cities', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      city_id: DataTypes.STRING,
      name: DataTypes.STRING,
      country_id: DataTypes.STRING,
    },
    {
      freezeTableName: true
    }
  );

  return cities;
};