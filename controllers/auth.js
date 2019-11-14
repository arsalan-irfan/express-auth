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

/**
 * @api {post} /auth/email/signup Create user
 * @apiName CreateUser
 * @apiGroup AuthAPI
 */
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
/**
 * @api {post} /auth/email/signin Sign in user
 * @apiName SigninUser
 * @apiGroup AuthAPI
 */
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
        const token = jwt.sign(payload, "jwt-secret", { expiresIn: 360000 });
        return res.status(200).json({ token });
      });
    }
  })(req, res, next);
});

/**
 * @api {get} /auth/profile Request User information
 * @apiName GetAuthUser
 * @apiGroup AuthAPI
 *
 * @apiParam {Number} id Users unique ID.
 * @apiPermission Authorized users only
 *
 * @apiSuccess {Number} id Unique id of the User.
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 * @apiSuccess {email} email  Address of the user.
 * @apiSuccess {date} createdAt  App creation date.
 * @apiSuccess {date} email  last update date.
 *
 */
router.get("/profile", function(req, res, next) {
  passport.authenticate("jwt", { session: false }, function(err, user, info) {
    if (err) {
      res.json(err);
    }
    if (info || !user) {
      console.log("hello", info);
      res.status(400).json({ errors: [{ msg: info.message }] });
    }
    if (user) {
      const { password, ...result } = user;
      console.log(result);
      res.status(200).json(user);
    }
  })(req, res, next);
});

//Facebook login

router.get(
  "/facebook/signin",
  passport.authenticate("facebook", { scope: ["email"] })
);

router.get(
  "/facebook/signin/return",
  passport.authenticate("facebook", { session: false }),
  function(req, res) {
     console.log("Req.user"+req.user);

    const payload = {
      user: {
        id: req.user.user_id
      }
    };
    const token = jwt.sign(payload, "jwt-secret", { expiresIn: "2h" });
    
    console.log(token);
    res.cookie("auth", token);
    res.redirect(`http://127.0.0.1:5500/authcheck.html`);
    //res.status(200).send(true);
  }
);
router.get("/facebook/logout", function(req, res) {
  req.logout();
  res.redirect("/");
});
module.exports = router;
