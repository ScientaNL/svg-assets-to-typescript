import { ConfigInterface } from "./config.interface";
import { AssetsVariantsInterface, VariantsInterface, VariantType } from "./variant-list.interface";

export class VariantsManager {
	constructor(
		private readonly variantsConfig: ConfigInterface["variants"],
		private readonly variants: AssetsVariantsInterface,
		private readonly logger?: (file, message) => void,
	) {
	}

	public getVariants(assetPath: string): VariantsInterface {
		return this.variants[assetPath] || {};
	}

	public getVariantNames(): string[] {
		const variants: string[] = Object.values(this.variants).reduce(
			(names, icon) => names.concat(Object.keys(icon).filter(x => !names.includes(x))),
			[] as string[],
		);

		if (this.variantsConfig?.autoAddMonoVariant && this.variantsConfig.monoVariantName) {
			variants.push(this.variantsConfig.monoVariantName);
		}
		return variants;
	}

	public getProcessedVariants(
		assetPath: string,
		referenceVariant: VariantType,
	): VariantsInterface | null {
		const referenceVariables = Object.keys(referenceVariant);

		if (!referenceVariables.length) {
			return null;
		}

		const storedVariants = this.getVariants(assetPath);
		const mergedVariants = {};

		variantLoop:
		for (const [variant, variables] of Object.entries(storedVariants)) {
			const mergedVariant = {};
			for (const referenceVariable of referenceVariables) {
				if (variables[referenceVariable]) {
					mergedVariant[referenceVariable] = variables[referenceVariable];
				} else {
					this.logger?.(assetPath, `Could not find ${referenceVariable} on ${variant}. Skipping variant.`);
					continue variantLoop;
				}
			}

			mergedVariants[variant] = mergedVariant;
		}

		if (this?.variantsConfig && this.variantsConfig.autoAddMonoVariant) {
			const variableMap = this.variantsConfig.monoVariableMap;

			const monoVariant = {};
			for (const referenceVariable of referenceVariables) {
				monoVariant[referenceVariable] = variableMap[referenceVariable] ?? variableMap['default'] ?? "currentColor";
			}

			mergedVariants[this.variantsConfig.monoVariantName] = monoVariant;
		}

		return Object.keys(mergedVariants).length
			? mergedVariants
			: null;
	}
}
