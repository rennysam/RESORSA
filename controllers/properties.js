const Property = require("../models/property");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require("../cloudinary");

module.exports.index = async (req, res) => {
  const properties = await Property.find({}).populate("popupText");
  res.render("properties/index", { properties });
};

module.exports.renderNewForm = (req, res) => {
  res.render("properties/new");
};

module.exports.createProperty = async (req, res, next) => {
  const geoData = await geocoder
    .forwardGeocode({
      query: req.body.property.location,
      limit: 1,
    })
    .send();
  const property = new Property(req.body.property);
  property.geometry = geoData.body.features[0].geometry;
  property.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  property.author = req.user._id;
  await property.save();
  console.log(property);
  req.flash("success", "Successfully made a new property!");
  res.redirect(`/properties/${property._id}`);
};

module.exports.showProperty = async (req, res) => {
  const property = await Property.findById(req.params.id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("author");
  if (!property) {
    req.flash("error", "Cannot find that property!");
    return res.redirect("/properties");
  }
  res.render("properties/show", { property });
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const property = await Property.findById(id);
  if (!property) {
    req.flash("error", "Cannot find that property!");
    return res.redirect("/properties");
  }
  res.render("properties/edit", { property });
};

module.exports.updateProperty = async (req, res) => {
  const { id } = req.params;
  console.log(req.body);
  const property = await Property.findByIdAndUpdate(id, {
    ...req.body.property,
  });
  const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
  property.images.push(...imgs);
  await property.save();
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await property.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
  }
  req.flash("success", "Successfully updated Property!");
  res.redirect(`/properties/${property._id}`);
};

module.exports.deleteProperty = async (req, res) => {
  const { id } = req.params;
  await Property.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted property");
  res.redirect("/properties");
};
