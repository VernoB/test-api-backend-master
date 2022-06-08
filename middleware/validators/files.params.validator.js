/* eslint-disable no-ex-assign */
const fs = require('fs');
const path = require('path');
const config = require('../../config');

const logger = require('../../services/logger')(module);

module.exports = {
  addCompanyImage,
  removeCompanyImage,
};

function addCompanyImage(req, res, next) {
  try {
    if (!req?.files?.file?.[0]) {
      res.status(400);
      throw new Error('No file for upload passed');
    }

    if (!req?.params?.id) {
      res.status(400);
      throw new Error('No company ID passed for file upload');
    }

    if (req.params.id !== config.company_id) {
      res.status(404);
      throw new Error(`No company with ID ${req.params.id}`);
    }

    const file = req.files.file[0];
    const fileExtention = path.extname(file.originalname).toLowerCase();
    const tempFilePath = file.path;

    if (!(fileExtention === '.png' || fileExtention === '.jpg' || fileExtention === '.jpeg' || fileExtention === '.gif')) {
      _remove(tempFilePath).catch((err) => { logger.error(err); });
      res.status(400);
      throw new Error('Only image files are allowed');
    }
  } catch (error) {
    error = error.toString();
    logger.error(error);
    return res.json({ error });
  }

  return next();
}

function removeCompanyImage(req, res, next) {
  try {
    if (!req?.params?.id) {
      res.status(400);
      throw new Error('No company ID passed');
    }
    if (!req?.params?.image_name) {
      res.status(400);
      throw new Error('No image name passed');
    }
    if (req.params.id !== config.company_id) {
      res.status(404);
      throw new Error(`No company with ID ${req.params.id}`);
    }
    if (req.params.image_name === '0b8fc462dcabf7610a91.png') {
      return res.status(200).end();
    }
  } catch (error) {
    error = error.message;
    logger.error(error);
    return res.json({ error });
  }

  return next();
}

async function _remove(file) {
  return new Promise((resolve, reject) => {
    fs.unlink(file, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}
