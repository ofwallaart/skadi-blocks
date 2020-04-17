/**
 * External dependencies
 */
import classnames from "classnames";
import { get, filter, map, last, omit, pick } from "lodash";

/**
 * WordPress dependencies
 */
import { getBlobByURL, isBlobURL, revokeBlobURL } from "@wordpress/blob";
import {
	ExternalLink,
	PanelBody,
	Spinner,
	TextareaControl,
	TextControl,
	ToggleControl,
	ToolbarGroup,
	withNotices,
} from "@wordpress/components";
import { compose } from "@wordpress/compose";
import { withSelect, withDispatch } from "@wordpress/data";
import {
	BlockControls,
	BlockIcon,
	InspectorControls,
	InspectorAdvancedControls,
	MediaPlaceholder,
	MediaReplaceFlow,
	RichText,
	__experimentalBlock as Block,
	__experimentalImageSizeControl as ImageSizeControl,
	__experimentalImageURLInputUI as ImageURLInputUI,
} from "@wordpress/block-editor";
import { Component, Fragment } from "@wordpress/element";
import { __, sprintf } from "@wordpress/i18n";
import { getPath } from "@wordpress/url";
import { withViewportMatch } from "@wordpress/viewport";
import { image as icon } from "@wordpress/icons";

/**
 * Internal dependencies
 */
// import { createUpgradedEmbedBlock } from "../embed/util";
import ImageSize from "./image-size";
/**
 * Module constants
 */
import {
	MIN_SIZE,
	LINK_DESTINATION_MEDIA,
	LINK_DESTINATION_ATTACHMENT,
	ALLOWED_MEDIA_TYPES,
	DEFAULT_SIZE_SLUG,
} from "./constants";

export const pickRelevantMediaFiles = (image) => {
	const imageProps = pick(image, ["alt", "id", "link", "caption"]);
	imageProps.url =
		get(image, ["sizes", "large", "url"]) ||
		get(image, ["media_details", "sizes", "large", "source_url"]) ||
		image.url;
	return imageProps;
};

/**
 * Is the URL a temporary blob URL? A blob URL is one that is used temporarily
 * while the image is being uploaded and will not have an id yet allocated.
 *
 * @param {number=} id The id of the image.
 * @param {string=} url The url of the image.
 *
 * @return {boolean} Is the URL a Blob URL
 */
const isTemporaryImage = (id, url) => !id && isBlobURL(url);

/**
 * Is the url for the image hosted externally. An externally hosted image has no id
 * and is not a blob url.
 *
 * @param {number=} id  The id of the image.
 * @param {string=} url The url of the image.
 *
 * @return {boolean} Is the url an externally hosted url?
 */
const isExternalImage = (id, url) => url && !id && !isBlobURL(url);

export class ImageEdit extends Component {
	constructor() {
		super(...arguments);
		this.updateAlt = this.updateAlt.bind(this);
		this.onFocusCaption = this.onFocusCaption.bind(this);
		this.onImageClick = this.onImageClick.bind(this);
		this.onSelectImage = this.onSelectImage.bind(this);
		this.onSelectURL = this.onSelectURL.bind(this);
		this.updateImage = this.updateImage.bind(this);
		this.onSetHref = this.onSetHref.bind(this);
		this.onSetTitle = this.onSetTitle.bind(this);
		this.onSetShadow = this.onSetShadow.bind(this);
		this.getFilename = this.getFilename.bind(this);
		this.onUploadError = this.onUploadError.bind(this);
		this.onImageError = this.onImageError.bind(this);

		this.state = {
			captionFocused: false,
		};
	}

	componentDidMount() {
		const { attributes, mediaUpload, noticeOperations } = this.props;
		const { id, url = "" } = attributes;

		if (isTemporaryImage(id, url)) {
			const file = getBlobByURL(url);

			if (file) {
				mediaUpload({
					filesList: [file],
					onFileChange: ([image]) => {
						this.onSelectImage(image);
					},
					allowedTypes: ALLOWED_MEDIA_TYPES,
					onError: (message) => {
						noticeOperations.createErrorNotice(message);
					},
				});
			}
		}
	}

	componentDidUpdate(prevProps) {
		const { id: prevID, url: prevURL = "" } = prevProps.attributes;
		const { id, url = "" } = this.props.attributes;

		if (isTemporaryImage(prevID, prevURL) && !isTemporaryImage(id, url)) {
			revokeBlobURL(url);
		}

		if (
			!this.props.isSelected &&
			prevProps.isSelected &&
			this.state.captionFocused
		) {
			this.setState({
				captionFocused: false,
			});
		}
	}

	onUploadError(message) {
		const { noticeOperations } = this.props;
		noticeOperations.removeAllNotices();
		noticeOperations.createErrorNotice(message);
	}

