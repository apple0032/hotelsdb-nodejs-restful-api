module.exports = (sequelize, DataTypes) => {
  const flight_payment = sequelize.define('flight_payment', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      related_flight_id: DataTypes.STRING,
      flight_booking_id: DataTypes.INTEGER,
      total_price : DataTypes.INTEGER,
      payment_method : DataTypes.INTEGER,
      card_number : DataTypes.INTEGER,
      security_number : DataTypes.INTEGER,
      is_single_way : DataTypes.INTEGER,
      status : DataTypes.INTEGER,
      user_id : DataTypes.INTEGER,
      expired_date: DataTypes.STRING,
      updated_at: DataTypes.STRING,
      created_at: DataTypes.STRING
    },
    {
      freezeTableName: true
    }
  );

  return flight_payment;
};