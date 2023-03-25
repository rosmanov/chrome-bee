/* jshint strict: true, esversion: 6 */
/**
 * Copyright © 2014-2023 Ruslan Osmanov <rrosmanov@gmail.com>
 */
class BeeUrlPattern {
    /**
     * @param {string} extension File name extension
     * @param {string} regex Regular expression
     */
    constructor(extension, regex) {
        this.extension = extension;
        this.regex = regex;
    }

    static fromObject(object) {
        return new BeeUrlPattern(object.extension, object.regex);
    }

    getExtension() {
        return this.extension;
    }

    getRegex() {
        return this.regex;
    }
}
export default BeeUrlPattern;
