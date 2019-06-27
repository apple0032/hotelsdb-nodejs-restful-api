module.exports = (sequelize, DataTypes) => {
  const Users = sequelize.define('users', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      name: DataTypes.STRING,
      email: {
        type: DataTypes.STRING,
        validate: {
          isEmail:true
        },
        unique: {
            args: true,
            msg: 'Email address already in use!'
        }
      },
      phone: DataTypes.STRING,
      gender: DataTypes.STRING,
      role: DataTypes.STRING,
      profile_image: DataTypes.STRING,
      profile_banner: DataTypes.STRING,
      profile_desc: DataTypes.STRING,
      password: DataTypes.STRING,
      api_key: DataTypes.STRING,
      created_at: DataTypes.STRING,
      updated_at: DataTypes.STRING
    },
    {
      freezeTableName: true
    }
  );

  return Users;
};