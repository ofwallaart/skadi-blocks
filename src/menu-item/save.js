/**
 * External dependencies
 */
import classnames from "classnames";
import { isEmpty } from "lodash";

/**
 * WordPress dependencies
 */
import { RichText } from "@wordpress/block-editor";
import { Fragment } from "@wordpress/element";

export default function save({ attributes }) {
	const {
		url,
		alt,
		caption,
		href,
		rel,
		linkClass,
		width,
		height,
		id,
		linkTarget,
		sizeSlug,
		title,
		shadow,
	} = attributes;

	const newRel = isEmpty(rel) ? undefined : rel;

	const classes = classnames({
		[`size-${sizeSlug}`]: sizeSlug,
		"is-resized": width || height,
	});

	const imgClasses = classnames({
		"has-shadow": shadow,
		[`wp-image-${id}`]: id,
	});

	const image = (
		<img
			src={url}
			alt={alt}
			className={imgClasses}
			width={width}
			height={height}
			title={title}
		/>
	);

	const figure = (
		<Fragment>
			{href ? (
				<a className={linkClass} href={href} target={linkTarget} rel={newRel}>
					{image}
					{!RichText.isEmpty(caption) && (
						<RichText.Content tagName="h4" value={caption} />
					)}
				</a>
			) : (
				(image,
				!RichText.isEmpty(caption) && (
					<RichText.Content tagName="h4" value={caption} />
				))
			)}
		</Fragment>
	);

	return <figure className={classes}>{figure}</figure>;
}
