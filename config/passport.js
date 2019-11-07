const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const passportJWT = require('passport-jwt');
const ExtractJWT = passportJWT.ExtractJwt;
const JWTStrategy = passportJWT.Strategy;
//User model
const User = require('../models/User');
module.exports = function(passport) {
  passport.use(
    new JWTStrategy(
      {
        jwtFromRequest: ExtractJWT.fromHeader('x-auth-token'),
        secretOrKey: 'jwt-secret'
      },
      function(jwtPayload, cb) {
        //console.log('jwt payload', jwtPayload);
        //find the user in db if needed
        // return User.findOne({ user_id: jwtPayload.user.user_id })
        return User.findOne({
            where: {user_id: jwtPayload.user.id},
            //attributes: ['id', ['name', 'title']]
          })  
        .then(user => {
            if (!user) {
              return cb(null, false, {
                message:
                  'token is not valid please get another token by logging in!'
              });
            }
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
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
      //Match User
      User.findOne({ where: { email: email } })
        .then(user => {
          if (!user) {
            return done(null, false, {
              message: 'invalid username or password'
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
                message: 'invalid username or password'
              });
            }
          });
        })
        .catch(err => console.log(err));
    })
  );

  
};