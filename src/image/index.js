/**
 * WordPress dependencies
 */
import { __, _x } from "@wordpress/i18n";
import { image as icon } from "@wordpress/icons";
import {
	registerBlockType,
	unstable__bootstrapServerSideBlockDefinitions, // eslint-disable-line camelcase
} from "@wordpress/blocks";

/**
 * Internal dependencies
 */

//  Import CSS.
import "./editor.scss";
import "./style.scss";

import edit from "./edit";
import metadata from "./block.json";
import save from "./save";
import transforms from "./transforms";

const { name } = metadata;

export { metadata, name };

export const settings = {
	title: __("Skadi Image"),
	description: __("Insert an image to make a visual statement."),
	icon,
	category: "common",
	keywords: [
		"img", // "img" is not translated as it is intended to reflect the HTML <img> tag.
		__("photo"),
	],
	supports: {
		lightBlockWrapper: true,
	},
	example: {
		attributes: {
			sizeSlug: "large",
			url: "https://s.w.org/images/core/5.3/MtBlanc1.jpg",
			// translators: Caption accompanying an image of the Mont Blanc, which serves as an example for the Image block.
		},
	},
	__experimentalLabel(attributes, { context }) {
		if (context === "accessibility") {
			const { alt, url } = attributes;

			if (!url) {
				return __("Empty");
			}

			if (!alt) {
				return "";
			}

			// This is intended to be read by a screen reader.
			// A period simply means a pause, no need to translate it.
			return alt;
		}
	},
	transforms,
	edit,
	save,
	// deprecated,
};

const registerBlock = (block) => {
	if (!block) {
		return;
	}
	const { metadata, settings, name } = block;
	if (metadata) {
		unstable__bootstrapServerSideBlockDefinitions({ [name]: metadata });
	}
	registerBlockType(name, settings);
};

registerBlock({ metadata, settings, name });
