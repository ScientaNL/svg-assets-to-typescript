import { Transform } from "stream";
import { obj, TransformCallback } from "through2";
import { default as File } from "vinyl";
import { ConfigInterface } from "../config.interface";
import { SvgParser } from "../svg-parser";
import { TypescriptModelWriter } from "../typescript-model-writer";

export class SvgParserPlugin {
	public static create(
		outputPath: string,
		templatePaths: { assets: string, types: string, barrel: string },
		parserConfig: ConfigInterface["parser"],
		writerConfig: ConfigInterface["writer"],
	): Transform {
		const svgParser = new SvgParser(parserConfig);

		const writer = new TypescriptModelWriter(
			templatePaths,
			writerConfig,
		);

		const plugin = new SvgParserPlugin(svgParser, writer, outputPath);

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
		);
	};

	public async* generate(): AsyncGenerator<File> {
		for await(const file of this.writer.generate()) {
			file.path = `${this.outputPath}/${file.path}`;

			yield file;
		}
	}
}
