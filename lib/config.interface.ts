import { default as Joi } from 'joi';

export interface ConfigInterface {
	inputs: string[];
	variants?: {
		path: string;
		autoAddMonoVariant: boolean;
		monoVariantName: string
		monoVariableMap: {
			default: string,
			[key: string]: string,
		},
	},
	parser: {
		cssVariableAttribute: string;
		cssVariableRegex: RegExp;
		svgoPlugins?: string[];
		js2svg: Record<string, any>
	};
	writer: {
		constPrefix: string;
		assetInterfaceName: string;
		variantEnumName: string;
		typesFileName: string;
		barrelFileName: string;
	}
}

export const configValidator = Joi.object({
	inputs: Joi.array().required().items(Joi.string()),
	variants: Joi.object({
		path: Joi.string().required(),
		autoAddMonoVariant: Joi.boolean().required(),
		monoVariantName: Joi.string().optional(),
		monoVariableMap: Joi.object({
			default: Joi.string().required(),
		}).pattern(Joi.string(), Joi.string()),
	}).optional(),
	parser: Joi.object({
		cssVariableAttribute: Joi.string().required(),
		cssVariableRegex: Joi.string().required().custom((value) => new RegExp(value, "i")),
		svgoPlugins: Joi.array().optional().items(Joi.string()),
		js2svg: Joi.object().optional(),
	}),
	writer: {
		constPrefix: Joi.string().required(),
		assetInterfaceName: Joi.string().required(),
		variantEnumName: Joi.string().required(),
		typesFileName: Joi.string().required(),
		barrelFileName: Joi.string().required(),
	},
});
