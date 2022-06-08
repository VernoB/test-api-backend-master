const chai = require("chai");
const chaiHttp = require("chai-http");
const chaiSinon = require("chai-sinon");
const sinon = require("sinon");
const mongoose = require("mongoose");

const Companies = require("../models/company.model");
const CompanyController = require("../controllers/companies.controller");
const { enumStatus } = require("../services/company.service");
const logger = require("../services/logger");
const server = require("../server");

const expect = chai.expect;
chai.use(chaiHttp);
chai.use(chaiSinon);

describe("Company Controller - Create company", function () {
  before(function (done) {
    server()
      .then(() => {
        const company = new Companies({
          name: "VALERRET",
          shortName: "ERRTA",
          businessEntity: "000",
          contract: {
            no: 1233,
            issue_date: "2015-03-12T00:00:00Z",
          },
          photos: [
            {
              name: "0b8fc462dcabf7610a91.png",
              filepath: `0b8fc462dcabf7610a91.png`,
              thumbpath: `0b8fc462dcabf7610a91_160x160.png`,
            },
          ],
          type: ["agent"],
          status: enumStatus.ACTIVE,
          contact: "123",
        });

        return company.save();
      })
      .then(() => {
        done();
      });
  });

  after(function (done) {
    Companies.collection
      .drop()
      .then(() => {
        return mongoose.disconnect();
      })
      .then(() => {
        done();
      });
  });

  it("should create a company without authorization", function (done) {
    // const req = {
    //   body: {
    //     name: "ООО Фирма «Перспективные захоронения»",
    //     shortName: "Перспективные захоронения",
    //     businessEntity: "ООО",
    //     contract: {
    //       no: "12345",
    //       issue_date: "2015-03-12T00:00:00Z",
    //     },
    //     type: ["agent", "contractor"],
    //     status: "active",
    //     photos: [
    //       {
    //         name: "0b8fc462dcabf7610a91.png",
    //         filepath: `0b8fc462dcabf7610a91.png`,
    //         thumbpath: `0b8fc462dcabf7610a91_160x160.png`,
    //       },
    //     ],
    //   },
    // };

    const res = {
      statusCode: 500,
      status: (code) => {
        this.statusCode = code;
        return this;
      },
      json: () => {
        message, company;
      },
    };

    CompanyController.createCompany(req, res, () => {}).then(() => {
      expect(res.json).to.have.property(
        "message",
        "Company created successfully"
      );
      expect(res.status).to.be.equal(200);
      expect(res.json.company).to.be.an("object");
      done();
    });
  });

  it("should throw an error if the company with same name exits", function (done) {
    const req = {
      body: {
        name: "ADFRE",
        shortName: "ANDRECHARN",
        businessEntity: "000",
        contract: ["commercial"],
        type: enumStatus.ACTIVE,
        contact: "5c0f66b979af55031b34728a",
        photos: [
          {
            name: "0b8fc462dcabf7610a91.png",
            filepath: `0b8fc462dcabf7610a91.png`,
            thumbpath: `0b8fc462dcabf7610a91_160x160.png`,
          },
        ],
      },
    };

    const res = {
      statusCode: 500,
      status: (code) => {
        this.statusCode = code;
        return this;
      },
      json: () => {
        error;
      },
    };

    CompanyController.createCompany(req, res, () => {}).then(() => {
      expect(res.status).to.be.equal(404);
      expect(res.json).to.be.property("error", "Company already exits");
      done();
    });
  });

  it("should create a new company with valid input with authorization", function (done) {
    chai
      .request(server)
      .post("/auth")
      .send({
        username: "Verno",
        password: "verno",
      })
      .end((err, res) => {
        expect(res.body).to.have.property("token");
        const token = res.body.token;

        chai
          .request(server)
          .post("/companies")
          .send({
            name: "VALLETR",
            shortName: "FRTS",
            businessEntity: "010",
            contract: {
              no: 1233,
              issue_date: "2015-03-12T00:00:00Z",
            },
            photos: [
              {
                name: "0b8fc462dcabf7610a91.png",
                filepath: `0b8fc462dcabf7610a91.png`,
                thumbpath: `0b8fc462dcabf7610a91_160x160.png`,
              },
            ],
            type: ["agent"],
            status: enumStatus.ACTIVE,
            contact: "123",
          })
          .set("Authorization", "JWT" + token)
          .end((err, resp) => {
            expect(resp.status).to.be.equal(201);
            expect(resp.json).to.have.property(
              "message",
              "Company created successfully"
            );
            expect(resp.json.company).to.be.a("object");
            done();
          });
      });
  });
});
