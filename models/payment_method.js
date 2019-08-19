module.exports = (sequelize, DataTypes) => {
  const payment_method = sequelize.define('payment_method', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      type: DataTypes.STRING
    },
    {
      freezeTableName: true
    }
  );

  return payment_method;
};