	onSelectImage(media) {
		if (!media || !media.url) {
			this.props.setAttributes({
				url: undefined,
				alt: undefined,
				id: undefined,
				title: undefined,
				caption: undefined,
			});
			return;
		}

		const { id, url, alt, caption, linkDestination } = this.props.attributes;

		let mediaAttributes = pickRelevantMediaFiles(media);

		// If the current image is temporary but an alt text was meanwhile written by the user,
		// make sure the text is not overwritten.
		if (isTemporaryImage(id, url)) {
			if (alt) {
				mediaAttributes = omit(mediaAttributes, ["alt"]);
			}
		}

		// If a caption text was meanwhile written by the user,
		// make sure the text is not overwritten by empty captions
		if (caption && !get(mediaAttributes, ["caption"])) {
			mediaAttributes = omit(mediaAttributes, ["caption"]);
		}

		let additionalAttributes;
		// Reset the dimension attributes if changing to a different image.
		if (!media.id || media.id !== id) {
			additionalAttributes = {
				width: undefined,
				height: undefined,
				sizeSlug: DEFAULT_SIZE_SLUG,
			};
		} else {
			// Keep the same url when selecting the same file, so "Image Size" option is not changed.
			additionalAttributes = { url };
		}

		// Check if the image is linked to it's media.
		if (linkDestination === LINK_DESTINATION_MEDIA) {
			// Update the media link.
			mediaAttributes.href = media.url;
		}

		// Check if the image is linked to the attachment page.
		if (linkDestination === LINK_DESTINATION_ATTACHMENT) {
			// Update the media link.
			mediaAttributes.href = media.link;
		}

		this.props.setAttributes({
			...mediaAttributes,
			...additionalAttributes,
		});
	}

	onSelectURL(newURL) {
		const { url } = this.props.attributes;

		if (newURL !== url) {
			this.props.setAttributes({
				url: newURL,
				id: undefined,
				sizeSlug: DEFAULT_SIZE_SLUG,
			});
		}
	}

	onImageError(url) {
		// Check if there's an embed block that handles this URL.
		// const embedBlock = createUpgradedEmbedBlock({ attributes: { url } });
		// if (undefined !== embedBlock) {
		// 	this.props.onReplace(embedBlock);
		// }
	}

	onSetHref(props) {
		this.props.setAttributes(props);
	}

	onSetTitle(value) {
		// This is the HTML title attribute, separate from the media object title
		this.props.setAttributes({ title: value });
	}

	onSetShadow(value) {
		this.props.setAttributes({ shadow: value });
	}

	onFocusCaption() {
		if (!this.state.captionFocused) {
			this.setState({
				captionFocused: true,
			});
		}
	}

	onImageClick() {
		if (this.state.captionFocused) {
			this.setState({
				captionFocused: false,
			});
		}
	}

	updateAlt(newAlt) {
		this.props.setAttributes({ alt: newAlt });
	}

	updateImage(sizeSlug) {
		const { image } = this.props;

		const url = get(image, ["media_details", "sizes", sizeSlug, "source_url"]);
		if (!url) {
			return null;
		}

		this.props.setAttributes({
			url,
			width: undefined,
			height: undefined,
			sizeSlug,
		});
	}

	getFilename(url) {
		const path = getPath(url);
		if (path) {
			return last(path.split("/"));
		}
	}

	getImageSizeOptions() {
		const { imageSizes, image } = this.props;
		return map(
			filter(imageSizes, ({ slug }) =>
				get(image, ["media_details", "sizes", slug, "source_url"])
			),
			({ name, slug }) => ({ value: slug, label: name })
		);
	}

