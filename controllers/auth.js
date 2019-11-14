const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const passport = require("passport");
require("dotenv").config();
//User model
const User = require("../models/User");
const schema = require("../helper/Validation");
require("../config/passport")(passport);
const setProfile = require("../helper/profile").setProfile


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
      let profile= setProfile(user);
      console.log("Result"+profile.firstname);
      res.status(200).json(profile);
    }
  })(req, res, next);
});

//Facebook login

/**
 * @api {get} /auth/facebook/signin Facebook Signin
 * @apiName FacebookSignin
 * @apiGroup AuthAPI
 */
router.get(
  "/facebook/signin",
  passport.authenticate("facebook", { scope: ["email"] })
);
/**
 * @api {get} /auth/facebook/signin/return Facebook Signin return
 * @apiName FacebookSignin
 * @apiGroup AuthAPI
 */
router.get(
  "/facebook/signin/return",
  passport.authenticate("facebook", { session: false }),
  function(req, res) {
    console.log("Req.user" + req.user);

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
//Google Login
/**
 * @api {get} /auth/google/signin Google Signin
 * @apiName GoogleSignin
 * @apiGroup AuthAPI
 */

router.get(
  "/google/signin",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

/**
 * @api {get} /auth/google/signin/return Google Signin
 * @apiName GoogleSignin
 * @apiGroup AuthAPI
 */

router.get(
  "/google/signin/return",
  passport.authenticate("google", { session: false }),
  async (req, res) => {
    //res.render('navbar');

    const payload = {
      user: {
        id: req.user.user_id
      }
    };
    const token = await jwt.sign(payload, "jwt-secret", { expiresIn: "2h" });
    console.log(token);
    res.cookie("auth", token).redirect("http://127.0.0.1:5500/authcheck.html");
    //console.log("In request "+req.cookies.auth)

  }
);

module.exports = router;
