import { renderFile } from 'ejs';
import { default as jsesc } from 'jsesc';
import { default as upperFirst } from "lodash.upperfirst";
import { basename, dirname, join, sep } from "path";
import { ConfigInterface } from "./config.interface";
import { VariantsInterface } from "./variant-list.interface";

type AssetType = { name: string, path: string, svg: string, variants?: VariantsInterface };
type AssetMapType = Map<string, AssetType>;

export class TypescriptModelWriter {
	private readonly map: AssetMapType = new Map();

	constructor(
		private readonly templatePath: string,
		private readonly config: ConfigInterface["writer"],
		private readonly deducedVariantNames: string[],
	) {
	}

	public add(imagePath: string, svg: string, variants?: VariantsInterface) {
		const assetNameParts = TypescriptModelWriter.getImageImageNameParts(imagePath);
		const assetName = assetNameParts.join("-");
		const constName = `${this.config.constPrefix}_${assetNameParts.join("_")}`;

		const data: AssetType = {
			name: assetName,
			path: imagePath,
			svg: svg.trim(),
		};

		if (variants) {
			data.variants = variants;
		}

		this.map.set(constName, data);
	}

	private static getImageImageNameParts(imagePath): string[] {
		return join(
			dirname(imagePath),
			basename(imagePath, ".svg"),
		).split(
			sep,
		).map(
			// Get a camelcase with respect for capitalized parts
			(value) => value.split(/[-_]/).map((part, i) => i ? upperFirst(part) : part).join(""),
		);
	}

	public async generate(): Promise<string> {
		return await renderFile(
			this.templatePath,
			{
				assets: this.map,
				config: this.config,
				variantNames: this.deducedVariantNames,
				serialize: (value: AssetType) => {
					const data: Omit<AssetType, 'path'> = {name: value.name, svg: value.svg};
					if (value.variants) {
						data.variants = value.variants;
					}

					const serialized = jsesc(
						data,
						{compact: false, quotes: "backtick", "indent": '  '},
					);

					return serialized.replaceAll(
						/`(.*?)`(?=:\s{0,1}(?:true|false|null|undefined|[\[{"'`]|[0-9]))/g,
						(match, key: string) => {
							key = key.replaceAll("\\`", "`");

							return (key.match(/^[a-z0-9_]*$/))
								? key
								: JSON.stringify(key);
						},
					);
				},
			},
		);
	}
}
