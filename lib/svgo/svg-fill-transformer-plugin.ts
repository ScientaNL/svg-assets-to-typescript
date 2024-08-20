import { Plugin, XastElement, XastParent } from "svgo/lib/types";

export type PluginConfig = {
	cssVariableAttribute: string,
	cssVariableRegex: RegExp
}

export const svgFillTransformerPlugin: {
	name: string;
	fn: Plugin<PluginConfig>;
} = {
	name: 'customPluginName',
	fn: (ast, params: PluginConfig, info) => ({
		element: {
			enter: (ast: XastElement, parentNode: XastParent) => {
				const cssVariable = extractCssVariableName(ast?.attributes, params);

				if (!cssVariable || !ast?.attributes?.style) {
					return;
				}

				ast.attributes.style = ast.attributes.style.replace(
					/(fill:\s*?)(\#[a-f0-9]{3,8}|[a-z]+|rgba?\([\d, .]+\)|url?\(#[a-z0-9_-]+\))(;|$)/img,
					(match, prefix, color, suffix): string => `${prefix}var(${cssVariable},${color})${suffix}`,
				);
			},
		},
	}),
};

const extractCssVariableName = (attributes, config: PluginConfig): string | false => {
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
