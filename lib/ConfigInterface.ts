import { object, array, string, boolean } from 'joi';

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
		assetTypeName: string;
		assetInterfaceName: string;
		variantEnumName: string;
	}
}

export const configValidator = object({
	inputs: array().required().items(string()),
	variants: object({
		path: string().required(),
		autoAddMonoVariant: boolean().required(),
		monoVariantName: string().optional(),
		monoVariableMap: object({
			default: string().required(),
		}).pattern(string(), string()),
	}).optional(),
	parser: object({
		cssVariableAttribute: string().required(),
		cssVariableRegex: string().required().custom((value) => new RegExp(value, "i")),
		svgoPlugins: array().optional().items(string()),
		js2svg: object().optional()
	}),
	writer: {
		constPrefix: string().required(),
		assetTypeName: string().required(),
		assetInterfaceName: string().required(),
		variantEnumName: string().required(),
	}
});
