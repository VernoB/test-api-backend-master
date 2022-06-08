const expect = require("chai").expect;
const sinon = require("sinon");
const jwt = require("jsonwebtoken");

const authMiddleware = require("../middleware/auth.middleware");

describe("auth middleware", () => {
  it("should thrown an error without authorization header", () => {
    const req = {
      header: null,
    };

    authMiddleware.bind(this, req, {}, (req, res) => {
      expect(res.statusCode).to.be.equal(401);
    });
  });

  it("should throw and error if the token cannot be verify", () => {
    const req = {
      headers: "Bearer xyz",
    };

    authMiddleware.bind(this, req, {}, (req, res) => {
      expect(res.body).to.equal("Not authorized");
    });
  });

  it("should yield userId after decoding the token", () => {
    const req = {
      headers: { authorization: "Bearer somesecretvalue" },
    };

    sinon.stub(jwt, "verify");
    jwt.verify.returns({ userId: "abc" });

    authMiddleware(req, {}, () => {});

    expect(req).to.have.property("userId");
    expect(jwt.verify.called).to.be.true;
    expect(req).to.have.property("userId", "abc");

    jwt.verify.restore();
  });
});
