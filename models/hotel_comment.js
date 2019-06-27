module.exports = (sequelize, DataTypes) => {
  const hotel_comment = sequelize.define('hotel_comment', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      hotel_id: DataTypes.INTEGER,
      user_id: DataTypes.INTEGER,
      comment: DataTypes.STRING,
      star: DataTypes.INTEGER,
      status: DataTypes.INTEGER,
      created_at: DataTypes.STRING,
      updated_at: DataTypes.STRING
    },
    {
      freezeTableName: true
    }
  );

  return hotel_comment;
};