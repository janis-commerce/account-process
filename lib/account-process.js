'use strict';

const { Invoker } = require('@janiscommerce/lambda');

const AccountProcessError = require('./account-process-error');

const { isObject, isObjectId, isString } = require('./validators');

module.exports = class AccountProcess {

	static get statuses() {
		return {
			pending: 'pending',
			processing: 'processing',
			success: 'success',
			error: 'error'
		};
	}

	get serviceName() {
		return process.env.JANIS_SERVICE_NAME;
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
	async send(accountId, processName, status, content, options = {}) {

		this.validate(this.session, accountId, processName, status, content, options);

		const startDate = this.formatDate(options.startDate);
		const endDate = this.formatDate(options.endDate);

		const result = await Invoker.serviceClientCall('commerce', 'SaveAccountProcess', this.session, {
			service: this.serviceName,
			accountId,
			process: processName,
			status,
			...content && { content },
			...startDate && { startDate },
			...endDate && { endDate }
		});

		return result;
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

		if(!this.serviceName)
			throw new AccountProcessError('Service name from env JANIS_SERVICE_NAME is missing', AccountProcessError.codes.SERVICE_NAME_MISSING);

		if(!session)
			throw new AccountProcessError('Session is missing', AccountProcessError.codes.SESSION_MISSING);

		if(!isObjectId(accountId))
			throw new AccountProcessError('Invalid Account Id', AccountProcessError.codes.INVALID_ACCOUNTS_ID);

		if(!isString(process))
			throw new AccountProcessError('Invalid Process Name', AccountProcessError.codes.INVALID_PROCESS_NAME);

		const validStatuses = Object.values(this.constructor.statuses);

		if(!validStatuses.includes(status))
			throw new AccountProcessError(`Invalid Status, must be one of '${validStatuses.join(', ')}'`, AccountProcessError.codes.INVALID_STATUS);

		if(content && !isObject(content))
			throw new AccountProcessError('Invalid Content, must be an object', AccountProcessError.codes.INVALID_CONTENT);

		if(options && !isObject(options))
			throw new AccountProcessError('Invalid Options, must be an object', AccountProcessError.codes.INVALID_OPTIONS);
	}
};
