import { default as Joi } from 'joi';

// A plugin by name, or by name with its params, as svgo takes it
export type SvgoPluginConfig = string | { name: string; params?: Record<string, unknown> };

export interface ConfigInterface {
	inputs: string[];
	parser: {
		cssVariableAttribute: string;
		cssVariableRegex: RegExp;
		svgoPlugins?: SvgoPluginConfig[];
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
		svgoPlugins: Joi.array().optional().items(Joi.alternatives().try(
			Joi.string(),
			Joi.object({
				name: Joi.string().required(),
				params: Joi.object().optional(),
			}),
		)),
		js2svg: Joi.object().optional(),
	}),
	writer: {
		constPrefix: Joi.string().required(),
		assetInterfaceName: Joi.string().required(),
		typesFileName: Joi.string().required(),
		barrelFileName: Joi.string().required(),
	},
});
