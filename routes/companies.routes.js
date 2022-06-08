const express = require("express");
const multer = require("multer");
const { param, validationResult, body } = require("express-validator");

const config = require("../config");
const { validateCheck } = require("../services/validation.service");
const fileHandler = multer({ dest: config.uploads_dir });
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const companiesController = require("../controllers/companies.controller");

const filesParamsValidator = require("../middleware/validators/files.params.validator");
const filesController = require("../controllers/files.controller");

//get company
router.get(
  "/:id",
  auth,
  param("id").trim().isString(),
  companiesController.get
);

router.get("/:page/:limit", auth, companiesController.getCompanies);

//Update Companies
router.patch(
  "/:id",
  auth,
  param("id").trim().isString().withMessage("Please  provide a correct id"),
  companiesController.update
);

//Create companies

router.post(
  "/",
  body("name")
    .not()
    .isEmpty()
    .withMessage("the name of company is required")
    .isLength({ min: 8 })
    .withMessage("the company name must be 8+ characters length"),
  body("shortName")
    .not()
    .isEmpty()
    .trim()
    .withMessage("The shortname can not be empty")
    .isLength({ min: 3 })
    .withMessage("Shortname too short, at least 3 characters is require"),
  auth,
  companiesController.createCompany
);

router.post(
  "/:id/image",
  auth,
  fileHandler.fields([{ name: "file", maxCount: 1 }]),
  filesParamsValidator.addCompanyImage,
  filesController.saveImage
);

router.delete(
  "/:id/image/:image_name",
  auth,
  companiesController.del,
  filesParamsValidator.removeCompanyImage,
  filesController.removeImage
);

module.exports = router;
