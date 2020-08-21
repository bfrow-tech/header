/**
 * Build styles
 */
require('./index.css').toString();

/**
 * @typedef {Object} HeaderData
 * @description Tool's input and output data format
 * @property {String} text — Header's content
 * @property {number} level - Header's level from 1 to 3
 */

/**
 * @typedef {Object} HeaderConfig
 * @description Tool's config from Editor
 * @property {string} placeholder — Block's placeholder
 */

/**
 * Header block for the Editor.js.
 *
 * @author CodeX (team@ifmo.su)
 * @copyright CodeX 2018
 * @license The MIT License (MIT)
 * @version 2.0.0
 */
class Header {
  /**
   * Render plugin`s main Element and fill it with saved data
   *
   * @param {{data: HeaderData, config: HeaderConfig, api: object}}
   *   data — previously saved data
   *   config - user config for Tool
   *   api - Editor.js API
   */
  constructor({data, config, api}) {
    this.api = api;

    /**
     * Styles
     * @type {Object}
     */
    this._CSS = {
      block: this.api.styles.block,
      settingsButton: this.api.styles.settingsButton,
      settingsButtonActive: this.api.styles.settingsButtonActive,
      wrapper: 'ce-header',
    };

    /**
     * Tool's settings passed from Editor
     * @type {HeaderConfig}
     * @private
     */
    this._settings = config;

    /**
     * Block's data
     * @type {HeaderData}
     * @private
     */
    this._data = this.normalizeData(data);

    /**
     * List of settings buttons
     * @type {HTMLElement[]}
     */
    this.settingsButtons = [];

    /**
     * Main Block wrapper
     * @type {HTMLElement}
     * @private
     */
    this._element = this.getTag();
  }

  /**
   * Normalize input data
   * @param {HeaderData} data
   * @return {HeaderData}
   * @private
   */
  normalizeData(data) {
    const newData = {};

    if (typeof data !== 'object') {
      data = {};
    }

    newData.text = data.text || '';
    newData.level = parseInt(data.level) || this.defaultLevel.number;

    return newData;
  }

  /**
   * Return Tool's view
   * @returns {HTMLHeadingElement}
   * @public
   */
  render() {
    return this._element;
  }

  /**
   * Create Block's settings block
   *
   * @return {HTMLElement}
   */
  renderSettings() {
    let holder = document.createElement('DIV');

    /** Add type selectors */
    this.levels.forEach( level => {
      let selectTypeButton = document.createElement('SPAN');

      selectTypeButton.classList.add(this._CSS.settingsButton);

      /**
       * Highlight current level button
       */
      if (this.currentLevel.number === level.number) {
        selectTypeButton.classList.add(this._CSS.settingsButtonActive);
      }

      /**
       * Add SVG icon
       */
      selectTypeButton.innerHTML = level.svg;

      /**
       * Save level to its button
       */
      selectTypeButton.dataset.level = level.number;

      /**
       * Set up click handler
       */
      selectTypeButton.addEventListener('click', () => {
        this.setLevel(level.number);
      });

      /**
       * Append settings button to holder
       */
      holder.appendChild(selectTypeButton);

      /**
       * Save settings buttons
       */
      this.settingsButtons.push(selectTypeButton);
    });

    return holder;
  }

  /**
   * Callback for Block's settings buttons
   * @param level
   */
  setLevel(level) {
    this.data = {
      level: level,
      text: this.data.text
    };

    /**
     * Highlight button by selected level
     */
    this.settingsButtons.forEach(button => {
      if (button.dataset.level) button.classList.toggle(this._CSS.settingsButtonActive, parseInt(button.dataset.level) === level);
    });
  }

  /**
   * Method that specified how to merge two Text blocks.
   * Called by Editor.js by backspace at the beginning of the Block
   * @param {HeaderData} data
   * @public
   */
  merge(data) {
    let newData = {
      text: this.data.text + data.text,
      level: this.data.level,
    };

    this.data = newData;
  }

  /**
   * Validate Text block data:
   * - check for emptiness
   *
   * @param {HeaderData} blockData — data received after saving
   * @returns {boolean} false if saved data is not correct, otherwise true
   * @public
   */
  validate(blockData) {
    return blockData.text.trim() !== '';
  }

  /**
   * Extract Tool's data from the view
   * @param {HTMLHeadingElement} toolsContent - Text tools rendered view
   * @returns {HeaderData} - saved data
   * @public
   */
  save(toolsContent) {
    return {
      text: toolsContent.innerHTML,
      level: this.currentLevel.number,
    };
  }

  /**
   * Allow Header to be converted to/from other blocks
   */
  static get conversionConfig() {
    return {
      export: 'text', // use 'text' property for other blocks
      import: 'text' // fill 'text' property from other block's export string
    };
  }

  /**
   * Sanitizer Rules
   */
  static get sanitize() {
    return {
      level: {},
    };
  }

  /**
   * Get current Tools`s data
   * @returns {HeaderData} Current data
   * @private
   */
  get data() {
    this._data.text = this._element.innerHTML;
    this._data.level = this.currentLevel.number;

    return this._data;
  }

  /**
   * Store data in plugin:
   * - at the this._data property
   * - at the HTML
   *
   * @param {HeaderData} data — data to set
   * @private
   */
  set data(data) {
    this._data = this.normalizeData(data);

    /**
     * If level is set and block in DOM
     * then replace it to a new block
     */
    if (data.level !== undefined && this._element.parentNode) {
      /**
       * Create a new tag
       * @type {HTMLHeadingElement}
       */
      let newHeader = this.getTag();

      /**
       * Save Block's content
       */
      newHeader.innerHTML = this._element.innerHTML;

      /**
       * Replace blocks
       */
      this._element.parentNode.replaceChild(newHeader, this._element);

      /**
       * Save new block to private variable
       * @type {HTMLHeadingElement}
       * @private
       */
      this._element = newHeader;
    }

    /**
     * If data.text was passed then update block's content
     */
    if (data.text !== undefined) {
      this._element.innerHTML = this._data.text || '';
    }
  }