	render() {
		const {
			attributes,
			setAttributes,
			isLargeViewport,
			isSelected,
			className,
			maxWidth,
			noticeUI,
			isRTL,
			onResizeStart,
			onResizeStop,
		} = this.props;
		const {
			url,
			alt,
			caption,
			id,
			href,
			rel,
			linkClass,
			linkDestination,
			title,
			width,
			height,
			linkTarget,
			sizeSlug,
			shadow,
		} = attributes;

		const isExternal = isExternalImage(id, url);
		const controls = (
			<BlockControls>
				{url && (
					<MediaReplaceFlow
						mediaId={id}
						mediaURL={url}
						allowedTypes={ALLOWED_MEDIA_TYPES}
						accept="image/*"
						onSelect={this.onSelectImage}
						onSelectURL={this.onSelectURL}
						onError={this.onUploadError}
					/>
				)}
				{url && (
					<ToolbarGroup>
						<ImageURLInputUI
							url={href || ""}
							onChangeUrl={this.onSetHref}
							linkDestination={linkDestination}
							mediaUrl={this.props.image && this.props.image.source_url}
							mediaLink={this.props.image && this.props.image.link}
							linkTarget={linkTarget}
							linkClass={linkClass}
							rel={rel}
						/>
					</ToolbarGroup>
				)}
			</BlockControls>
		);
		const src = isExternal ? url : undefined;
		const mediaPreview = !!url && (
			<img
				alt={__("Edit image")}
				title={__("Edit image")}
				className={"edit-image-preview"}
				src={url}
			/>
		);

		const mediaPlaceholder = (
			<MediaPlaceholder
				icon={<BlockIcon icon={icon} />}
				onSelect={this.onSelectImage}
				onSelectURL={this.onSelectURL}
				notices={noticeUI}
				onError={this.onUploadError}
				accept="image/*"
				allowedTypes={ALLOWED_MEDIA_TYPES}
				value={{ id, src }}
				mediaPreview={mediaPreview}
				disableMediaButtons={url}
			/>
		);

		if (!url) {
			return (
				<Fragment>
					{controls}
					<div className={className}>{mediaPlaceholder}</div>
				</Fragment>
			);
		}

		const classes = className;

		const imgClasses = classnames({ "has-shadow": shadow });

		const isResizable = true;

		const imageSizeOptions = this.getImageSizeOptions();

		const getInspectorControls = (imageWidth, imageHeight) => (
			<Fragment>
				<InspectorControls>
					<PanelBody title={__("Image settings")}>
						<ToggleControl
							label={__("Should the image be surrounded with a box-shadow?")}
							onChange={this.onSetShadow}
							checked={shadow}
						/>
						<TextareaControl
							label={__("Alt text (alternative text)")}
							value={alt}
							onChange={this.updateAlt}
							help={
								<Fragment>
									<ExternalLink href="https://www.w3.org/WAI/tutorials/images/decision-tree">
										{__("Describe the purpose of the image")}
									</ExternalLink>
									{__("Leave empty if the image is purely decorative.")}
								</Fragment>
							}
						/>
						<ImageSizeControl
							onChangeImage={this.updateImage}
							onChange={(value) => setAttributes(value)}
							slug={sizeSlug}
							width={width}
							height={height}
							imageSizeOptions={imageSizeOptions}
							isResizable={isResizable}
							imageWidth={imageWidth}
							imageHeight={imageHeight}
						/>
					</PanelBody>
				</InspectorControls>
				<InspectorAdvancedControls>
					<TextControl
						label={__("Title attribute")}
						value={title || ""}
						onChange={this.onSetTitle}
						help={
							<Fragment>
								{__("Describe the role of this image on the page.")}
								<ExternalLink href="https://www.w3.org/TR/html52/dom.html#the-title-attribute">
									{__(
										"(Note: many devices and browsers do not display this text.)"
									)}
								</ExternalLink>
							</Fragment>
						}
					/>
				</InspectorAdvancedControls>
			</Fragment>
		);

		// Disable reason: Each block can be selected by clicking on it
		/* eslint-disable jsx-a11y/click-events-have-key-events */
		return (
			<Fragment>
				{controls}
				<figure className={classes}>
					<ImageSize src={url}>
						{(sizes) => {
							const {
								imageWidthWithinContainer,
								imageHeightWithinContainer,
								imageWidth,
								imageHeight,
							} = sizes;

							const filename = this.getFilename(url);
							let defaultedAlt;
							if (alt) {
								defaultedAlt = alt;
							} else if (filename) {
								defaultedAlt = sprintf(
									/* translators: %s: file name */
									__(
										"This image has an empty alt attribute; its file name is %s"
									),
									filename
								);
							} else {
								defaultedAlt = __("This image has an empty alt attribute");
							}

							const img = (
								// Disable reason: Image itself is not meant to be interactive, but
								// should direct focus to block.
								/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
								<Fragment>
									<img
										src={url}
										className={imgClasses}
										alt={defaultedAlt}
										onClick={this.onImageClick}
										onError={() => this.onImageError(url)}
									/>
									{isBlobURL(url) && <Spinner />}
								</Fragment>
								/* eslint-enable jsx-a11y/no-noninteractive-element-interactions */
							);

							return (
								<Fragment>
									{getInspectorControls(imageWidth, imageHeight)}
									<div style={{ width, height }}>{img}</div>
								</Fragment>
							);
						}}
					</ImageSize>
					{(!RichText.isEmpty(caption) || isSelected) && (
						<RichText
							tagName="h4"
							placeholder={__("Menu title")}
							value={caption}
							unstableOnFocus={this.onFocusCaption}
							onChange={(value) => setAttributes({ caption: value })}
							isSelected={this.state.captionFocused}
							inlineToolbar
							allowedFormats={[]}
						/>
					)}

					{mediaPlaceholder}
				</figure>
			</Fragment>
		);
		/* eslint-enable jsx-a11y/click-events-have-key-events */
	}
}

export default compose([
	withDispatch((dispatch) => {
		const { toggleSelection } = dispatch("core/block-editor");

		return {
			onResizeStart: () => toggleSelection(false),
			onResizeStop: () => toggleSelection(true),
		};
	}),
	withSelect((select, props) => {
		const { getMedia } = select("core");
		const { getSettings } = select("core/block-editor");
		const {
			attributes: { id },
			isSelected,
		} = props;
		const { mediaUpload, imageSizes, isRTL, maxWidth } = getSettings();

		return {
			image: id && isSelected ? getMedia(id) : null,
			maxWidth,
			isRTL,
			imageSizes,
			mediaUpload,
		};
	}),
	withViewportMatch({ isLargeViewport: "medium" }),
	withNotices,
])(ImageEdit);
