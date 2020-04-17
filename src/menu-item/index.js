/**
 * WordPress dependencies
 */
import { __, _x } from "@wordpress/i18n";
import { menu as icon } from "@wordpress/icons";
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
	title: __("Skadi Menu Item"),
	description: __("Insert a menu item for navigation purposes"),
	icon,
	category: "common",
	keywords: [
		"menu", // "img" is not translated as it is intended to reflect the HTML <img> tag.
		__("item"),
	],
	supports: {
		lightBlockWrapper: true,
	},
	example: {
		attributes: {
			sizeSlug: "large",
			url: "https://s.w.org/images/core/5.3/MtBlanc1.jpg",
			// translators: Caption accompanying an image of the Mont Blanc, which serves as an example for the Image block.
			caption: __("Mont Blanc appears—still, snowy, and serene."),
		},
	},
	__experimentalLabel(attributes, { context }) {
		if (context === "accessibility") {
			const { caption, alt, url } = attributes;

			if (!url) {
				return __("Empty");
			}

			if (!alt) {
				return caption || "";
			}

			// This is intended to be read by a screen reader.
			// A period simply means a pause, no need to translate it.
			return alt + (caption ? ". " + caption : "");
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
