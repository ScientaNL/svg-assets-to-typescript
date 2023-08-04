import { default as Joi } from 'joi';

export interface AssetsVariantsInterface {
	[index: string]: VariantsInterface;
}

export interface VariantsInterface {
	[index: string]: VariantType;
}

export type VariantType = Record<string, string>;

export const variantListValidator = Joi.object().pattern(
	Joi.string(),
	Joi.object().required().pattern(
		Joi.string(),
		Joi.object().required().pattern(
			Joi.string(),
			Joi.object(),
		),
	),
);
