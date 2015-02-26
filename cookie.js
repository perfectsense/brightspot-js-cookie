define(function () {

    "use strict";

    /**
     * Get the prefix for a scrambled cookie.
     *
     * <p>Each scrambled cookie starts with a prefix such as "[rot13]" that indicates the scramble algorithm.</p>
     *
     * @returns {String} The scramble prefix or an empty string.
     *
     * @example
     * value = '[rot13]super';
     * prefix = scramblePrefixGet(value);
     * // returns 'rot13'
     *
     * @private
     */
    function scramblePrefixGet(s) {

        // Find the characters within [] at the begining of the string
        var match = s.match(/^\[(.+?)\]/);

        // Match will contain null if no match was found,
        // or an array of matches
        if (match) {

            // Return what was in the first captured parenthesis,
            // or an empty string if there was nothing with the [] characters
            return match[1] || '';

        } else {

            // There was no match
            return '';
        }
    }


    /**
     * Add a prefix to a cookie value.
     *
     * @param {String} prefix The prefix to add
     * @param {String} value The cookie value
     *
     * @returns {String} The cookie value with the prefix added to the beginning.
     *
     * @example
     * value = 'super';
     * value = scramblePrefixAdd('rot13', value);
     * // returns '[rot13]super'
     *
     * @private
     */
    function scramblePrefixAdd(prefix, value) {
        return '[' + prefix + ']' + value;
    }


    /**
     * Remove the prefix from a cookie value.
     *
     * @param {String} value The cookie value
     *
     * @returns {String} The cookie value with the prefix removed.
     *
     * @example
     * value = '[rot13]super';
     * value = scramblePrefixRemove(value);
     * // returns 'super'
     *
     * @private
     */
    function scramblePrefixRemove(s) {
        return s.replace(/^\[(.+?)\]/, '');
    }


    /**
     * Scramble or unscramble the text in a string using Rot13 encoding.
     *
     * @private
     * @param {String} str
     * @returns {String}
     */
    function rot13(str) {
        return ( str || '' ).replace(/[a-z]/ig, function (a) {
            var n = a.charCodeAt(0);
            return String.fromCharCode(n > 109 || n < 97 && n > 77 ? n - 13 : n + 13);
        });
    }


    /**
     * Scramble or unscramble the numbers in a string using Rot5 encoding.
     *
     * @private
     * @param {String} str
     * @returns {String}
     */
    function rot5(str) {
        return str.replace(/[0-9]/g, rot5replace);
    }


    /**
     * Function to use with String.replace() to scramble a single number that is matched.
     *
     * String.replace() function accepts the following arguments, but we just need the first:
     * str, p1, p2, offset, s
     *
     * Refer to the following:
     * https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/String/replace#Specifying_a_function_as_a_parameter
     *
     * @private
     * @param {String} str The text that was matched in the regular expression.
     */
    function rot5replace(a) {
        return rot5matrix.hasOwnProperty(a) ? rot5matrix[a] : a;
    }


    /**
     * Function to encode the cookie value.
     * Cookies cannot contain comma, semi-colon, equals, or whitespace. Also should not contain special characters.
     * So we use encodeURIComponent() to encode it; however, that tends to encode too much, so we will go back
     * and decode certain characters that are frequently used in json cookies.
     */
    function encodeValue(value) {

        return encodeURIComponent(value).replace(
            // { %7B
            // } %7D
            // : %3A
            // [ %5B
            // ] %5D

            /%7B|%7D|%3A|%5B|%5D/g,

            // Replacement function for any match of the regular expression
            function (s) {
                return decodeURIComponent(s);
            }
        );

    }


    /**
     * Function to encode the cookie value.
     */
    function decodeValue(value) {
        return decodeURIComponent(value);
    }


    /**
     * Substitution matrix for numbers in rot5. Add five to numbers 0-4; subtract 5 from numbers 5-9.
     * We could calculate this, but it is easier and better performance to hard-code it here.
     *
     * @private
     */
    var rot5matrix = {
        0: 5,
        1: 6,
        2: 7,
        3: 8,
        4: 9,
        5: 0,
        6: 1,
        7: 2,
        8: 3,
        9: 4
    };


    /**
     * Regular expression used by trim() function.
     *
     * Created outside the trim() function to give better performance.
     *
     * @private
     */
    var rtrim = /^(\s|\u00A0)+|(\s|\u00A0)+$/g;


    /**
     * Remove whitespace before and after.
     *
     * Added here so this cookie code does not have any dependence on jQuery.
     *
     * @private
     * @param {String} str
     * @requires rtrim
     */
    function trim(str) {
        return (str || "").replace(rtrim, "");
    }


    /**
     * @namespace Functions that manipulate cookies
     *
     * @description Get, set, or delete a cookie.
     *
     * <p><b>IMPORTANT:</b> this function should not be called directly,
     * use the shortcut methods attached to this function object instead.
     * This function is subject to change without notice.</p>
     *
     * @returns {String||null} The cookie value. If the scramble option was specified, returns the scrambled value
     * if you are setting the cookie, and the unscrambled value if you are getting the cookie.
     * If retrieving a cookie that does not exist, returns null.
     *
     * @param {String} name Name of the cookie to get or set.
     *
     * @param {String} [value] Value of the cookie. Only used when setting the cookie.
     *
     * @param {Object} [options] Options for the cookie.
     *
     * @param {Number|Date} [options.expires=session] Expiration data for the cookie.
     * If you specify a number, it represents a number of days.
     * If you specify a negative number (e.g. a date in the past), the cookie will be deleted.
     * If you specify null or omit this option, the cookie will be a session cookie.
     *
     * @param {String} [options.path=/] Path attribute of the cookie.
     * By default this is '/' so the cookie will apply to all paths, since that is the most common use.
     * <p>To limit the scope of your cookie, you can set the path of the cookie:</p>
     * <ul>
     * <li>Set options.path to an empty string to limit the cookie to the directory of the current page
     * (and all subdirectories).</li>
     * <li>You can also set options.path to a path other than the current page; however,
     * there is a bug in IE where the path must be a directory name ending with slash.</li>
     * </ul>
     *
     * @param {String} [options.domain=current page domain] Domain attribute of the cookie.
     * Set this to the second level domain (last two parts of the domain, like psd.com)
     *
     * @param {Boolean} [options.secure=false] Require secure transmission of the cookie.
     *
     * @param {Boolean|String} [options.scramble] Scramble or unscramble the value of the cookie.
     *
     * <p>When retrieving a cookie value, it does not matter which value you use for the scramble option
     * as long as it is "true" or truthy: the cookie value contains a prefix that indicates which algorithm
     * was used to encode the cookie. For backwards compatibility, if no prefix is found in the cookie,
     * "rot13" is assumed.</p>
     *
     * <p>When setting a cookie, this option should contain "true" to scramble the cookie using the default scramble
     * algorithm {@link cookie.scramblerDefault} (rot13n), or a string to indicate a different scramble algorithm
     * to use.</p>
     *
     * <p>The following algorithms are available by default, but others can be added:</p>
     *
     * <ul>
     * <li>rot13 - scrambles letters a-z</li>
     * <li>rot13n - scrambles letters a-z and numbers 0-9 (the default if you specify "true")</li>
     * </ul>
     *
     * <p>If you set this to a value that is not a valid scramble algorithm then it defaults to rot13n.</p>
     *
     * <p>Refer to {@link cookie.scramblers} for more information on adding custom algorithms.<p>
     *
     * @requires JSON
     * @requires trim()
     */
    var cookie = function (name, value, options) {

        // The following comment block should appear in the final minified code

        /*! BEGIN LICENSE Cookie plugin
         * This code was based on:
         * Cookie plugin
         * Copyright (c) 2006 Klaus Hartl (stilbuero.de)
         * Dual licensed under the MIT and GPL licenses:
         * http://www.opensource.org/licenses/mit-license.php
         * http://www.gnu.org/licenses/gpl.html
         */

        var
            cookie,
            cookieValue,
            cookies,
            date,
            decode,
            domain,
            encode,
            expires = '',
            i,
            path,
            prefix,
            secure,
            self,
            valueEncoded;

        // Because we have an unusual object structure, we can't use "this".
        // Set the self variable so we can access variables that we'll attach to this function.
        self = cookie;

        options = options || {};

        if (typeof value !== 'undefined') {

            // A name and a value was given, so we will set the cookie

            // If value is null, that means we will delete the cookie
            if (value === null) {
                value = '';
                options.expires = -1;
            }

            // Check if the cookie value needs to be scrambled
            if (options.scramble) {

                // Set the default algorithm if scramble is set to "true" or to a value that is not a known algorithm
                if (!self.scramblers[options.scramble]) {
                    options.scramble = self.scramblerDefault;
                }

                // We'll assume that the encode function is set up correctly,
                // otherwise let an error happen when it is called
                encode = self.scramblers[options.scramble].encode;

                // Encode the value
                value = encode(value);

                // Add a prefix to the value
                value = scramblePrefixAdd(options.scramble, value);
            }

            // Check if the expiration is a number or a date object
            if (options.expires && (typeof options.expires === 'number' || options.expires.toUTCString)) {

                if (typeof options.expires === 'number') {

                    // Expires is a number - convert number of days to a date object
                    date = new Date();
                    date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));

                } else {

                    // Expires is a date object - use it as the expiration
                    date = options.expires;
                }

                // Set the expires value to use when creating the cookie
                expires = '; expires=' + date.toUTCString();
            }

            domain = options.domain ? '; domain=' + (options.domain) : '';
            secure = options.secure ? '; secure' : '';

            // Set the cookie path.
            //
            // Note there is a bug in IE, where document.cookie will not return a cookie
            // if it was set with a path attribute containing a filename.
            // Internet Explorer Cookie Internals (FAQ)
            // http://blogs.msdn.com/b/ieinternals/archive/2009/08/20/wininet-ie-cookie-internals-faq.aspx
            //
            // The default path with be "/" if you don't specify options.path
            //
            // If you set options.path to an empty string, then we will clear the path for the cookie,
            // and the path will default to the directory of the current page.
            //
            // To set a path manually you can set options.path, but you must be sure it does not
            // contain a filename like /path/default.htm
            //
            // Note: due to the bug in IE, there does not appear to be a way to specify a cookie
            // that is set only for a single page, you can only set a cookie for all urls within
            // a directory (and sub-directories below).

            if (options.path === undefined) {

                // Default to '/' if path is not specified so the cookie will apply to every page in the domain.
                path = '; path=/';

            } else if (options.path === '') {

                // If path was specified as an empty string, do not set a path,
                // so the cookie will apply only  to the current path
                path = '';

            } else {
                // If a path was specified, set it
                path = '; path=' + options.path;
            }

            document.cookie = [name, '=', encodeValue(value), expires, path, domain, secure].join('');

            return value;

        } else {

            // Only a cookie name was specified, so we will get the cookie value
            cookieValue = null;

            // Make sure there are cookies defined
            if (document.cookie && document.cookie !== '') {

                // Separate individual cookies
                cookies = document.cookie.split(';');

                // Loop through all cookies
                for (i = 0; i < cookies.length; i++) {

                    // Trim whitespace and special characters at start and end
                    cookie = trim(cookies[i]);

                    // Does this cookie string begin with the name we want?
                    if (cookie.substring(0, name.length + 1) === (name + '=')) {

                        // Get the cookie value and remove browser encoding
                        cookieValue = decodeValue(cookie.substring(name.length + 1));

                        // Check if this is a scrambled cookie
                        if (options.scramble) {

                            // Try to get the scramble prefix from the cookie value
                            prefix = scramblePrefixGet(cookieValue);

                            // For backwards compatibility, use rot13 if there is no prefix
                            if (!prefix) {
                                prefix = 'rot13';
                            }

                            // Throw an error if we don't know how to decode
                            if (!self.scramblers[prefix]) {
                                throw 'Cannot unscramble cookie with prefix ' + prefix;
                            }

                            // Remove the scramble prefix
                            cookieValue = scramblePrefixRemove(cookieValue);

                            // We'll assume that the decode function is set up correctly,
                            // otherwise let an error happen when it is called
                            decode = self.scramblers[prefix].decode;

                            cookieValue = decode(cookieValue);
                        }

                        // Stop looping since we found the cookie
                        break;
                    }
                }
            }

            return cookieValue;
        }
    };


    /*! END LICENSE Cookie plugin */

    return $.extend(cookie, /** @lends cookie */ {

        /**
         * Get the value of a cookie.
         *
         * <p>To get the value of a scrambled cookie, you must specify the {scramble:true} option.</p>
         *
         * @returns {String} The value of a cookie, or an empty string if the cookie does not exist.
         *
         * @param {String} name Name of the cookie.
         * @param {Object} [options] Refer to {@link cookie()} for available options.
         *
         * @example
         * v = cookie.get('mycookie');
         *
         * @example
         * // Get the value of a scrambled cookie
         * v = cookie.get('mycookie', {scramble:true});
         *
         * @see cookie.exists()
         */
        get: function (name, options) {
            var v = this(name, undefined, options);
            return v === null ? '' : v;
        },


        /**
         * Set the value of a cookie.
         *
         * @returns {String} The cookie value. If the scramble option was specified, returns the scrambled value.
         *
         * @param {String} name Name of the cookie.
         * @param {String} value Value for the cookie.
         * @param {Object} [options] Refer to {@link cookie()} for available options.
         *
         * @example
         * v = cookie.set('mycookie', 10);
         *
         * @example
         * // Set the value of a scrambled cookie
         * v = cookie.set('mycookie', 10, {scramble:true});
         *
         */
        set: function (name, value, options) {
            return this(name, value, options);
        },


        /**
         * Get the value of a cookie and parse it as json.
         *
         * <p>To get the value of a scrambled cookie, you must specify the {scramble:true} option.</p>
         *
         * @returns {Object} The value of the cookie parsed as json string and returned as a Javascript data structure.
         * If the cookie is not set, or the json string cannot be parsed, returns an empty object.
         *
         * @param {String} name Name of the cookie.
         * @param {Object} [options] Refer to {@link cookie()} for available options.
         *
         * @example
         * v = cookie.getJson('mycookie');
         * if (v.firstname) { ... }
         *
         * @example
         * // Get the value of a scrambled cookie
         * v = cookie.getJson('mycookie', {scramble:true});
         */
        getJson: function (name, options) {

            var value = this(name, undefined, options);

            // If cookie doesn't exist, return empty object
            if (value === null) {
                return {};
            }

            // If the cookie doesn't contain json data,
            // parsing it will cause an error.
            try {
                value = JSON.parse(value);
                return value;
            } catch (e) {
                // In case of parsing error, return empty object
                return {};
            }
        },


        /**
         * Set the value of a cookie to a json string.
         *
         * @returns {String} The cookie value. If the scramble option was specified, returns the scrambled value.
         *
         * @param {String} name Name of the cookie.
         * @param {Object} oValue A javascript data structure to encode into a json string.
         * @param {Object} [options] Refer to {@link cookie()} for available options.
         *
         * @example
         * cookie.setJson('mycookie', {first:'Joe',last:'Smith'});
         */
        setJson: function (name, oValue, options) {
            return this(name, JSON.stringify(oValue), options);
        },


        /**
         * Determine if a cookie exists.
         *
         * @returns {Boolean} True if the cookie exists.
         *
         * @param {String} name Name of the cookie.
         *
         * @example
         * if (cookie.exists('mycookie')) { ... }
         */
        exists: function (name) {
            return (this(name) !== null);
        },


        /**
         * Delete (expire) a cookie.
         *
         * You must use the same path/domain options that were used in creating the cookie.
         *
         * We could not call this method "delete" because that is a reserved word.
         *
         * @returns {String} Empty string.
         *
         * @param {String} name Name of the cookie.
         * @param {Object} [options] Refer to {@link cookie()} for available options.
         *
         * @example
         * cookie.deleteCookie('mycookie');
         *
         * @example
         * cookie.deleteCookie('mycookie', {path:'/'});
         */
        deleteCookie: function (name, options) {
            return this(name, '', $.extend({}, options, {expires: -1}));
        },


        /**
         * Plug-in architecture for different ways to scramble the cookie.
         * This is an object with key:value pairs:
         *
         * <ul>
         * <li>
         *   key = the prefix of the scramble algorithm (such as "rot13", or "rot13n").
         *   This should be a small string (5 chars or less) and only contain alphanumeric characters.
         * </li>
         * <li>
         *   value = an object with two parameters:
         *   <ul>
         *     <li>encode = a function that encodes the cookie value string</li>
         *     <li>decode = a function that decodes the cookie value string</li>
         *   </ul>
         * </li>
         * </ul>
         *
         * <p>Note when the encoded text is stored in the cookie, the key is added to the front
         * of the cookie data, like "[rot13]slkdfjousadfsdf".</p>
         *
         * @example
         *
         * // Add a new scramble option
         * cookie.scramblers.myScramble = {
		 *
		 *   encode: function(s) {
		 *     // Do something to encode the string
		 *     return s;
		 *   },
		 *
		 *   decode: function(s) {
		 *     // Do something to decode the string
		 *     return s;
		 *   }
		 * };
         *
         */
        scramblers: {


            // rot13 scramble
            // Scrambles letters a-zA-Z but not numbers.
            rot13: {

                encode: function (text) {
                    return rot13(text);
                },

                decode: function (text) {
                    return rot13(text);
                }
            },


            // rot13n scramble
            // Scrambles letters a-zA-Z and numbers 0-9
            rot13n: {

                encode: function (text) {
                    return rot5(rot13(text));
                },

                decode: function (text) {
                    return rot5(rot13(text));
                }
            }
        },

        /**
         * Default scramble algorithm, used if a scramble algorithm is not specified,
         * or if an invalid algorithm is specified. By default this is 'rot13n'.
         */
        scramblerDefault: 'rot13n'


    }); // end extend

});
