module.exports = (sequelize, DataTypes) => {
  const room_type = sequelize.define('room_type', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      type: DataTypes.STRING,
      created_at: DataTypes.STRING,
      updated_at: DataTypes.STRING
    },
    {
      freezeTableName: true
    }
  );

  return room_type;
};