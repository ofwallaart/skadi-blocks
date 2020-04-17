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
		align,
		href,
		rel,
		linkClass,
		width,
		height,
		id,
		linkTarget,
		sizeSlug,
		title,
	} = attributes;

	const newRel = isEmpty(rel) ? undefined : rel;

	const classes = classnames({
		[`align${align}`]: align,
		[`size-${sizeSlug}`]: sizeSlug,
		"is-resized": width || height,
	});

	const image = (
		<img
			src={url}
			alt={alt}
			className={id ? `wp-image-${id}` : null}
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
				</a>
			) : (
				image
			)}
		</Fragment>
	);

	if ("left" === align || "right" === align || "center" === align) {
		return (
			<div>
				<figure className={classes}>{figure}</figure>
			</div>
		);
	}

	return <figure className={classes}>{figure}</figure>;
}
