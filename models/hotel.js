module.exports = (sequelize, DataTypes) => {
  const Hotel = sequelize.define('hotel', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      name:  DataTypes.STRING,
      star: DataTypes.INTEGER,
      phone: DataTypes.INTEGER,
      category_id: DataTypes.INTEGER,
      default_image: DataTypes.STRING,
      image: DataTypes.STRING,
      body: DataTypes.STRING,
      coordi_x: DataTypes.STRING,
      coordi_y: DataTypes.STRING,
      new: DataTypes.INTEGER,
      handling_price: DataTypes.INTEGER,
      created_at: DataTypes.STRING,
      updated_at: DataTypes.STRING,
      soft_delete: DataTypes.INTEGER
    },
    {
      freezeTableName: true
    }
  );

  return Hotel;
};