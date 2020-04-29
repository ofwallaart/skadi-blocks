/**
 * BLOCK: skadi-block
 *
 * Registering a basic block with Gutenberg.
 * Simple block, renders and saves the same content without any interactivity.
 */

import classnames from "classnames";

//  Import CSS.
import "./editor.scss";
import "./style.scss";

const { __ } = wp.i18n; // Import __() from wp.i18n
import { registerBlockType } from "@wordpress/blocks";
import {
	RichText,
	AlignmentToolbar,
	BlockControls,
} from "@wordpress/block-editor";

const sortOutCSSClasses = (alignment, className) => {
	//default
	let titleClass = "order-left";

	if (alignment === "right") {
		titleClass = "order-right";
	}

	let wrapClass = classnames(className, "flex", "row");

	titleClass = classnames(titleClass, "col-md-12");

	const titleClasses = classnames(titleClass);

	return [titleClasses, wrapClass];
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

registerBlockType("cgb/block-text", {
	// Block name. Block names must be string that contains a namespace prefix. Example: my-plugin/my-custom-block.
	title: __("Skadi Text"), // Block title.
	icon: "universal-access-alt", // Block icon from Dashicons → https://developer.wordpress.org/resource/dashicons/.
	category: "common", // Block category — Group blocks together based on common traits E.g. common, formatting, layout widgets, embed.
	keywords: [__("skadi-text"), __("Skadi"), __("create-guten-block")],
	attributes: {
		title: {
			type: "array",
			source: "children",
			selector: ".text-title",
		},
		subtitle: {
			type: "array",
			source: "children",
			selector: ".text-subtitle",
		},
		body: {
			type: "array",
			source: "children",
			selector: ".text-block",
		},
		alignment: {
			type: "string",
			default: "left",
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
		const { body, alignment, title, subtitle } = attributes;

		const onChangeTitle = (value) => {
			setAttributes({ title: value });
		};

		const onChangeSubTitle = (value) => {
			setAttributes({ subtitle: value });
		};

		const onChangeBody = (value) => {
			setAttributes({ body: value });
		};

		const [titleClasses, wrapClass] = sortOutCSSClasses(alignment, className);

		return [
			isSelected && (
				<BlockControls key="controls">
					<AlignmentToolbar
						value={alignment}
						// alignmentControls={ALIGNMENT_CONTROLS}
						onChange={(nextAlign) => {
							setAttributes({ alignment: nextAlign });
						}}
					/>
				</BlockControls>
			),
			<div className={wrapClass} key="container">
				<div className={titleClasses}>
					<h3>
						<RichText
							tagName="span"
							placeholder={__("Write a title")}
							className="text-title"
							value={title}
							onChange={onChangeTitle}
						/>{" "}
						<RichText
							tagName="span"
							placeholder={__("Write a subtitle")}
							className="text-subtitle"
							value={subtitle}
							onChange={onChangeSubTitle}
						/>
					</h3>
				</div>
				<RichText
					tagName="div"
					multiline="p"
					className="text-block col-md-12"
					placeholder={__("Write a body")}
					value={body}
					onChange={onChangeBody}
				/>
			</div>,
		];
	},
	save: (props) => {
		const {
			className,
			attributes: { title, subtitle, body, alignment },
		} = props;

		const [titleClasses, wrapClass] = sortOutCSSClasses(alignment, className);

		return (
			// <div className="bootstrap-block">
			<div className={wrapClass}>
				<div className={titleClasses}>
					<h3>
						<RichText.Content
							tagName="span"
							className="text-title"
							value={title}
						/>{" "}
						<RichText.Content
							tagName="span"
							className="text-subtitle"
							value={subtitle}
						/>
					</h3>
				</div>
				<RichText.Content
					tagName="div"
					multiline="p"
					className="text-block col-md-12"
					value={body}
				/>
			</div>
			// </div>
		);
	},
});
