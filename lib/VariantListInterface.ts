import { object, string } from 'joi';

export interface AssetsVariantsInterface {
	[index: string]: VariantsInterface;
}

export interface VariantsInterface {
	[index: string]: VariantType;
}

export type VariantType = Record<string, string>;

export const variantListValidator = object().pattern(
	string(),
	object().required().pattern(
		string(),
		object().required().pattern(
			string(),
			object()
		)
	)
);