  /**
   * Get tag for target level
   * By default returns second-leveled header
   * @return {HTMLElement}
   */
  getTag() {
    /**
     * Create element for current Block's level
     */
    let tag = document.createElement(this.currentLevel.tag);

    /**
     * Add text to block
     */
    tag.innerHTML = this._data.text || '';

    /**
     * Add styles class
     */
    tag.classList.add(this._CSS.wrapper);

    /**
     * Make tag editable
     */
    tag.contentEditable = 'true';

    /**
     * Add Placeholder
     */
    tag.dataset.placeholder = this._settings.placeholder || '';

    return tag;
  }

  /**
   * Get current level
   * @return {level}
   */
  get currentLevel() {
    let level = this.levels.find(levelItem => levelItem.number === this._data.level);

    if (!level) {
      level = this.defaultLevel;
    }

    return level;
  }

  /**
   * Return default level
   * @returns {level}
   */
  get defaultLevel() {
    /**
     * Use H2 as default header
     */
    return this.levels[2];
  }

  /**
   * @typedef {object} level
   * @property {number} number - level number
   * @property {string} tag - tag correspondes with level number
   * @property {string} svg - icon
   */

  /**
   * Available header levels
   * @return {level[]}
   */
  get levels() {
    return [
      {
        number: 2,
        tag: 'H2',
        svg: '<svg xmlns="http://www.w3.org/2000/svg" width="17" viewBox="0 0 14 11" fill="none"><path d="M9.83506e-08 0H2.25V11H9.83506e-08V0Z" fill="currentColor"/><path d="M6.75 0H9V11H6.75V0Z" fill="currentColor"/><path d="M9.83506e-08 6.6L0 4.4L9 4.4V6.6L9.83506e-08 6.6Z" fill="currentColor"/><path d="M14 9.8H11.3333V8.6H12.6667C13.4 8.6 14 8.066 14 7.4V6.2C14 5.534 13.4 5 12.6667 5H10V6.2H12.6667V7.4H11.3333C10.6 7.4 10 7.934 10 8.6V11H14V9.8Z" fill="currentColor"/></svg>'
      },
      {
        number: 3,
        tag: 'H3',
        svg: '<svg xmlns="http://www.w3.org/2000/svg" width="17" viewBox="0 0 14 11" fill="none"><path d="M14 9.8V8.9C14 8.402 13.5533 8 13 8C13.5533 8 14 7.598 14 7.1V6.2C14 5.534 13.4 5 12.6667 5H10V6.2H12.6667V7.4H11.3333V8.6H12.6667V9.8H10V11H12.6667C13.4 11 14 10.466 14 9.8Z" fill="currentColor"/><path d="M9.83506e-08 0H2.25V11H9.83506e-08V0Z" fill="currentColor"/><path d="M6.75 0H9V11H6.75V0Z" fill="currentColor"/><path d="M9.83506e-08 6.6L0 4.4L9 4.4V6.6L9.83506e-08 6.6Z" fill="currentColor"/></svg>'
      },
      {
        number: 4,
        tag: 'H4',
        svg: '<svg xmlns="http://www.w3.org/2000/svg" width="17" viewBox="0 0 14 11" fill="none"><path d="M9.83506e-08 0H2.25V11H9.83506e-08V0Z" fill="currentColor"/><path d="M6.75 0H9V11H6.75V0Z" fill="currentColor"/><path d="M9.83506e-08 6.6L0 4.4L9 4.4V6.6L9.83506e-08 6.6Z" fill="currentColor"/><path d="M12.6667 11H14V5H12.6667V7.4H11.3333V5H10V8.6H12.6667V11Z" fill="currentColor"/></svg>'
      },
    ];
  }

  /**
   * Handle H1-H3 tags on paste to substitute it with header Tool
   *
   * @param {PasteEvent} event - event with pasted content
   */
  onPaste(event) {
    const content = event.detail.data;

    /**
     * Define default level value
     * @type {number}
     */
    let level = 2;

    switch (content.tagName) {
      case 'H2':
        level = 2;
        break;
      /** H2 is a default level */
      case 'H3':
        level = 3;
        break;
      case 'H4':
        level = 4;
        break;
    }

    this.data = {
      level,
      text: content.innerHTML
    };
  }

  /**
   * Used by Editor.js paste handling API.
   * Provides configuration to handle H1-H3 tags.
   *
   * @returns {{handler: (function(HTMLElement): {text: string}), tags: string[]}}
   */
  static get pasteConfig() {
    return {
      tags: ['H2', 'H3', 'H4']
    };
  }

  /**
   * Get Tool toolbox settings
   * icon - Tool icon's SVG
   * title - title to show in toolbox
   *
   * @return {{icon: string, title: string}}
   */
  static get toolbox() {
    return {
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="1 -0.5 24 24" fill="none"><path d="M6.99854 4H9.99854V19H6.99854V4Z" fill="currentColor"/><path d="M15.9985 4H18.9985V19H15.9985V4Z" fill="currentColor"/><path d="M6.99854 13L6.99854 10L18.9985 10V13L6.99854 13Z" fill="currentColor"/></svg>',
      title: 'Header'
    };
  }
}

module.exports = Header;
