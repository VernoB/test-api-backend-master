const chai = require("chai");
const sinon = require("sinon");
const haiHttp = require("chai-http");
const chaiSinon = require("chai-sinon");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const config = require("../config.json");
const User = require("../models/user.model");
const authController = require("../controllers/auth.controller");
const { validatePassword } = require("../services/validate-password.services");
const chaiHttp = require("chai-http");
const server = require("../server");

const expect = chai.expect;
chai.use(chaiSinon);
chai.use(chaiHttp);

describe("auth Controller - Login", function () {
  beforeEach(function (done) {
    const user = new User({
      username: "test",
      password: "tester",
      _id: "5c0f66b979af55031b34728a",
    });
    user.save(function (err) {
      done();
    });
  });

  afterEach(function (done) {
    User.collection.drop().then(() => {
      //
    });
    done();
  });
  after(function () {
    return mongoose.disconnect();
  });

  // it("should send a response with a valid user", function (done) {
  //   const req = {
  //     username: "test",
  //     password: "tester",
  //   };

  //   const res = {
  //     statusCode: 500,
  //     status: (code) => {
  //       this.statusCode = code;
  //       return this;
  //     },
  //     json: {
  //       token,
  //       userId,
  //     },
  //   };

  //   sinon.stub(jwt, "sign");

  //   token = jwt.sign.returns(
  //     {
  //       userId: xyz,
  //       username,
  //     },
  //     config.app,
  //     { expiresIn: config.jwt_ttl }
  //   );

  //   authController
  //     .login(req, res, () => {})
  //     .then(() => {
  //       expect(res.statusCode).to.be.equal(200);
  //       expect(jwt.sign.called).to.have.calledOnce;
  //       expect(res.json).to.have.been.calledWith("token");
  //       // expect(res.use)
  //       // expect(validatePassword).to.exist;
  //       done();
  //     });

  //   jwt.sign.restore();
  // });

  it("should throw an error if database accessing fails with code 500", function (done) {
    sinon.stub(User, "findOne");
    User.findOne.throws();
    const req = {
      query: {
        username: "",
        password: "",
      },
    };

    authController
      .login(req, {}, () => {})
      .then((result) => {
        expect(result).to.be.an("error");
        expect(result).to.have.property("statusCode", 500);
      })
      .then(() => {
        done();
      });

    User.findOne.restore();
  });

  it("should signup new user in the /auth/signup", function () {
    sinon.stub(bcrypt, "hash").callsFake();

    chai
      .request(server)
      .post("/auth/signup")
      .send({ username: "Verno ", password: "verno" })
      .end(function (err, res) {
        expect(res.status).to.be.equal(201);
        expect(bcrypt.hash.called).to.have.been.calledOnce;
        expect(res).to.be.json;
        expect(res.body).to.have.a("object");
        expect(res.body).to.have.property("status");
        expect(res.body.username).to.have.equal("Verno");
        done();
      });
    bcrypt.hash.restore();
  });
});
