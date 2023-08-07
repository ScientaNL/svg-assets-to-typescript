import { dest, src } from "gulp";
import { default as debug } from "gulp-debug";
import { default as plumber } from 'gulp-plumber';
import { default as minimist } from 'minimist';
import { basename, dirname, resolve } from 'path';
import { configLoader } from "./lib/config-loader";
import { SvgParserPlugin } from "./lib/gulp/svg-parser-plugin";

const argv = minimist(process.argv);

const rcFilePath = resolve(argv.input);
const projectRootPath = dirname(rcFilePath);
const outputFilePath = resolve(argv.output);

const typesTemplatePath = resolve("resources/types.ejs");
const assetsTemplatePath = resolve("resources/assets.ejs");

const {config, variants} = configLoader(rcFilePath, projectRootPath);

process.chdir(projectRootPath);

exports.default = () => src(
	config.inputs.map((input) => `${resolve(projectRootPath, input)}/**/*.svg`),
	{base: projectRootPath},
).pipe(
	plumber(),
).pipe(
	debug({title: "[svg - image]"}),
).pipe(
	SvgParserPlugin.create(
		basename(outputFilePath),
		{assets: assetsTemplatePath, types: typesTemplatePath},
		config.parser,
		config.variants,
		config.writer,
		variants,
	),
).pipe(
	debug({title: "[ts - model]"}),
).pipe(
	dest(dirname(outputFilePath)),
);
