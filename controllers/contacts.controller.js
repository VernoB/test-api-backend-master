const Contact = require("../models/contact.model");
const assert = require("assert");

const config = require("../config");
const logger = require("../services/logger")(module);
const validateCheck = require("../services/validation.service");
const { validationResult } = require("express-validator");
const { findById } = require("../services/contact.service");
const companyModel = require("../models/company.model");

let contactSession = null,
  companySession = null;

module.exports = {
  get,
  update,
  createContact,
  deleteContact,
};

const contact = {
  id: config.contact_id,
  lastname: "Григорьев",
  firstname: "Сергей",
  patronymic: "Петрович",
  phone: "79162165588",
  email: "grigoriev@funeral.com",
  createdAt: "2020-11-21T08:03:26.589Z",
  updatedAt: "2020-11-23T09:30:00Z",
};

async function get(req, res, next) {
  const contactId = req.params.id;
  const errorValidation = validationResult(req);

  if (!validateCheck(errorValidation)) {
    logger.error(`error in the validation process`);
    return res.status(400).json({ errorValidation: errorValidation.array() });
  }

  findById(contactId)
    .then((contact) => {
      console.log("here");
      if (!contact) {
        res.status(404).json("contact not found").end();
        return;
      }

      logger.info(`fetch contact with id ${contactId}`);
      return res.status(200).json(contact).end();
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
}

async function createContact(req, res) {
  logger.info(`Creation of new contact ...`);
  const { lastname, firstname, patronymic, phone, email } = req.body;

  const errorValidation = validationResult(req);

  if (!validateCheck(errorValidation)) {
    logger.error(`error in the validation process`);
    res.status(400).json({ errorValidation: errorValidation.array() });
    return;
  }

  try {
    const contact = new Contact({
      lastname,
      firstname,
      patronymic,
      phone,
      email,
    });

    return await contact.save().then((result) => {
      logger.info(`Contact was created successfully with id ${result._id}`);
      res.status(201).json({ message: "Contact created!", result }).end();
    });
  } catch (error) {
    if (error.code === 11000) {
      logger.error(" email already exits in the database");
      return res.status(404).json({
        error: " email already exits",
      });
    } else {
      logger.error(error);
      return res
        .status(500)
        .json({ error: "Error occured in contact creation" });
    }
  }
}

async function update(req, res) {
  logger.info("Update contact ...");
  const { lastname, firstname, patronymic, phone, email } = req.body;
  const contactId = req.params.id;
  console.log(contactId, lastname, req.body);
  const errorValidation = validationResult(req);

  if (!validateCheck(errorValidation)) {
    logger.error(`error in the validation process`);
    return res.status(400).json({ errorValidation: errorValidation.array() });
  }

  findById(contactId)
    .then((contactResult) => {
      if (!contactResult) {
        return res.status(404).json(`Contact not found`).end();
      }
      contactResult.firstname = firstname;
      contactResult.lastname = lastname;
      contactResult.patronymic = patronymic;
      contactResult.email = email;
      contactResult.phone = phone;

      return contactResult.save();
    })
    .then((value) => {
      logger.info("Contact successfully updated ...");
      return res
        .status(200)
        .json({ message: "Contact updaded", contact: value });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
}

async function deleteContact(req, res, next) {
  logger.info("Delete contact ...");
  const { id } = req.params;

  const errorValidation = validationResult(req);

  if (!validateCheck(errorValidation)) {
    logger.error("Error in the validation process");
    res.status(404).json({ error: "error occured in the field validation" });
    return;
  }

  return findById(id)
    .then((contact) => {
      if (!contact) {
        logger.info(`contact with id ${id} not found in the database`);
        res.status(404).json({ message: "contact not found" }).end();
        return;
      }

      return Contact.findByIdAndRemove(id);
      // return id;
    })
    .then((result) => {
      console.log("here1");
      return companyModel.findOne({ contact: id }, "contact");
    })
    .then((company) => {
      company.contact.pull(id);
      return company.save();
      // return companies.forEach((item) => {
      //   companyModel.findOneAndUpdate(
      //     { contact: id },
      //     { $pull: { contact: { _id: id } } },
      //     { new: true, rawResult: true }
      //   );
      // });
    })
    .then((data) => {
      console.log("here", data);
      res.status(200).json({
        message: "Company update, contact deleted ...",
        company: data,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
}

// findById = async (id) => await Contact.findById(id);
