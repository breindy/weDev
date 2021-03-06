const bcrypt = require('bcrypt-nodejs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('user', {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        isAlphanumeric: true,
      },
    },
    accountType:{
      type: DataTypes.STRING,
      allowNull: true,
    },
    accountStatus:{
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        isEmail: true, 
      },
    },
    password_hash: {
      type: DataTypes.STRING,
    },
    password: {
      type: DataTypes.VIRTUAL,
      validate: {
        notEmpty: true,
      },
    },
  });
  User.associate = (models) => {
    models.User.hasMany(models.Post);
    models.User.hasMany(models.Bid);
    models.User.hasMany(models.WorkOrder);
    models.User.hasOne(models.Profile);
    models.User.hasOne(models.Wallet);
    models.User.hasOne(models.QuitReq);
  }

  User.beforeCreate((user) =>
    new sequelize.Promise((resolve) => {
      bcrypt.hash(user.password, null, null, (err, hashedPassword) => {
        resolve(hashedPassword);
      });
    }).then((hashedPw) => {
      user.password_hash = hashedPw;
    })
  );

  return User;
};
