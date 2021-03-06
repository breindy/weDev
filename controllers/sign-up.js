const express = require('express');
const models = require('../models');
const Redirect = require('../middlewares/redirect');


module.exports = {
  registerRouter() {
    const router = express.Router();

    router.get('/', Redirect.ifLoggedIn('/profile/show'), this.index);
    router.post('/', this.submit);

    return router;
  },
  index(req, res) {
    res.render('sign-up');
  },
  submit(req, res) {
    models.User.create({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      accountType: req.body.accountType,
      accountStatus: "Pending",
    }).then((user) => {
      if(req.body.accountType == "Customer"){
        console.log(user.username);
        console.log(user.id);
        models.Connection.create({
          customerUsername: user.username,
          customerId: user.id,
          adminUsername: "Admin",
          adminId: 1,
        }).then(()=>{
        });
      }
      else{
        models.Connection.create({
          developerUsername: user.username,
          developerId: user.id,
          adminUsername: "Admin",
          adminId: 1,
        }).then(()=>{
        });
      }
      req.login(user, () =>
        res.redirect('/deposit/initial')
      );
    }).catch(() => {
        models.User.findOne({
          where: {
            username: req.body.username,
          }}).then((usernameCheck) =>{

          if(usernameCheck != null)
            var usernameIsTaken = true;
          
          models.User.findOne({
            where: {
                email: req.body.email,
            }}).then((emailCheck) =>{

          if(emailCheck != null)
            var emailIsTaken = true;
          var otherError  = !(usernameIsTaken || emailIsTaken);
          res.render('sign-up',{error: otherError, usernameTaken: usernameIsTaken, emailTaken: emailIsTaken});
        });
      });
    });
  },
};

/*
        <div class="row control-group">
          <div class="form-group col-xs-12 floating-label-form-group controls">
            <label>Picture</label>
            <input type="file" name="pic" accept="image/*" required data-validation-required-message="Please enter your password.">
            <p class="help-block text-danger"></p>
          </div>
        </div>


*/