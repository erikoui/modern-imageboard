
/**
 * Some helper functions for manipulating post strings
 */
class StringFunctions {
  /**
   * empty constructor
   */
  constructor() {
  }

  /**
    * Detects hashtags in a text string.
    * Credits go to Arnaud Valensi
    * (http://geekcoder.org/js-extract-hashtags-from-text/)
    *
    * @param {string} inputText The string to extract hashtags from
    * @return {array<string>} array of strings of each hashtag, without the #
    */
  getHashTags(inputText) {
    const regex = /(?:^|\s)(?:#)([a-zA-Z\d]+)/gm;
    const matches = [];
    let match;

    while ((match = regex.exec(inputText))) {
      matches.push(match[1]);
    }

    return matches;
  }
}

module.exports=StringFunctions;
