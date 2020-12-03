'use strict';

const AccountProcessError = require('../account-process-error');
const processStatuses = require('./process-statuses');

module.exports = class AccountProcessValidator {

	/**
	 * Validate Params to make a successuful request to Commerce Account Process API
	 * @param {*} session
	 * @param {*} accountId
	 * @param {*} processName
	 * @param {*} newStatus
	 * @param {*} content
	 * @param {*} options
	 */
	static validateParams(session, accountId, processName, newStatus, content, options) {

		if(!session)
			throw new AccountProcessError('No Session found', AccountProcessError.codes.NO_SESSION);

		if(!this.isObjectId(accountId))
			throw new AccountProcessError('Invalid Account Id', AccountProcessError.codes.INVALID_ACCOUNTS_ID);

		if(!this.isString(processName))
			throw new AccountProcessError('Invalid Process Name', AccountProcessError.codes.INVALID_PROCESS_NAME);

		if(!Object.values(processStatuses).includes(newStatus))
			throw new AccountProcessError('Invalid Status', AccountProcessError.codes.INVALID_STATUS);

		if(content && !this.isObject(content))
			throw new AccountProcessError('Invalid Content', AccountProcessError.codes.INVALID_CONTENT);

		if(options && !this.isObject(options))
			throw new AccountProcessError('Invalid Options', AccountProcessError.codes.INVALID_OPTIONS);
	}

	/**
	 * Validate if Value is String
	 * @param {*} value
	 */
	static isString(value) {
		return typeof value === 'string';
	}

	/**
	 * Validate if Value is ObjectId
	 * @param {*} value
	 */
	static isObjectId(value) {
		return typeof value === 'string' && /^[0-9a-fA-F]{24}$/.test(value);
	}

	/**
	 * Validate if Value is Object
	 * @param {*} value
	 */
	static isObject(value) {
		return typeof value === 'object' && !Array.isArray(value);
	}
};
