import { type Config as SvgoConfig, optimize as optimizeSvg } from 'svgo';
import { ConfigInterface } from "./config.interface";
import { PluginConfig, svgFillTransformerPlugin } from './svgo/svg-fill-transformer-plugin';

type ParsedSvgType = { svg: string };

export class SvgParser {
	constructor(private readonly config: ConfigInterface["parser"]) {
	}

	public parseImage(inputSvg: string): ParsedSvgType {
		const outputSvg = optimizeSvg(
			inputSvg,
			{
				multipass: true,
				plugins: [
					{
						...svgFillTransformerPlugin,
						params: {
							"cssVariableAttribute": this.config.cssVariableAttribute,
							"cssVariableRegex": this.config.cssVariableRegex,
						} as PluginConfig,
					} as any, // Too bad typings are not correct
					// svgo validates the plugin names and params itself when it runs
					...(this.config?.svgoPlugins ?? []) as NonNullable<SvgoConfig['plugins']>,
				],
				js2svg: this.config?.js2svg,
			},
		).data;

		if (!outputSvg) {
			const error = new Error(`Cannot convert SVG`);
			error.name = "convertError";
			throw error;
		}

		return {
			svg: outputSvg,
		};
	}
}
