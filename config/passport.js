const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const passportJWT = require("passport-jwt");
const FacebookStrategy = require("passport-facebook").Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const JWTStrategy = passportJWT.Strategy;
const dotenv = require('dotenv');
dotenv.config();
//User model
const User = require("../models/User");
module.exports = function(passport) {
  passport.use(
    new JWTStrategy(
      {
        jwtFromRequest: ExtractJWT.fromHeader("x-auth-token"),
        secretOrKey: "jwt-secret"
      },
      function(jwtPayload, cb) {
        return User.findOne({
          where: { user_id: jwtPayload.user.id }
          //attributes: ['id', ['name', 'title']]
        })
          .then(user => {
            if (!user) {
              return cb(null, false, {
                message:
                  "token is not valid please get another token by logging in!"
              });
            }
            //const {password,...result}=user;
            //  console.log('user found!:', user);
            return cb(null, user);
          })
          .catch(err => {
            console.log(err);
            return cb(err);
          });
      }
    )
  );

  passport.use(
    new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
      //Match User
      User.findOne({ where: { email: email } })
        .then(user => {
          if (!user) {
            return done(null, false, {
              message: "invalid username or password"
            });
          }
          //Match password
          // if(password===user.password){
          //     return done(null, user);

          // } else {
          //   return done(null, false, {
          //     message: 'invalid username or password'
          //   });
          // }
          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) throw err;

            if (isMatch) {
              return done(null, user);
            } else {
              return done(null, false, {
                message: "invalid username or password"
              });
            }
          });
        })
        .catch(err => console.log(err));
    })
  );
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        callbackURL: "http://localhost:5000/return",
        profileFields: ["emails", "name", "photos"]
      },
      function(accessToken, refreshToken, profile, done) {
        const FacebookEmail = profile.emails[0].value;
        const FacebookPhoto = profile.photos[0].value;
        User.findOne({ email: FacebookEmail }, (err, user) => {
          //console.log(profile);
          if (err) {
            return done(err);
          }
          if (user) {
            return done(null, user);
          }
          var newUser = new User({
            firstname: profile.name.givenName,
            email: FacebookEmail,
            source:"facebook"
          });
          // newUser.facebook.id = profile.id;
          // newUser.facebook.token = accessToken;
          // newUser.facebook.name =
          //   profile.name.givenName + ' ' + profile.name.familyName;
          // newUser.facebook.email = profile.emails[0].value;

          newUser.save(function(err) {
            if (err) throw err;
            // newUser.token = accessToken;
            return done(null, newUser);
          });
        });
      }
    )
  );
};
