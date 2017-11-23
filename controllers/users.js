const express = require('express');
const models = require('../models');
const passport = require('../middlewares/authentication');
const Redirect = require('../middlewares/redirect');
const Op = models.Sequelize.Op;

module.exports = {
  registerRouter() {
    const router = express.Router();

    router.get('/', Redirect.ifNotLoggedIn(), Redirect.ifNotAdmin(), this.index);
    router.get('/:username', Redirect.ifNotLoggedIn(), Redirect.ifNotAdmin(), this.show);
    router.put('/:username', Redirect.ifNotLoggedIn(), Redirect.ifNotAdmin(), this.update);

    return router;
  },

  index(req, res) {
    models.User.findAll({
      where: {
        accountStatus: "Approved",
      },
    }).then((allApprovedUsers) => {
      models.User.findAll({
        where: {
          accountStatus: "Pending",
        },
      }).then((allPendingUsers) => {
        models.User.findAll({
          where: {
            accountStatus: {
              [Op.and]:{
                [Op.ne]:"Pending",
                [Op.and]:{
                  [Op.ne]:"Approved"
                },
              },  
            },
          },
        }).then((allBlockedUsers) => {
          res.render('users', { allApprovedUsers, allPendingUsers, allBlockedUsers });
        });
      });
    });
  },

  show(req, res) {
    models.User.findOne({
      where: {
        username: req.params.username,
      },
    }).then((user) => {
      if(user) {
        res.render('users/single', { user: user });
      } else {
        res.redirect('/users');
      }
    }).catch(() => {
      res.redirect('/profile');
    });
  },

  update(req, res) {
    models.User.update({
      accountType: req.body.accountType,
    //  admin: req.body.admin,
    //  approved: req.body.approved,
      accountStatus: req.body.accountStatus,
    },
    {
      where: {
        username: req.params.username,
      },
      /*include: [{
        model: models.User,
        where: {
          username: req.params.username,
        },
      }],*/
      returning: true,
    }).then(([numRows, rows]) => {
      const post = rows[0];
      res.redirect(`/users`);///${req.user.username}/`);
    });
  },

  // EXPEREMENTAL 

  delete(req, res) {
    models.User.destroy({
      where: {
        username: req.params.username,
      },
      include: [{
        model: models.User,
        where: {
          username: req.params.username,
        },
      }],
    }).then(() => {
      res.redirect('/posts');
    });
  },
};