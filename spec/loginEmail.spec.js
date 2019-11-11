// var Request = require("request");
var request=require('supertest');
var app = require("../app");
describe("Server", () => {
  beforeAll(() => {
    
  });
  afterAll(() => {
  });
  describe('Sign User', function(){
      it("Should Create an account",(done)=>{
        var user={
	        "email":"test8@test.com",
	        "password":"password"
        };
        request(app)
            .post('/auth/email/signin')
            .send(user)
            .expect(200,done)
      })
  })
});
