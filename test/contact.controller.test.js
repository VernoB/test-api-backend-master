const sinon = require("sinon");
const chai = require("chai");
const chaiSinon = require("chai-sinon");

const Contact = require("../models/contact.model");
const contactController = require("../controllers/contacts.controller");

const expect = chai.expect;
chai.use(chaiSinon);

describe("Contact controller", () => {
  //   before(function (done) {
  //     const contact = new Contact({
  //       id: "62a080d3bf0e6fa3f59d860d",
  //       lastname: "Григорьев",
  //       firstname: "Сергей",
  //       patronymic: "Петрович",
  //       phone: "79162165588",
  //       email: "grigoriev@funeral.com",
  //     });

  //     contact.save().then(() => {});
  //     done();
  //   });

  //   before(function (done) {
  //     Contact.collection.drop().then(() => {
  //       done();
  //     });
  //   });

  it("should get contact with related id", function () {
    const spy = sinon.spy(Contact, "findById");

    const req = {
      params: {
        id: "62a080d3bf0e6fa3f59d860d",
      },
    };
    const res = {
      status: () => {},
      json: () => {},
    };

    contactController
      .get(req, res, () => {})
      .then(() => {
        expect(spy.calledOnce);
        expect(res).to.have.property("status");
        expect(res.status).to.be.equal(200);
        expect(res.json).to.have.property("contact").to.be.a("object");
      });
  });
});
