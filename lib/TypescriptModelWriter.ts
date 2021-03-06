import { basename, dirname, join, sep } from "path";
import { upperFirst } from "lodash";
import { renderFile } from 'ejs';
import * as jsesc from 'jsesc';
import { ConfigInterface } from "./ConfigInterface";
import { VariantsInterface } from "./VariantListInterface";

type AssetType = { name: string, path: string, svg: string, variants?: VariantsInterface };
type AssetMapType = Map<string, AssetType>;

export class TypescriptModelWriter {
	private readonly map: AssetMapType = new Map();

	constructor(
		private readonly templatePath: string,
		private readonly config: ConfigInterface["writer"],
		private readonly deducedVariantNames: string[]
	) {
	}

	public add(imagePath: string, svg: string, variants?: VariantsInterface) {
		const assetNameParts = TypescriptModelWriter.getImageImageNameParts(imagePath);
		const assetName = assetNameParts.join("-");
		const constName = `${this.config.constPrefix}_${assetNameParts.join("_")}`;

		const data: AssetType = {
			name: assetName,
			path: imagePath,
			svg: svg.trim()
		};

		if (variants) {
			data.variants = variants;
		}

		this.map.set(constName, data);
	}

	private static getImageImageNameParts(imagePath): string[] {
		return join(
			dirname(imagePath),
			basename(imagePath, ".svg")
		).split(sep).map((value) => {
			//Get a camelcase with respect for capitalized parts
			return value.split(/[-_]/).map((part, i) => i ? upperFirst(part) : part).join("");
		});
	}

	public async generate(): Promise<string> {
		return await renderFile(
			this.templatePath,
			{
				assets: this.map,
				config: this.config,
				variantNames: this.deducedVariantNames,
				serialize: (value: AssetType) => {
					value = {...value};
					delete value.path;

					const serialized = jsesc(
						value,
						{compact: false, quotes: "backtick", "indent": '  '}
					);
					return serialized.replaceAll(
						/`(.*?)`(?=:\s{0,1}(?:true|false|null|undefined|[\[{"'`]|[0-9]))/g,
						(match, key: string) => {
							key = key.replaceAll("\\`", "`");

							return (key.match(/^[a-z0-9_]*$/))
								? key
								: JSON.stringify(key);
						}
					);
				}
			}
		);
	}
}
