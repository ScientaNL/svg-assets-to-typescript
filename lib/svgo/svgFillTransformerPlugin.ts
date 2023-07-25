import { CustomPlugin } from "svgo";

interface JSAPI {
	type: "element" | "instruction" | "doctype" | "root" | "text" | "cdata" | "comment";
	name: string;
	attributes?: {
		[key: string]: any;
		style?: string
	};
}

export type PluginConfigType = {
	defaultVariant: Record<string, string>;
	cssVariableAttribute: string,
	cssVariableRegex: RegExp
}

export const svgFillTransformerPlugin: CustomPlugin<PluginConfigType> = {
	name: 'customPluginName',
	type: 'perItem',
	fn: (ast: JSAPI, params, info) => {
		const cssVariable = extractCssVariableName(ast?.attributes, params);
		const defaultVariantMap = params.defaultVariant;

		if (!cssVariable || !ast?.attributes?.style) {
			return;
		}

		ast.attributes.style = ast.attributes.style.replace(
			/(fill:\s*?)(\#[a-f0-9]{3,8}|[a-z]+|rgba?\([\d, .]+\)|url?\(#[a-z0-9_-]+\))(;|$)/img,
			(match, prefix, color, suffix): string => {
				if (!defaultVariantMap.hasOwnProperty(cssVariable)) {
					defaultVariantMap[cssVariable] = color;
				}

				return `${prefix}var(${cssVariable},${color})${suffix}`;
			}
		);
	}
};

const extractCssVariableName = (attributes, config: PluginConfigType): string | false => {
	if (!config.cssVariableRegex) {
		throw new Error("No css variable name retrieval regex added");
	} else if (!config.cssVariableAttribute) {
		throw new Error("No css variable property added");
	} else if (!(attributes?.[config.cssVariableAttribute])) {
		return false;
	}

	const match = config.cssVariableRegex.exec(attributes?.[config.cssVariableAttribute] || '');

	return (match) ? match[1] : false;
};
