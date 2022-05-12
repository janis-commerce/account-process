'use strict';

const { Invoker } = require('@janiscommerce/lambda');

const AccountProcessError = require('./account-process-error');

const { isObject, isObjectId, isString } = require('./validators.js');

module.exports = class AccountProcess {

	get statuses() {
		return ['pending', 'processing', 'success', 'error'];
	}

	get serviceName() {
		return 'commerce';
	}

	get functionName() {
		return 'SaveAccountProcess';
	}

	/**
	 * Send new Date to Account-process in Commerce Service
	 * @async
	 * @param {string} accountId Account ID
	 * @param {string} processName Process Name
	 * @param {string} status Status
	 * @param {object=} content Extra Data to inform
	 * @param {object=} options Options for Date components
	 * @returns {Promise<object>[]} Array of Responses
	 */
	send(accountId, processName, status, content, options = {}) {

		this.validate(this.session, accountId, processName, status, content, options);

		const startDate = this.formatDate(options.startDate);
		const endDate = this.formatDate(options.endDate);

		return Invoker.serviceClientCall(this.serviceName, this.functionName, this.session, {
			service: this.session.serviceName,
			accountId,
			process: processName,
			status,
			...content && { content },
			...startDate && { startDate },
			...endDate && { endDate }
		});
	}

	formatDate(date) {

		if(date === true)
			return new Date();

		return date || false;
	}

	/**
	 * Validate to make a successful request to Commerce AccountProcess Lambda function
	 * @param {*} session
	 * @param {*} accountId
	 * @param {*} process
	 * @param {*} status
	 * @param {*} content
	 * @param {*} options
	 */
	validate(session, accountId, process, status, content, options) {

		if(!session)
			throw new AccountProcessError('Session is missing', AccountProcessError.codes.NO_SESSION);

		if(!isObjectId(accountId))
			throw new AccountProcessError('Invalid Account Id', AccountProcessError.codes.INVALID_ACCOUNTS_ID);

		if(!isString(process))
			throw new AccountProcessError('Invalid Process Name', AccountProcessError.codes.INVALID_PROCESS_NAME);

		if(!this.statuses.includes(status))
			throw new AccountProcessError(`Invalid Status, must be one of '${this.statuses.join(', ')}'`, AccountProcessError.codes.INVALID_STATUS);

		if(content && !isObject(content))
			throw new AccountProcessError('Invalid Content, must be an object', AccountProcessError.codes.INVALID_CONTENT);

		if(options && !isObject(options))
			throw new AccountProcessError('Invalid Options, must be an object', AccountProcessError.codes.INVALID_OPTIONS);
	}
};
