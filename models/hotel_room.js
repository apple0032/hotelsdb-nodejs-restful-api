module.exports = (sequelize, DataTypes) => {
  const hotel_room = sequelize.define('hotel_room', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      hotel_id: DataTypes.INTEGER,
      room_type_id : DataTypes.INTEGER,
      ppl_limit : DataTypes.INTEGER,
      price : DataTypes.INTEGER,
      qty : DataTypes.INTEGER,
      availability : DataTypes.INTEGER,
      promo : DataTypes.INTEGER,
      created_at: DataTypes.STRING,
      updated_at: DataTypes.STRING
    },
    {
      freezeTableName: true
    }
  );

  return hotel_room;
};