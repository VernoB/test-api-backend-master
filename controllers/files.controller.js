/* eslint-disable no-ex-assign */
const crypto = require('crypto');
const fs = require('fs');
const jimp = require('jimp');
const path = require('path');

const config = require('../config');

const logger = require('../services/logger')(module);

const thumbSize = config.thumb_size;

module.exports = {
  saveImage,
  removeImage,
};

async function saveImage(req, res) {
  try {
    logger.info('File upload started');
    const file = req.files.file[0];
    const { user } = req;

    const fileExtention = path.extname(file.originalname).toLowerCase();
    const fileName = crypto.randomBytes(10).toString('hex');

    const uploadedFileName = fileName + fileExtention;
    const uploadedFileThumbName = `${fileName}_${thumbSize}x${thumbSize}${fileExtention}`;

    const tempFilePath = file.path;
    const targetFilePath = path.resolve(`${config.images_dir}${user}/${uploadedFileName}`);
    const targetThumbPath = path.resolve(`${config.images_dir}${user}/${uploadedFileThumbName}`);

    await _resize(tempFilePath, targetThumbPath)
      .catch((err) => {
        res.status(500);
        throw err;
      });

    await _rename(tempFilePath, targetFilePath)
      .catch((err) => {
        res.status(500);
        throw err;
      });

    logger.info('File upload successfully finished');

    return res.status(200).json({
      name: uploadedFileName,
      filepath: _getFileURL(req, uploadedFileName),
      thumbpath: _getFileURL(req, uploadedFileThumbName),
    });
  } catch (error) {
    logger.error(error);
    return res.json({ error });
  }
}

async function removeImage(req, res) {
  try {
    const { user } = req;
    const fileName = req.params.image_name;
    const filePath = path.resolve(`${config.images_dir}${user}/${fileName}`);
    await _remove(filePath).catch((err) => { logger.error(err); });

    const fileExtention = path.extname(fileName).toLowerCase();
    const _fileName = fileName.split('.').slice(0, -1).join('.');
    const thumbName = `${_fileName}_${thumbSize}x${thumbSize}${fileExtention}`;
    const thumbPath = path.resolve(`${config.images_dir}${user}/${thumbName}`);
    await _remove(thumbPath).catch((err) => { logger.error(err); });

    return res.status(200).end();
  } catch (error) {
    logger.error(error);
    return res.json({ error });
  }
}

async function _rename(temp, target) {
  return new Promise((resolve, reject) => {
    fs.rename(temp, target, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

async function _resize(file, filePath) {
  const image = await jimp.read(file);
  await image.resize(jimp.AUTO, 180);
  const w = image.bitmap.width;
  const h = image.bitmap.height;
  await image.crop((w - thumbSize) / 2, (h - thumbSize) / 2, thumbSize, thumbSize);
  await image.writeAsync(filePath);
}

async function _remove(file) {
  return new Promise((resolve, reject) => {
    fs.unlink(file, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

function _getFileURL(req, fileName) {
  const { port } = config;
  const { user } = req;
  const url = `${req.protocol}://${req.hostname}${port === '80' || port === '443' ? '' : `:${port}`}`;
  return `${url}/images/${user}/${fileName}`;
}
