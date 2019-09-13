module.exports = (sequelize, DataTypes) => {
  const flight_booking = sequelize.define('flight_booking', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      user_id: DataTypes.INTEGER,
      related_flight_id: DataTypes.STRING,
      country: DataTypes.STRING,
      country_code: DataTypes.STRING,
      city: DataTypes.STRING,
      dep_airport: DataTypes.STRING,
      arr_airport: DataTypes.STRING,
      arr_country: DataTypes.STRING,
      arr_country_code: DataTypes.STRING,
      dep_date: DataTypes.STRING,
      airline_name: DataTypes.STRING,
      airline_code: DataTypes.STRING,
      flight_code: DataTypes.STRING,
      flight_start: DataTypes.STRING,
      flight_end: DataTypes.STRING,
      duration: DataTypes.STRING,
      plane: DataTypes.STRING,
      class: DataTypes.STRING,
      price: DataTypes.INTEGER,
      tax: DataTypes.INTEGER,
      is_single_way: DataTypes.INTEGER,
      updated_at: DataTypes.STRING,
      created_at: DataTypes.STRING
    },
    {
      freezeTableName: true
    }
  );

  return flight_booking;
};