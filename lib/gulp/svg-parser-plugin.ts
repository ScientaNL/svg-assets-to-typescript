import { blue, red } from "chalk";
import { warn } from "fancy-log";
import { Transform } from "stream";
import { obj, TransformCallback } from "through2";
import { default as File } from "vinyl";
import { ConfigInterface } from "../config.interface";
import { SvgParser } from "../svg-parser";
import { TypescriptModelWriter } from "../typescript-model-writer";
import { AssetsVariantsInterface } from "../variant-list.interface";
import { VariantsManager } from "../variants-manager";

export class SvgParserPlugin {
	public static create(
		outputPath: string,
		templatePaths: { assets: string, types: string, barrel: string },
		parserConfig: ConfigInterface["parser"],
		variantsConfig: ConfigInterface["variants"],
		writerConfig: ConfigInterface["writer"],
		variants: AssetsVariantsInterface,
	): Transform {
		const svgParser = new SvgParser(parserConfig);
		const variantsManager = new VariantsManager(
			variantsConfig,
			variants,
			(fileName: string, message: string) => warn(`[svg parser] ${blue(fileName)} - ${red(message)}`),
		);

		const writer = new TypescriptModelWriter(
			templatePaths,
			writerConfig,
			variantsManager.getVariantNames(),
		);

		const plugin = new SvgParserPlugin(svgParser, variantsManager, writer, outputPath);

		return obj(
			(file: File, enc: BufferEncoding, callback: TransformCallback): void => {
				try {
					plugin.transform(file);

					callback();
				} catch (error) {
					if (error instanceof Error && error.name === "convertError") {
						error.message = `Could not convert SVG ${file.relative}`;
					}

					callback(error);
				}
			},
			async function(this: Transform, flushCallback: () => void): Promise<void> {
				for await(const file of plugin.generate()) {
					this.push(file);
				}
				flushCallback();
			},
		);
	}

	private constructor(
		private readonly svgParser: SvgParser,
		private readonly variantsManager: VariantsManager,
		private readonly writer: TypescriptModelWriter,
		private readonly outputPath: string,
	) {
	}

	public transform = (file: File): void => {
		if (!file.isBuffer()) {
			return;
		}

		const parsedSvg = this.svgParser.parseImage(
			file.contents.toString("utf-8"),
		);

		this.writer.add(
			file.relative,
			parsedSvg.svg,
			this.variantsManager.getProcessedVariants(file.relative, parsedSvg.defaultVariant) ?? undefined,
		);
	};

	public async* generate(): AsyncGenerator<File> {
		for await(const file of this.writer.generate()) {
			file.path = `${this.outputPath}/${file.path}`;

			yield file;
		}
	}
}
