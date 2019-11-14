const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const passportJWT = require("passport-jwt");
const FacebookStrategy = require("passport-facebook").Strategy;
// const FacebookTokenStrategy = require("passport-facebook-token")
const ExtractJWT = passportJWT.ExtractJwt;
const JWTStrategy = passportJWT.Strategy;
const dotenv = require("dotenv");
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
        console.log("JWt Payload"+jwtPayload);
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
        callbackURL: "http://localhost:5000/auth/facebook/signin/return",
        profileFields: ["emails", "name", "photos"],
        enableProof: true
      },
      function async(accessToken, refreshToken, profile, done) {
        const FacebookEmail = profile.emails[0].value;
        const FacebookPhoto = profile.photos[0].value;
        console.log(profile);
        User.findOne({ where: { email: FacebookEmail } }).then(user => {
          if (user) {
            return done(null,user);
          } else {
            const { givenName, familyName } = profile.name;
            User.create({
              firstname: givenName,
              lastname: familyName,
              email: FacebookEmail,
              source: "facebook",
              password: "facebook"
            })
              .then(newUser => {
                console.log("user successfully created");
                return done(null, newUser);
              })
              .catch(err => {
                console.log("user not save ");
                return done(err);
              });
          }
        });
      }
    )
  );
  // passport.use(
  //   "facebookToken",
  //   new FacebookTokenStrategy(
  //     {
  //       clientID: process.env.FACEBOOK_CLIENT_ID,
  //       clientSecret: process.env.FACEBOOK_CLIENT_SECRET,

  //     },
  //     async (accessToken, refreshToken, profile, cb) => {
  //       try {
  //         const {
  //           name: { givenName, familyName },
  //           emails
  //         } = profile;
  //         const email = emails[0].value;
  //         const user = await User.findOne({ where: { email: email } });
  //         if (user) {
  //           return cb(null, user);
  //         }

  //         let newUser = await User.create({
  //           firstName: givenName,
  //           lastName: familyName,
  //           email: email,
  //           source: "facebook",
  //           password: "."
  //         });

  //         cb(null, newUser);
  //       } catch (err) {
  //         cb(err, false, err.message);
  //       }
  //     }
  //   )
  // );
};
