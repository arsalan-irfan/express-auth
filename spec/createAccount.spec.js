// var Request = require("request");
var request = require("supertest");
var app = require("../app");
var token;
describe("Server", () => {

  // describe("Create User", function() {
  // var originalTimeout;
  //   beforeEach(() => {
  //     originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
  //     jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000000;
  //   });
  //   afterEach(() => {
  //     jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
  //   });
  //   it("Should Create an account", done => {
  //     var user = {
  //       firstname: "test",
  //       lastname: "user5",
  //       email: "test9@test.com",
  //       password: "password",
  //       source: "email"
  //     };
  //     request(app)
  //       .post("/auth/email/signup")
  //       .send(user)
  //       .set("Accept", "application/json")
  //       .expect(200)
  //       .then(res => {
  //         console.log("login sucessfull !");
  //         token = res.body.token;
  //         done();
  //       });
  //   },5000);
  //   it("Should Login Successfully", done => {
  //     console.log(token);
  //     request(app)
  //       .get("/auth/profile")
  //       .set("x-auth-token", `${token}`)
  //       .expect(200)
  //       .then(res => {
  //         console.log("Profile Fetched sucessfully !");
  //         console.log(res.body);
  //         done();
  //       });
  //     done();
  //   });
  // });

  //Signin

  describe("Sign User", function() {
    var originalTimeout;
    beforeEach(() => {
      originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000000;
    });
    afterEach(() => {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });
    it("Should Login Successfully", done => {
      var user = {
        email: "test2@test.com",
        password: "password"
      };
      request(app)
        .post("/auth/email/signin")
        .set("Accept", "application/json")
        .send(user)
        .expect(200)
        .then(res => {
          console.log("login sucessfull !");
          if(res){
            token = res.body.token;
            console.log(token)
            done();
          }
          
        });
    }, 5000);
    it("Should Login Successfully", done => {
      console.log(token);
      request(app)
        .get("/auth/profile")
        .set("x-auth-token", `${token}`)
        .expect(200)
        .then(res => {
          console.log("Profile Fetched sucessfully !");
          console.log(res.body);
          done();
        });
      done();
    });
  });

});