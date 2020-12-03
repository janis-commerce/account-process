'use strict';

const assert = require('assert');
const sandbox = require('sinon');

const MsCall = require('@janiscommerce/microservice-call');
const { ApiSession } = require('@janiscommerce/api-session');

const {
	AccountProcess,
	AccountProcessError
} = require('../lib');

describe('Account-Process', () => {

	const session = new ApiSession({
		userIsDev: true,
		clientCode: 'defaultClient',
		permissions: [],
		locations: [],
		hasAccessToAllLocations: true
	});

	const accountProcess = session.getSessionInstance(AccountProcess);

	const validAccountId = '5dea9fc691240d00084083f8';
	const validProcessName = 'test-process';

	const invalidAccountId = 1;
	const invalidProcessName = 1;

	afterEach(() => {
		sandbox.restore();
	});

	context('When send called with invalid or missing parameters', () => {

		[
			['Accounts Ids', [], AccountProcessError.codes.INVALID_ACCOUNTS_ID],
			['Process Name', [validAccountId], AccountProcessError.codes.INVALID_PROCESS_NAME],
			['Status', [validAccountId, validProcessName], AccountProcessError.codes.INVALID_STATUS]
		].forEach(([fieldName, params, errorCode]) => {

			it(`Should reject if ${fieldName} is not passed`, async () => {

				sandbox.stub(MsCall.prototype, 'safeCall');

				await assert.rejects(accountProcess.send(...params), { code: errorCode });

				sandbox.assert.notCalled(MsCall.prototype.safeCall);
			});
		});

		[
			['Account Id', [invalidAccountId, validProcessName, AccountProcess.statuses.pending], AccountProcessError.codes.INVALID_ACCOUNTS_ID],
			['Process Name', [validAccountId, invalidProcessName], AccountProcessError.codes.INVALID_PROCESS_NAME],
			['Status', [validAccountId, validProcessName, 'testing'], AccountProcessError.codes.INVALID_STATUS],
			['Content', [validAccountId, validProcessName, AccountProcess.statuses.pending, 'Message'], AccountProcessError.codes.INVALID_CONTENT],
			['Options', [validAccountId, validProcessName, AccountProcess.statuses.pending, null, true], AccountProcessError.codes.INVALID_OPTIONS]
		].forEach(([fieldName, params, errorCode]) => {

			it(`Should reject if ${fieldName} is invalid`, async () => {

				sandbox.stub(MsCall.prototype, 'safeCall');

				await assert.rejects(accountProcess.send(...params), { code: errorCode });

				sandbox.assert.notCalled(MsCall.prototype.safeCall);
			});
		});
	});

	context('When send called with valid parameters', () => {

		const basicParams = [
			validAccountId,
			validProcessName,
			AccountProcess.statuses.pending
		];

		const commerceAccountProcessId = '5dea9fc691240d0008408300';

		const makeMsCallResponse = (statusCode, body) => ({
			statusCode,
			body
		});

		it('Should reject if No Session is found', async () => {

			const accountProcessWithoutSession = new AccountProcess();

			sandbox.stub(MsCall.prototype, 'safeCall');

			await assert.rejects(accountProcessWithoutSession.send(...basicParams), { code: AccountProcessError.codes.NO_SESSION });

			sandbox.assert.notCalled(MsCall.prototype.safeCall);
		});

		it('Should call Commerce API with minimal fields', async () => {

			sandbox.stub(MsCall.prototype, 'safeCall').returns(makeMsCallResponse(200, { id: commerceAccountProcessId }));

			assert.deepStrictEqual(await accountProcess.send(...basicParams), { statusCode: 200, body: { id: commerceAccountProcessId } });

			sandbox.assert.calledOnceWithExactly(MsCall.prototype.safeCall, 'commerce', 'account-process', 'update', {
				process: validProcessName,
				status: AccountProcess.statuses.pending
			}, null, { id: validAccountId });
		});

		it('Should call Commerce API with content', async () => {

			sandbox.stub(MsCall.prototype, 'safeCall').returns(makeMsCallResponse(200, { id: commerceAccountProcessId }));

			assert.deepStrictEqual(await accountProcess.send(...basicParams, { message: 'Ok' }),
				{ statusCode: 200, body: { id: commerceAccountProcessId } });

			sandbox.assert.calledOnceWithExactly(MsCall.prototype.safeCall, 'commerce', 'account-process', 'update', {
				process: validProcessName,
				status: AccountProcess.statuses.pending,
				content: { message: 'Ok' }
			}, null, { id: validAccountId });
		});

		it('Should call Commerce API with Start Date Option', async () => {

			sandbox.stub(MsCall.prototype, 'safeCall').returns(makeMsCallResponse(200, { id: commerceAccountProcessId }));

			assert.deepStrictEqual(await accountProcess.send(...basicParams, null, { startDate: true }),
				{ statusCode: 200, body: { id: commerceAccountProcessId } });

			sandbox.assert.calledOnceWithExactly(MsCall.prototype.safeCall, 'commerce', 'account-process', 'update', {
				process: validProcessName,
				status: AccountProcess.statuses.pending,
				startDate: sandbox.match.date
			}, null, { id: validAccountId });
		});

		it('Should call Commerce API with a Specific Start Date Option', async () => {

			sandbox.stub(MsCall.prototype, 'safeCall').returns(makeMsCallResponse(200, { id: commerceAccountProcessId }));

			assert.deepStrictEqual(await accountProcess.send(...basicParams, null, { startDate: new Date() }),
				{ statusCode: 200, body: { id: commerceAccountProcessId } });

			sandbox.assert.calledOnceWithExactly(MsCall.prototype.safeCall, 'commerce', 'account-process', 'update', {
				process: validProcessName,
				status: AccountProcess.statuses.pending,
				startDate: sandbox.match.date
			}, null, { id: validAccountId });
		});

		it('Should call Commerce API with End Date Option', async () => {

			sandbox.stub(MsCall.prototype, 'safeCall').returns(makeMsCallResponse(200, { id: commerceAccountProcessId }));

			assert.deepStrictEqual(await accountProcess.send(...basicParams, null, { endDate: true }),
				{ statusCode: 200, body: { id: commerceAccountProcessId } });

			sandbox.assert.calledOnceWithExactly(MsCall.prototype.safeCall, 'commerce', 'account-process', 'update', {
				process: validProcessName,
				status: AccountProcess.statuses.pending,
				endDate: sandbox.match.date
			}, null, { id: validAccountId });
		});

		it('Should call Commerce API with specific End Date Option', async () => {

			sandbox.stub(MsCall.prototype, 'safeCall').returns(makeMsCallResponse(200, { id: commerceAccountProcessId }));

			assert.deepStrictEqual(await accountProcess.send(...basicParams, null, { endDate: new Date() }),
				{ statusCode: 200, body: { id: commerceAccountProcessId } });

			sandbox.assert.calledOnceWithExactly(MsCall.prototype.safeCall, 'commerce', 'account-process', 'update', {
				process: validProcessName,
				status: AccountProcess.statuses.pending,
				endDate: sandbox.match.date
			}, null, { id: validAccountId });
		});

		it('Should call Commerce API with minimal fields if Options has an invalid field', async () => {

			sandbox.stub(MsCall.prototype, 'safeCall').returns(makeMsCallResponse(200, { id: commerceAccountProcessId }));

			assert.deepStrictEqual(await accountProcess.send(...basicParams, null, { makeMagic: true }),
				{ statusCode: 200, body: { id: commerceAccountProcessId } });

			sandbox.assert.calledOnceWithExactly(MsCall.prototype.safeCall, 'commerce', 'account-process', 'update', {
				process: validProcessName,
				status: AccountProcess.statuses.pending
			}, null, { id: validAccountId });
		});

		it('Should call Commerce API with full fields', async () => {

			sandbox.stub(MsCall.prototype, 'safeCall').returns(makeMsCallResponse(200, { id: commerceAccountProcessId }));

			assert.deepStrictEqual(await accountProcess.send(...basicParams, { message: 'Ok' }, { startDate: true, endDate: true }),
				{ statusCode: 200, body: { id: commerceAccountProcessId } });

			sandbox.assert.calledOnceWithExactly(MsCall.prototype.safeCall, 'commerce', 'account-process', 'update', {
				process: validProcessName,
				status: AccountProcess.statuses.pending,
				content: { message: 'Ok' },
				startDate: sandbox.match.date,
				endDate: sandbox.match.date
			}, null, { id: validAccountId });
		});

		it('Should return 404 as response if Account is not found in Commerce', async () => {

			sandbox.stub(MsCall.prototype, 'safeCall').returns(makeMsCallResponse(404, { message: 'Account not found' }));

			assert.deepStrictEqual(await accountProcess.send(...basicParams), { statusCode: 404, body: { message: 'Account not found' } });

			sandbox.assert.calledOnceWithExactly(MsCall.prototype.safeCall, 'commerce', 'account-process', 'update', {
				process: validProcessName,
				status: AccountProcess.statuses.pending
			}, null, { id: validAccountId });
		});

		it('Should return 500 as response if Commerce fails', async () => {

			sandbox.stub(MsCall.prototype, 'safeCall').returns(makeMsCallResponse(500, { message: 'Internal Commerce Error' }));

			assert.deepStrictEqual(await accountProcess.send(...basicParams), { statusCode: 500, body: { message: 'Internal Commerce Error' } });

			sandbox.assert.calledOnceWithExactly(MsCall.prototype.safeCall, 'commerce', 'account-process', 'update', {
				process: validProcessName,
				status: AccountProcess.statuses.pending
			}, null, { id: validAccountId });
		});
	});
});
