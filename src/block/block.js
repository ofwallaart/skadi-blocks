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
	ColorPalette,
} from "@wordpress/block-editor";
import { Button, PanelBody } from "@wordpress/components";
import { Fragment } from "@wordpress/element";

const sortOutCSSClasses = (alignment, className, mediaURL) => {
	const align = alignment ? alignment : "left";

	const imageClasses = classnames("col-md-3", { "no-img": !mediaURL });
	const textClasses = classnames("col");
	const rowClasses = classnames({ [`image-${align}`]: align }, "row", "flex");
	const wrapClasses = classnames(className, "container");

	return [imageClasses, textClasses, wrapClasses, rowClasses];
};

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
registerBlockType("cgb/block-skadi-block", {
	// Block name. Block names must be string that contains a namespace prefix. Example: my-plugin/my-custom-block.
	title: __("Skadi block"), // Block title.
	icon: "tagcloud", // Block icon from Dashicons → https://developer.wordpress.org/resource/dashicons/.
	category: "common", // Block category — Group blocks together based on common traits E.g. common, formatting, layout widgets, embed.
	keywords: [__("skadi block"), __("CGB Example"), __("create-guten-block")],
	attributes: {
		title: {
			type: "array",
			source: "children",
			selector: "h2",
		},
		mediaID: {
			type: "number",
		},
		mediaURL: {
			type: "string",
			source: "attribute",
			selector: "img",
			attribute: "src",
		},
		body: {
			type: "array",
			source: "children",
			selector: ".callout-body",
		},
		alignment: {
			type: "string",
		},
		overlayColor: {
			// new!
			type: "string",
			default: "#FAFAFA",
		},
	},

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
	edit: ({ attributes, className, isSelected, setAttributes }) => {
		const {
			mediaID,
			mediaURL,
			body,
			alignment,
			title,
			overlayColor,
		} = attributes;

		const onChangeTitle = (value) => {
			setAttributes({ title: value });
		};

		const onSelectImage = (media) => {
			setAttributes({
				mediaURL: media.url,
				mediaID: media.id,
			});
		};

		const onChangeBody = (value) => {
			setAttributes({ body: value });
		};

		const onOverlayColorChange = (changes) => {
			setAttributes({
				overlayColor: changes,
			});
		};

		const [
			imageClasses,
			textClasses,
			wrapClasses,
			rowClasses,
		] = sortOutCSSClasses(alignment, className, mediaURL);

		const colors = [
			{ name: "light grey (default)", color: "#FAFAFA" },
			{ name: "blue", color: "#1e3b70" },
			{ name: "light blue", color: "#B0CAFB" },
			{ name: "grey", color: "#C7C7C7" },
			{ name: "dark grey", color: "#7A7A7A" },
		];

		return [
			<InspectorControls>
				<PanelBody title={__("Overlay settings")}>
					<p>Select an overlay color:</p>
					<ColorPalette
						colors={colors}
						value={overlayColor}
						onChange={onOverlayColorChange}
					/>
				</PanelBody>
			</InspectorControls>,
			isSelected && (
				<BlockControls key="controls">
					<AlignmentToolbar
						value={alignment}
						onChange={(nextAlign) => {
							setAttributes({ alignment: nextAlign });
						}}
					/>
				</BlockControls>
			),
			<div className={wrapClasses} style={{ background: overlayColor }}>
				<div className={rowClasses}>
					<div className={imageClasses}>
						<MediaUpload
							onSelect={onSelectImage}
							type="image"
							value={mediaID}
							render={({ open }) => (
								<Button
									className={mediaID ? "image-button" : "button button-large"}
									onClick={open}
								>
									{!mediaID ? __("Upload Image") : <img src={mediaURL} />}
								</Button>
							)}
						/>
					</div>
					<div className={textClasses}>
						<RichText
							tagName="h2"
							placeholder={__("Write a title")}
							value={title}
							onChange={onChangeTitle}
						/>
						<RichText
							tagName="div"
							multiline="p"
							className="callout-body"
							placeholder={__("Write the body")}
							value={body}
							onChange={onChangeBody}
						/>
					</div>
				</div>
			</div>,
		];
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
		const {
			className,
			attributes: { title, mediaURL, body, alignment, overlayColor },
		} = props;

		const [
			imageClasses,
			textClasses,
			wrapClasses,
			rowClasses,
		] = sortOutCSSClasses(alignment, className, mediaURL);

		return (
			<div className={wrapClasses} style={{ background: overlayColor }}>
				<div className={rowClasses}>
					<div className={imageClasses}>
						{mediaURL && <img src={mediaURL} />}
					</div>
					<div className={textClasses}>
						{!RichText.isEmpty(title) && (
							<RichText.Content tagName="h2" value={title} />
						)}
						{!RichText.isEmpty(body) && (
							<RichText.Content
								className="callout-body"
								tagName="div"
								value={body}
							/>
						)}
					</div>
				</div>
			</div>
		);
	},
});
