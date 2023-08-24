import { renderFile } from 'ejs';
import { default as jsesc } from 'jsesc';
import { default as upperFirst } from "lodash.upperfirst";
import { basename, dirname, join, sep } from "path";
import { default as File } from "vinyl";
import { ConfigInterface } from "./config.interface";
import { VariantsInterface } from "./variant-list.interface";

type AssetType = { name: string, path: string, svg: string, variants?: VariantsInterface };
type AssetMapType = Map<string, AssetType>;

export class TypescriptModelWriter {
	private readonly map: AssetMapType = new Map();

	constructor(
		private readonly templatePaths: { assets: string, types: string, barrel: string },
		private readonly config: ConfigInterface["writer"],
		private readonly deducedVariantNames: string[],
	) {
	}

	public add(imagePath: string, svg: string, variants?: VariantsInterface) {
		const assetNameParts = TypescriptModelWriter.getImageImageNameParts(imagePath);

		const data: AssetType = {
			name: assetNameParts.join("_"),
			path: imagePath,
			svg: svg.trim(),
		};

		if (variants) {
			data.variants = variants;
		}

		this.map.set(`${this.config.constPrefix}_${data.id}`, data);
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

	public async* generate(): AsyncGenerator<File> {
		for (const [file, asset] of this.map.entries()) {
			yield new File({
				path: `${file}.ts`,
				contents: Buffer.from(
					await this.generateTemplate(new Map([[file, asset]]), this.templatePaths.assets),
				),
			});
		}

		yield new File({
			path: this.config.barrelFileName,
			contents: Buffer.from(
				await this.generateTemplate(this.map, this.templatePaths.barrel),
			),
		});

		yield new File({
			path: this.config.typesFileName,
			contents: Buffer.from(
				await this.generateTemplate(this.map, this.templatePaths.types),
			),
		});
	}

	private async generateTemplate(
		assets: AssetMapType,
		templatePath: string,
	): Promise<string> {
		return await renderFile(
			templatePath,
			{
				assets: assets,
				config: this.config,
				variantNames: this.deducedVariantNames,
				serialize: (value: AssetType) => {
					const data: Omit<AssetType, 'path'> = {
						name: value.name,
						svg: value.svg,
					};

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
				stripTsExtension: (fileName: string) => fileName.replace(/\.ts$/ig, ""),
			},
		);
	}
}
