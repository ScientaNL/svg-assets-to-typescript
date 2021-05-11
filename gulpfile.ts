import { src, dest } from "gulp";
import * as debug from "gulp-debug";
import * as plumber from 'gulp-plumber';
import * as minimist from 'minimist';
import { resolve, dirname, basename } from 'path';
import { configLoader } from "./lib/configLoader";
import { SvgParserPlugin } from "./lib/gulp/SvgParserPlugin";

const argv = minimist(process.argv);

const rcFilePath = resolve(argv.input);
const projectRootPath = dirname(rcFilePath);
const outputFilePath = resolve(argv.output);

const modelTemplatePath = resolve("resources/template.ejs");

const {config, variants} = configLoader(rcFilePath, projectRootPath);

process.chdir(projectRootPath);

exports.default = () => src(
	config.inputs.map((input) => `${resolve(projectRootPath, input)}/**/*.svg`)
).pipe(
	plumber()
).pipe(
	debug({title: "[svg - image]"})
).pipe(
	SvgParserPlugin.create(
		basename(outputFilePath),
		modelTemplatePath,
		config.parser,
		config.variants,
		config.writer,
		variants
	)
).pipe(
	debug({title: "[ts - model]"})
).pipe(
	dest(dirname(outputFilePath))
);
