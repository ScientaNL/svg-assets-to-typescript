import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { parse as parseYaml } from "yaml";
import { ConfigInterface, configValidator } from "./ConfigInterface";
import { AssetsVariantsInterface, variantListValidator } from "./VariantListInterface";

export const configLoader = (
	configFile: string,
	projectRootPath: string
): { config: ConfigInterface, variants: AssetsVariantsInterface } => {
	if (!existsSync(configFile)) {
		throw new Error(`Could not find rcFile '${configFile}'`);
	}

	const validatedConfig = configValidator.validate(
		parseYaml(
			readFileSync(configFile, 'utf-8')
		)
	);

	if (validatedConfig.error instanceof Error) {
		throw validatedConfig.error;
	}

	const config: ConfigInterface = validatedConfig.value;

	return {
		config,
		variants: config.variants
			? variantsLoader(join(projectRootPath, config.variants.path))
			: {}
	};
};

const variantsLoader = (variantsFile: string): AssetsVariantsInterface => {
	if (!existsSync(variantsFile)) {
		throw new Error(`Could not find variantsFile '${variantsFile}'`);
	}

	return variantListValidator.validate(
		parseYaml(
			readFileSync(variantsFile, 'utf-8')
		)
	).value;
};
