import * as Joi from "joi"


export const validate_demo_request = Joi.object().keys({
    some_data: Joi.string().min(5),
})
