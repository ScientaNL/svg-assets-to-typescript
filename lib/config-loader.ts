import { existsSync, readFileSync } from "fs";
import { parse as parseYaml } from "yaml";
import { ConfigInterface, configValidator } from "./config.interface";

export const configLoader = (
	configFile: string,
): ConfigInterface => {
	if (!existsSync(configFile)) {
		throw new Error(`Could not find rcFile '${configFile}'`);
	}

	const validatedConfig = configValidator.validate(
		parseYaml(
			readFileSync(configFile, 'utf-8'),
		),
	);

	if (validatedConfig.error instanceof Error) {
		throw validatedConfig.error;
	}

	return validatedConfig.value;
};
