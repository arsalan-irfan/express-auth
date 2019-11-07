const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const passport = require("passport");
require("dotenv").config();
//User model
const User = require("../models/User");
require("../config/passport")(passport);

//Register Handle
router.post("/email/signup", (req, res) => {
  const { firstname, lastname, email, source, password } = req.body;
  //Check required fields
  if (!firstname || !lastname || !email || !password || !source) {
    res
      .status(400)
      .json({ errors: [{ msg: "please fill all required fields" }] });
  }

  //Check pass length
  if (password.length < 6) {
    res
      .status(400)
      .json({ errors: [{ msg: "password length should not be less than 6" }] });
  }

  //Validation passed
  User.findOne({ where: { email: email } }).then(user => {
    if (user) {
      //User exists
      res.status(400).json({ errors: [{ msg: "user already exist" }] });
      //  res.json({ user });
    } else {
      const newUser = new User({
        firstname: firstname,
        lastname: lastname,
        email: email,
        password: password,
        source: source
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          User.create({
            firstname: firstname,
            lastname: lastname,
            email: email,
            password: hash,
            source: source
          })
            .then(user => {
              //  console.log(user);
              req.login(user, { session: false }, function(error) {
                if (error) return next(error);
                // console.log('Request Login supossedly successful.');
                //   console.log("Request Login supossedly successful.");
                const payload = {
                  user: {
                    id: user.user_id
                  }
                };
                const token = jwt.sign(payload, "jwt-secret", {
                  expiresIn: "48h"
                });
                return res.status(200).json({ token });
              });
              // res.status(200).send(true);
            })
            .catch(err => res.status(500).send(err));
        });
      });
    }
  });
});

//Login Handle
router.post("/email/signin", function(req, res, next) {
  passport.authenticate("local", { session: false }, function(err, user, info) {
    if (info) {
      res.status(400).json({ errors: [{ msg: info.message }] });
    }
    if (user) {
      req.login(user, { session: false }, function(error) {
        if (error) {
          return res.send(error);
        }
        // console.log('Request Login supossedly successful.');
        //   console.log("Request Login supossedly successful.");
        //console.log(user);
        const payload = {
          user: {
            id: user.user_id
          }
        };
        const token = jwt.sign(payload, "jwt-secret", { expiresIn: "48h" });
        return res.status(200).json({ token });
      });
    }
  })
  
});
router.get('/profile', function(req, res, next) {
    passport.authenticate('jwt', { session: false }, function(err, user, info) {
      if (err) {
        res.json(err);
      }
      //get user
      //  if (req.isAuthenticated()) {
      //console.log('req.file', ' ', req.file);
      if (info || !user) {
        console.log('hello', info);
        res.status(400).json({ errors: [{ msg: info.message }] });
      }
      if (user) {
        res.status(200).json(user);
      }
    })(req, res, next);

  });

//Forgot password

module.exports = router;
