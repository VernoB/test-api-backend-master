const { validationResult } = require("express-validator");

const logger = require("../services/logger")(module);
const Company = require("../models/company.model");
const config = require("../config");
const validateCheck = require("../services/validation.service");
const { findById, enumStatus } = require("../services/company.service");

module.exports = {
  get,
  getCompanies,
  update,
  del,
  createCompany,
};

const company = {
  id: config.company_id,
  contactId: config.contact_id,
  name: "ООО Фирма «Перспективные захоронения»",
  shortName: "Перспективные захоронения",
  businessEntity: "ООО",
  contract: {
    no: "12345",
    issue_date: "2015-03-12T00:00:00Z",
  },
  type: ["agent", "contractor"],
  status: "active",
  createdAt: "2020-11-21T08:03:00Z",
  updatedAt: "2020-11-23T09:30:00Z",
};

async function get(req, res, next) {
  logger.info("Fetching the company ...");
  const errorValidation = validationResult(req);
  const companyId = req.params.id;

  if (!validateCheck(errorValidation)) {
    logger.error(`error in the validation process`);
    return res.status(400).json({ errorValidation: errorValidation.array() });
  }

  findById(companyId)
    .populate({
      path: "contact",
      select: "-_id firstname lastname phone email patronymic",
    })
    .then((company) => {
      console.log(company);
      if (!company) {
        return res
          .status(404)
          .json({ error: "Company not founded in the database" });
      }
      logger.info("Company suceessfully fetching");
      return res.status(200).json(company);
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
}

async function getCompanies(req, res, next) {
  logger.info("Fetching the companies ...");
  const { status, type, name, createAt } = req.query;
  const page = parseInt(req.params.page) || 1;
  const limit = parseInt(req.params.limit) || 2;
  let query = {};

  if (status) query.status = status;
  if (type) query.type = type;
  if (name) query.name = { $regex: name };
  //expect date to be on format YYY-MMM-DDD
  if (createAt)
    query.createAt = { $eq: new Date(new Date(createAt)).setHours(00, 00, 00) };

  Company.find({ $and: [query] })
    .populate("contact", "-_id lastname firstname email phone patronymic")
    .skip((page - 1) * limit)
    .limit(limit)
    .exec((err, companies) => {
      if (err) res.status(404).json({ error: err });
      else {
        Company.estimatedDocumentCount({ $and: [query] }).exec(
          (err, countDoc) => {
            if (err) res.status(404).json({ error: err });

            if (companies.length === 0) {
              return res
                .status(201)
                .json({ message: "no companies in the current page" });
            }
            logger.info("Companies successfully fetching.");
            return res.status(200).json({
              message: "Fetched companies successfully",
              companies,
              totalItems: countDoc,
            });
          }
        );
      }
    });
}

async function createCompany(req, res, next) {
  logger.info("In progress to create new company ...");
  const { name, shortName, businessEntity, contract, type, contact } = req.body;
  const URL = _getCurrentURL(req);
  const errorValidation = validationResult(req);

  console.log(req.body.shortName);

  if (!validateCheck(errorValidation)) {
    logger.error(`error in the validation process`);
    res.status(400).json({ errorValidation: errorValidation.array() });
  }

  const company = new Company({
    name,
    shortName,
    businessEntity,
    contract,
    type,
    status: enumStatus.ACTIVE,
    contact,
  });

  company.photos = [
    {
      name: "0b8fc462dcabf7610a91.png",
      filepath: `${URL}0b8fc462dcabf7610a91.png`,
      thumbpath: `${URL}0b8fc462dcabf7610a91_160x160.png`,
    },
  ];

  try {
    return await company.save().then((company) => {
      logger.info("Company successfully create");
      res
        .status(201)
        .json({
          message: "Company created successfully",
          company,
        })
        .end();
    });
  } catch (error) {
    if (error.code === 11000) {
      logger.error(" Company name already exits in the database");
      return res.status(404).json({
        error: "Company already exits",
      });
    } else {
      logger.error(error);
      return res
        .status(500)
        .json({ error: "Error occured in company creation" });
    }
  }
}

async function update(req, res, next) {
  logger.info("Update company ...");
  const companyId = req.params.id;
  const URL = _getCurrentURL(req);
  const { name, shortName, businessEntity, contract, type, contact } = req.body;

  const errorValidation = validationResult(req);

  if (!validateCheck(errorValidation)) {
    logger.error(`error in the validation process`);
    res.status(400).json({ errorValidation: errorValidation.array() });
  }

  // const updatedCompany = { ...company };
  findById(companyId)
    .then((company) => {
      if (!company) {
        return res.status(404).json(`Company not found`).end();
      }

      company.name = name;
      company.shortName = shortName;
      company.contract = contract;
      company.businessEntity = businessEntity;
      company.status = enumStatus.MODIFY;
      company.type = type;
      company.contact = contact;
      company.photos = [
        {
          name: "0b8fc462dcabf7610a91.png",
          filepath: `${URL}0b8fc462dcabf7610a91.png`,
          thumbpath: `${URL}0b8fc462dcabf7610a91_160x160.png`,
        },
      ];

      return company.save();
    })
    .then((value) => {
      logger.info("Company successfully updated.");
      return res
        .status(200)
        .json({ message: "Company updaded", company: value });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
}

async function del(req, res, next) {
  logger.info("Delete company ...");
  const companyId = req.params.id;

  findById(companyId)
    .then((company) => {
      if (!company) {
        return res.status(404).json({ error: "Company not found" }).end();
      }
      return Company.findByIdAndRemove(companyId);
    })
    .then((result) => {
      logger.info("Company deleted syccessfully ...");
      return res.status(200).json({ message: "Deleted company" }).end();
    });
}

function _getCurrentURL(req) {
  const { port } = config;
  return `${req.protocol}://${req.hostname}${
    port === "80" || port === "443" ? "" : `:${port}`
  }/`;
}
