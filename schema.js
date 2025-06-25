// const Joi = require("joi");

// const listingSchema = Joi.object({
//   listing: Joi.object({
//     title: Joi.string().required().messages({
//       "string.empty": "Title is required"
//     }),
//     description: Joi.string(),
//     image: Joi.string().uri().allow("",null), // if it's a URL string
//     price: Joi.number().min(0).required(),
//     location: Joi.string().allow(""),
//     country: Joi.string().allow("")
//   }).required()
// });

// module.exports = listingSchema;


// module.exports.reviewSchema = Joi.object({
//   review: Joi.object({
//     comment: Joi.string().required(),
//     rating: Joi.number().min(1).max(5).required()
//   }).required()
// });

// utils/joiSchema.js
const Joi = require("joi");

const listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required().messages({
      "string.empty": "Title is required"
    }),
    description: Joi.string(),
    image: Joi.string().uri().allow("", null),
    price: Joi.number().min(0).required(),
    location: Joi.string().allow(""),
    country: Joi.string().allow("")
  }).required()
});

const reviewSchema = Joi.object({
  review: Joi.object({
    comment: Joi.string().required(),
    rating: Joi.number().min(1).max(5).required()
  }).required()
});

module.exports = { listingSchema, reviewSchema };
