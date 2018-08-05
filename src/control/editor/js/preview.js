/*
*  LibreSignage live slide preview implementation.
*/

var $ = require('jquery');
var markup = require('ls-markup');
var util = require('ls-util');

const META = [
	{ charset: 'utf-8' },
	{ name: 'viewport', content: 'width=device-width, initial-scale=1' }
];

const STYLESHEETS = [
	'/libs/bootstrap/dist/css/bootstrap.min.css',
	'/common/css/default.css',
	'/app/css/animations.css',
	'/app/css/display.css',
	'/common/css/markup.css'
];

exports.Preview = class Preview {
	constructor(container, editor, getter, err) {
		this.container = $(container);
		this.editor = $(editor);
		this.getter = getter;
		this.err = err;
		this.ratio = null;

		// Add the preview iframe to the container.
		this.preview = $('<iframe class="preview rounded"></frame>');
		this.container.append(this.preview);

		// Add the necessary metadata and stylesheets.
		var buf = '';
		for (let m of META) {
			buf += '<meta';
			for (let k in m) { buf += ` ${k}="${m[k]}"`; }
			buf += '>';
		}
		for (let s of STYLESHEETS) {
			buf += `<link rel="stylesheet" href="${s}"></link>`;
		}
		this.preview.contents().find('head').append(buf);

		this.editor.on('keyup', () => { this.update(); })
		this.set_ratio('16x9');
	}

	update() {
		/*
		*  Update the contents of the preview box.
		*/
		var html = null;

		// Clear previous errors.
		if (this.err) { this.err(null); }

		try {
			html = markup.parse(
				util.sanitize_html(
					this.getter()
				)
			);
		} catch (e) {
			if (e instanceof markup.MarkupParseError) {
				if (this.err) { this.err(e); }
			} else {
				throw e;
			}
		}

		if (html) {
			this.preview.contents().find('body').html(html);
		}
	}

	set_ratio(r) {
		/*
		*  Set the aspect ratio of the preview box. Accepted
		*  values for r are '16x9' and '4x3'.
		*/
		if (r == '4x3') {
			this.container.removeClass('preview-16x9');
			this.container.addClass('preview-4x3');
			this.ratio = r;
		} else if (r == '16x9') {
			this.container.addClass('preview-16x9');
			this.container.removeClass('preview-4x3');
			this.ratio = r;
		} else {
			throw new Error(`Unknown aspect ratio '${r}'.`);
		}
	}
}