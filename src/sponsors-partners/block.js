/**
 * BLOCK: skadi-block
 *
 * Registering a basic block with Gutenberg.
 * Simple block, renders and saves the same content without any interactivity.
 */

//  Import CSS.
import "./editor.scss";
import "./style.scss";

import classnames from "classnames";

const { __ } = wp.i18n; // Import __() from wp.i18n
import { registerBlockType } from "@wordpress/blocks";
import {
	MediaUpload,
	BlockControls,
	AlignmentToolbar,
	RichText,
	InspectorControls,
	InnerBlocks,
} from "@wordpress/block-editor";
import { Button, PanelBody } from "@wordpress/components";
import { Fragment } from "@wordpress/element";

const ALLOWED_BLOCKS = ["core/image", "cgb/skadi-image"];

const sortOutCSSClasses = (className) => {
	const wrapClasses = classnames(className, "container");

	return wrapClasses;
};

const TEMPLATE = [
	[
		"core/columns",
		{},
		[
			["core/column", {}, [["core/image"]]],
			["core/column", {}, [["core/image"]]],
			["core/column", {}, [["core/image"]]],
		],
	],
	["cgb/skadi-divider", {}, []],
	[
		"core/columns",
		{},
		[
			["core/column", {}, [["core/image"]]],
			["core/column", {}, [["core/image"]]],
			["core/column", {}, [["core/image"]]],
			["core/column", {}, [["core/image"]]],
			["core/column", {}, [["core/image"]]],
		],
	],
];

/**
 * Register: aa Gutenberg Block.
 *
 * Registers a new block provided a unique name and an object defining its
 * behavior. Once registered, the block is made editor as an option to any
 * editor interface where blocks are implemented.
 *
 * @link https://wordpress.org/gutenberg/handbook/block-api/
 * @param  {string}   name     Block name.
 * @param  {Object}   settings Block settings.
 * @return {?WPBlock}          The block, if it has been successfully
 *                             registered; otherwise `undefined`.
 */
registerBlockType("cgb/skadi-sponsors-partners", {
	// Block name. Block names must be string that contains a namespace prefix. Example: my-plugin/my-custom-block.
	title: __("Skadi sponsors & partners"), // Block title.
	icon: "businessman", // Block icon from Dashicons → https://developer.wordpress.org/resource/dashicons/.
	category: "layout", // Block category — Group blocks together based on common traits E.g. common, formatting, layout widgets, embed.
	keywords: [
		__("skadi sponsors & partners"),
		__("CGB Example"),
		__("create-guten-block"),
	],

	/**
	 * The edit function describes the structure of your block in the context of the editor.
	 * This represents what the editor will render when the block is used.
	 *
	 * The "edit" property must be a valid function.
	 *
	 * @link https://wordpress.org/gutenberg/handbook/block-api/block-edit-save/
	 *
	 * @param {Object} props Props.
	 * @returns {Mixed} JSX Component.
	 */
	edit: ({ className }) => {
		const wrapClasses = sortOutCSSClasses(className);

		return (
			<div className={wrapClasses}>
				<h1>{__("Sponsoren & Partners")}</h1>
				<div className="row">
					<div className="col">
						<InnerBlocks template={TEMPLATE} />
					</div>
				</div>
			</div>
		);
	},

	/**
	 * The save function defines the way in which the different attributes should be combined
	 * into the final markup, which is then serialized by Gutenberg into post_content.
	 *
	 * The "save" property must be specified and must be a valid function.
	 *
	 * @link https://wordpress.org/gutenberg/handbook/block-api/block-edit-save/
	 *
	 * @param {Object} props Props.
	 * @returns {Mixed} JSX Frontend HTML.
	 */
	save: (props) => {
		const { className } = props;

		const wrapClasses = sortOutCSSClasses(className);

		return (
			<div className={wrapClasses}>
				<h1>{__("Sponsoren & Partners")}</h1>
				<div className="row">
					<div className="col">
						<InnerBlocks.Content />
					</div>
				</div>
			</div>
		);
	},
});
