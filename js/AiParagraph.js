/**
 * Build styles
 */
// import './paragraph.css' assert { type: 'css' };

/**
 * Base Paragraph Block for the Editor.js.
 * Represents a regular text block
 *
 * @author CodeX (team@codex.so)
 * @copyright CodeX 2018
 * @license The MIT License (MIT)
 */

/**
 * @typedef {object} ParagraphConfig
 * @property {string} placeholder - placeholder for the empty paragraph
 * @property {boolean} preserveBlank - Whether or not to keep blank paragraphs when saving editor data
 */

/**
 * @typedef {object} ParagraphData
 * @description Tool's input and output data format
 * @property {string} text — Paragraph's content. Can include HTML tags: <a><b><i>
 */
class AiParagraph {
	/**
	 * Default placeholder for Paragraph Tool
	 *
	 * @returns {string}
	 * @class
	 */
	static get DEFAULT_PLACEHOLDER() {
		return 'Text';
	}

	/**
	 * Render plugin`s main Element and fill it with saved data
	 *
	 * @param {object} params - constructor params
	 * @param {ParagraphData} params.data - previously saved data
	 * @param {ParagraphConfig} params.config - user config for Tool
	 * @param {object} params.api - editor.js api
	 * @param {boolean} readOnly - read only mode flag
	 */
	constructor({ data, config, api, readOnly }) {
		this.api = api;
		console.log('data', api);
		this.readOnly = readOnly;
		this._CSS = {
			block: this.api.styles.block,
			wrapper: 'ce-paragraph',
		};

		if (!this.readOnly) {
			this.onKeyUp = this.onKeyUp.bind(this);
		}

		/**
		 * Placeholder for paragraph if it is first Block
		 *
		 * @type {string}
		 */
		this._placeholder = config.placeholder
			? config.placeholder
			: AiParagraph.DEFAULT_PLACEHOLDER;
		this._data = {};
		this._element = null;
		this._preserveBlank =
			config.preserveBlank !== undefined ? config.preserveBlank : false;

		this.data = data;
	}

	/**
	 * Check if text content is empty and set empty string to inner html.
	 * We need this because some browsers (e.g. Safari) insert <br> into empty contenteditanle elements
	 *
	 * @param {KeyboardEvent} e - key up event
	 */
	onKeyUp(e) {
		if (e.code !== 'Backspace' && e.code !== 'Delete') {
			return;
		}

		const { textContent } = this._element;

		if (textContent === '') {
			this._element.innerHTML = '';
		}
	}

	/**
	 * Create Tool's view
	 *
	 * @returns {HTMLElement}
	 * @private
	 */
	drawView() {
		const div = document.createElement('DIV');

		div.classList.add(this._CSS.wrapper, this._CSS.block);
		div.contentEditable = false;
		div.dataset.placeholder = this.api.i18n.t(this._placeholder);

		if (this._data.text) {
			div.innerHTML = this._data.text;
		}

		if (!this.readOnly) {
			div.contentEditable = true;
			div.addEventListener('keyup', this.onKeyUp);
		}

		return div;
	}

	/**
	 * Return Tool's view
	 *
	 * @returns {HTMLDivElement}
	 */
	render() {
		this._element = this.drawView();

		return this._element;
	}

	/**
	 * Method that specified how to merge two Text blocks.
	 * Called by Editor.js by backspace at the beginning of the Block
	 *
	 * @param {ParagraphData} data
	 * @public
	 */
	merge(data) {
		const newData = {
			text: this.data.text + data.text,
		};

		this.data = newData;
	}

	/**
	 * Validate Paragraph block data:
	 * - check for emptiness
	 *
	 * @param {ParagraphData} savedData — data received after saving
	 * @returns {boolean} false if saved data is not correct, otherwise true
	 * @public
	 */
	validate(savedData) {
		if (savedData.text.trim() === '' && !this._preserveBlank) {
			return false;
		}

		return true;
	}

	/**
	 * Extract Tool's data from the view
	 *
	 * @param {HTMLDivElement} toolsContent - Paragraph tools rendered view
	 * @returns {ParagraphData} - saved data
	 * @public
	 */
	save(toolsContent) {
		return {
			text: toolsContent.innerHTML,
		};
	}

	/**
	 * On paste callback fired from Editor.
	 *
	 * @param {PasteEvent} event - event with pasted data
	 */
	onPaste(event) {
		const data = {
			text: event.detail.data.innerHTML,
		};

		this.data = data;
	}

	/**
	 * Enable Conversion Toolbar. Paragraph can be converted to/from other tools
	 */
	static get conversionConfig() {
		return {
			export: 'text', // to convert Paragraph to other block, use 'text' property of saved data
			import: 'text', // to covert other block's exported string to Paragraph, fill 'text' property of tool data
		};
	}

	/**
	 * Sanitizer rules
	 */
	static get sanitize() {
		return {
			text: {
				br: true,
			},
		};
	}

	/**
	 * Returns true to notify the core that read-only mode is supported
	 *
	 * @returns {boolean}
	 */
	static get isReadOnlySupported() {
		return true;
	}

	/**
	 * Get current Tools`s data
	 *
	 * @returns {ParagraphData} Current data
	 * @private
	 */
	get data() {
		if (this._element !== null) {
			const text = this._element.innerHTML;

			this._data.text = text;
		}

		return this._data;
	}

	/**
	 * Store data in plugin:
	 * - at the this._data property
	 * - at the HTML
	 *
	 * @param {ParagraphData} data — data to set
	 * @private
	 */
	set data(data) {
		this._data = data || {};

		if (this._element !== null) {
			this.hydrate();
		}
	}

	/**
	 * Fill tool's view with data
	 */
	hydrate() {
		window.requestAnimationFrame(() => {
			this._element.innerHTML = this._data.text || '';
		});
	}

	/**
	 * Used by Editor paste handling API.
	 * Provides configuration to handle P tags.
	 *
	 * @returns {{tags: string[]}}
	 */
	static get pasteConfig() {
		return {
			tags: ['P'],
		};
	}

	/**
	 * Icon and title for displaying at the Toolbox
	 *
	 * @returns {{icon: string, title: string}}
	 */
	static get toolbox() {
		return {
			icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 9V7.2C8 7.08954 8.08954 7 8.2 7L12 7M16 9V7.2C16 7.08954 15.9105 7 15.8 7L12 7M12 7L12 17M12 17H10M12 17H14" stroke="black" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
			title: 'Text',
		};
	}
}
