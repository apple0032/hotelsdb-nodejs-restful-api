module.exports = (sequelize, DataTypes) => {
  const booking_guest = sequelize.define('booking_guest', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      booking_id: DataTypes.INTEGER,
      name: DataTypes.STRING,
      phone: DataTypes.INTEGER,
      gender: DataTypes.STRING,
      email: DataTypes.STRING,
      created_at: DataTypes.STRING,
      updated_at: DataTypes.STRING
    },
    {
      freezeTableName: true
    }
  );

  return booking_guest;
};