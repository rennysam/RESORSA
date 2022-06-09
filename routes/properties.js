const express = require("express");
const router = express.Router();
const properties = require("../controllers/properties");
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, isAuthor, validateProperty } = require("../middleware");
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });

const Property = require("../models/property");

router
  .route("/")
  .get(catchAsync(properties.index))
  .post(
    isLoggedIn,
    upload.array("image"),
    validateProperty,
    catchAsync(properties.createProperty)
  );

router.get("/new", isLoggedIn, properties.renderNewForm);

router
  .route("/:id")
  .get(catchAsync(properties.showProperty))
  .put(
    isLoggedIn,
    isAuthor,
    upload.array("image"),
    validateProperty,
    catchAsync(properties.updateProperty)
  )
  .delete(isLoggedIn, isAuthor, catchAsync(properties.deleteProperty));

router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(properties.renderEditForm)
);

module.exports = router;
