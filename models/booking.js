module.exports = (sequelize, DataTypes) => {
  const Booking = sequelize.define('booking', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      user_id: DataTypes.INTEGER,
      hotel_id: DataTypes.INTEGER,
      hotel_room_id : DataTypes.INTEGER,
      people : DataTypes.INTEGER,
      in_date : DataTypes.STRING,
      out_date : DataTypes.STRING,
      book_date : DataTypes.STRING,
      total_price : DataTypes.STRING,
      payment_method_id : DataTypes.INTEGER,
      approved : DataTypes.INTEGER,
      status : DataTypes.INTEGER,
      created_at: DataTypes.STRING,
      updated_at: DataTypes.STRING
    },
    {
      freezeTableName: true
    }
  );

  return Booking;
};