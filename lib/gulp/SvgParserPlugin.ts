import { red, blue } from "chalk";
import { warn } from "fancy-log";
import { obj, TransformCallback } from "through2";
import * as File from "vinyl";
import { Transform } from "stream";
import { ConfigInterface } from "../ConfigInterface";
import { SvgParser } from "../SvgParser";
import { TypescriptModelWriter } from "../TypescriptModelWriter";
import { IconsVariantsInterface } from "../VariantListInterface";
import { VariantsManager } from "../VariantsManager";

export class SvgParserPlugin {
	public static create(
		outputPath: string,
		templatePath: string,
		parserConfig: ConfigInterface["parser"],
		variantsConfig: ConfigInterface["variants"],
		writerConfig: ConfigInterface["writer"],
		variants: IconsVariantsInterface
	): Transform {
		const svgParser = new SvgParser(parserConfig);
		const variantsManager = new VariantsManager(
			variantsConfig,
			variants,
			(fileName: string, message: string) => 	warn(`[svg parser] ${blue(fileName)} - ${red(message)}`)
		);

		const writer = new TypescriptModelWriter(templatePath, writerConfig);

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
				const file = await plugin.generate();

				this.push(file);

				flushCallback();
			}
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
			file.contents.toString("utf-8")
		);

		this.writer.add(
			file.relative,
			parsedSvg.svg,
			this.variantsManager.getProcessedVariants(file.relative, parsedSvg.defaultVariant)
		);
	};

	public async generate(): Promise<File> {
		const template = await this.writer.generate();

		return new File({
			path: this.outputPath,
			contents: Buffer.from(template)
		});
	}
}
