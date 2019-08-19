module.exports = (sequelize, DataTypes) => {
  const booking_payment = sequelize.define('booking_payment', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      booking_id: DataTypes.INTEGER,
      user_id: DataTypes.INTEGER,
      single_price: DataTypes.INTEGER,
      handling_price: DataTypes.INTEGER,
      total_price: DataTypes.INTEGER,
      payment_method_id: DataTypes.INTEGER,
      card_number: DataTypes.INTEGER,
      expired_date: DataTypes.STRING,
      security_number: DataTypes.INTEGER,
      status: DataTypes.INTEGER
    },
    {
      freezeTableName: true
    }
  );

  return booking_payment;
};