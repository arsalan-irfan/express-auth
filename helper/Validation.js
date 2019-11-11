const Joi = require("@hapi/joi");

const schema = Joi.object({
  firstname: Joi.string().required(),

  lastname: Joi.string(),

  password: Joi.string()
  .alphanum()
  .required()
  .min(6),

  repeat_password: Joi.ref("password"),

  source: Joi.string().required(),

  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
    .required()
});
module.exports=schema


