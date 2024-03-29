'use strict';

module.exports = class AccountProcessError extends Error {

	static get codes() {

		return {
			SESSION_MISSING: 1,
			INVALID_ACCOUNTS_ID: 2,
			INVALID_PROCESS_NAME: 3,
			INVALID_STATUS: 4,
			INVALID_CONTENT: 5,
			INVALID_OPTIONS: 6,
			SERVICE_NAME_MISSING: 7
		};
	}

	constructor(err, code) {
		super(err);

		this.message = err.message || err;
		this.code = code;
		this.name = 'AccountProcessError';
	}
};
