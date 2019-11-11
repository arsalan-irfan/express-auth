const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const passport = require("passport");
require("dotenv").config();
//User model
const User = require("../models/User");
const schema = require("../helper/Validation");
require("../config/passport")(passport);
const hashPassword = require("../helper/hash");

//Register Handle
router.post("/email/signup", async (req, res) => {
  const { firstname, lastname, email, source, password } = req.body;

  try {
    //Check required fields
    const value = await schema.validateAsync({
      firstname,
      lastname,
      email,
      source,
      password
    });
    //Validation passed
    User.findOne({ where: { email: email } }).then(async user => {
      if (user) {
        //User exists
        res.status(400).json({ errors: [{ msg: "user already exist" }] });
        //  res.json({ user });
      } else {
        const hash = await hashPassword(password);
        console.log("In controller " + hash);
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
          .catch(err => res.status(500).json({ errors: [{ msg: err }] }));
      }
    });
  } catch (err) {
    res.status(400).json({ errors: [{ msg: err }] });
  }
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
            id: user._id
          }
        };
        const token = jwt.sign(payload, "jwt-secret", { expiresIn: 360000 });
        return res.status(200).json({ token });
      });
    }
  })(req, res, next);
});

router.get("/profile", function(req, res, next) {
  passport.authenticate("jwt", { session: false }, function(err, user, info) {
    if (err) {
      res.json(err);
    }
    //get user
    //  if (req.isAuthenticated()) {
    //console.log('req.file', ' ', req.file);
    if (info || !user) {
      console.log("hello", info);
      res.status(400).json({ errors: [{ msg: info.message }] });
    }
    if (user) {
      res.status(200).json(user);
    }
  })(req, res, next);
});

//Forgot password

module.exports = router;
