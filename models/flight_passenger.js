module.exports = (sequelize, DataTypes) => {
  const flight_passenger = sequelize.define('flight_passenger', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      related_flight_id: DataTypes.STRING,
      people_name: DataTypes.STRING,
      people_passport: DataTypes.STRING,
      seat: DataTypes.STRING,
      flight_booking_id: DataTypes.INTEGER,
      updated_at: DataTypes.STRING,
      created_at: DataTypes.STRING
    },
    {
      freezeTableName: true
    }
  );

  return flight_passenger;
};