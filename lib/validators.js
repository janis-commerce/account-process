'use strict';

/**
 * Validate if Value is String
 * @param {*} value
 */
module.exports.isString = value => {
	return typeof value === 'string';
};

/**
 * Validate if Value is ObjectId
 * @param {*} value
 */
module.exports.isObjectId = value => {
	return typeof value === 'string' && /^[0-9a-fA-F]{24}$/.test(value);
};

/**
 * Validate if Value is Object
 * @param {*} value
 */
module.exports.isObject = value => {
	return typeof value === 'object' && !Array.isArray(value);
};
