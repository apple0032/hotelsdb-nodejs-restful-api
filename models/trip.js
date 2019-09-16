module.exports = (sequelize, DataTypes) => {
  const trip = sequelize.define('trip', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      booking_id: DataTypes.INTEGER,
      city: DataTypes.STRING,
      related_flight_id: DataTypes.STRING,
      user_id: DataTypes.INTEGER,
      created_at: DataTypes.STRING,
      updated_at: DataTypes.STRING
    },
    {
      freezeTableName: true
    }
  );

  return trip;
};