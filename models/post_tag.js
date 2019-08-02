module.exports = (sequelize, DataTypes) => {
  const post_tag = sequelize.define('post_tag', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      hotel_id: DataTypes.INTEGER,
      tag_id: DataTypes.INTEGER,
      created_at: DataTypes.STRING,
      updated_at: DataTypes.STRING
    },
    {
      freezeTableName: true
    }
  );

  return post_tag;
};