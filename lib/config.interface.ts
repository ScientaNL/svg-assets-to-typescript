import { default as Joi } from 'joi';

export interface ConfigInterface {
	inputs: string[];
	parser: {
		cssVariableAttribute: string;
		cssVariableRegex: RegExp;
		svgoPlugins?: string[];
		js2svg: Record<string, any>
	};
	writer: {
		constPrefix: string;
		assetInterfaceName: string;
		typesFileName: string;
		barrelFileName: string;
	}
}

export const configValidator = Joi.object({
	inputs: Joi.array().required().items(Joi.string()),
	parser: Joi.object({
		cssVariableAttribute: Joi.string().required(),
		cssVariableRegex: Joi.string().required().custom((value) => new RegExp(value, "i")),
		svgoPlugins: Joi.array().optional().items(Joi.string()),
		js2svg: Joi.object().optional(),
	}),
	writer: {
		constPrefix: Joi.string().required(),
		assetInterfaceName: Joi.string().required(),
		typesFileName: Joi.string().required(),
		barrelFileName: Joi.string().required(),
	},
});
