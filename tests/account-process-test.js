'use strict';

const assert = require('assert');
const sinon = require('sinon');

const { Invoker } = require('@janiscommerce/lambda');
const { ApiSession } = require('@janiscommerce/api-session');

const {
	AccountProcess,
	AccountProcessError
} = require('../');

describe('AccountProcess', () => {

	const session = new ApiSession({
		clientCode: 'defaultClient'
	});

	const validAccountId = '5dea9fc691240d00084083f8';
	const validProcessName = 'test-process';

	const invalidAccountId = 1;
	const invalidProcessName = 1;


	const basicParams = [
		validAccountId,
		validProcessName,
		'pending'
	];

	const commerceAccountProcessId = '5dea9fc691240d0008408300';

	const createInvokeResponse = (code, body) => ({ code, body });

	const assertSaveAccountProcess = data => {
		sinon.assert.calledOnceWithExactly(Invoker.serviceClientCall, 'commerce', 'SaveAccountProcess', session, {
			...data,
			service: 'catalog'
		});
	};

	let originalEnv;

	beforeEach(() => {
		originalEnv = { ...process.env };
	});

	afterEach(() => {
		process.env = originalEnv;
		sinon.restore();
	});

	context('When send called with invalid or missing parameters', () => {

		beforeEach(() => {
			process.env.JANIS_SERVICE_NAME = 'catalog';
			sinon.spy(Invoker, 'serviceClientCall');
		});

		afterEach(() => {
			sinon.assert.notCalled(Invoker.serviceClientCall);
		});

		[
			['accountId', [], AccountProcessError.codes.INVALID_ACCOUNTS_ID],
			['process', [validAccountId], AccountProcessError.codes.INVALID_PROCESS_NAME],
			['status', [validAccountId, validProcessName], AccountProcessError.codes.INVALID_STATUS]
		].forEach(([fieldName, params, errorCode]) => {

			it(`Should reject if ${fieldName} is missing`, async () => {
				const accountProcess = session.getSessionInstance(AccountProcess);
				await assert.rejects(accountProcess.send(...params), { code: errorCode });
			});
		});

		[
			['accountId', [invalidAccountId, validProcessName, 'pending'], AccountProcessError.codes.INVALID_ACCOUNTS_ID],
			['process', [validAccountId, invalidProcessName], AccountProcessError.codes.INVALID_PROCESS_NAME],
			['status', [validAccountId, validProcessName, 'testing'], AccountProcessError.codes.INVALID_STATUS],
			['content', [validAccountId, validProcessName, 'pending', 'Message'], AccountProcessError.codes.INVALID_CONTENT],
			['options', [validAccountId, validProcessName, 'pending', null, true], AccountProcessError.codes.INVALID_OPTIONS]
		].forEach(([fieldName, params, errorCode]) => {

			it(`Should reject if ${fieldName} is invalid`, async () => {
				const accountProcess = session.getSessionInstance(AccountProcess);
				await assert.rejects(accountProcess.send(...params), { code: errorCode });
			});
		});
	});

	context('When send called with valid parameters', () => {

		beforeEach(() => {
			process.env.JANIS_SERVICE_NAME = 'catalog';
		});

		it('Should reject if No Session is found', async () => {

			process.env.JANIS_SERVICE_NAME = 'catalog';

			const accountProcessWithoutSession = new AccountProcess();

			sinon.stub(Invoker, 'serviceClientCall');

			await assert.rejects(accountProcessWithoutSession.send(...basicParams), { code: AccountProcessError.codes.SESSION_MISSING });

			sinon.assert.notCalled(Invoker.serviceClientCall);
		});

		it('Should call Commerce API with minimal fields', async () => {

			sinon.stub(Invoker, 'serviceClientCall')
				.resolves(createInvokeResponse(200, { id: commerceAccountProcessId }));

			const accountProcess = session.getSessionInstance(AccountProcess);

			assert.deepStrictEqual(await accountProcess.send(...basicParams), { code: 200, body: { id: commerceAccountProcessId } });

			assertSaveAccountProcess({
				process: validProcessName,
				status: 'pending',
				accountId: validAccountId
			});
		});

		it('Should call Commerce API with content', async () => {

			sinon.stub(Invoker, 'serviceClientCall')
				.resolves(createInvokeResponse(200, { id: commerceAccountProcessId }));

			const accountProcess = session.getSessionInstance(AccountProcess);

			assert.deepStrictEqual(await accountProcess.send(...basicParams, { message: 'Ok' }),
				{ code: 200, body: { id: commerceAccountProcessId } });

			assertSaveAccountProcess({
				process: validProcessName,
				status: 'pending',
				content: { message: 'Ok' },
				accountId: validAccountId
			});
		});

		it('Should call Commerce API with Start Date Option', async () => {

			sinon.stub(Invoker, 'serviceClientCall')
				.resolves(createInvokeResponse(200, { id: commerceAccountProcessId }));

			const accountProcess = session.getSessionInstance(AccountProcess);

			assert.deepStrictEqual(await accountProcess.send(...basicParams, null, { startDate: true }),
				{ code: 200, body: { id: commerceAccountProcessId } });

			assertSaveAccountProcess({
				process: validProcessName,
				status: 'pending',
				startDate: sinon.match.date,
				accountId: validAccountId
			});
		});

		it('Should call Commerce API with a Specific Start Date Option', async () => {

			sinon.stub(Invoker, 'serviceClientCall')
				.resolves(createInvokeResponse(200, { id: commerceAccountProcessId }));

			const accountProcess = session.getSessionInstance(AccountProcess);

			assert.deepStrictEqual(await accountProcess.send(...basicParams, null, { startDate: new Date() }),
				{ code: 200, body: { id: commerceAccountProcessId } });

			assertSaveAccountProcess({
				process: validProcessName,
				status: 'pending',
				startDate: sinon.match.date,
				accountId: validAccountId
			});
		});

		it('Should call Commerce API with End Date Option', async () => {

			sinon.stub(Invoker, 'serviceClientCall')
				.resolves(createInvokeResponse(200, { id: commerceAccountProcessId }));

			const accountProcess = session.getSessionInstance(AccountProcess);

			assert.deepStrictEqual(await accountProcess.send(...basicParams, null, { endDate: true }),
				{ code: 200, body: { id: commerceAccountProcessId } });

			assertSaveAccountProcess({
				process: validProcessName,
				status: 'pending',
				endDate: sinon.match.date,
				accountId: validAccountId
			});
		});

		it('Should call Commerce API with specific End Date Option', async () => {

			sinon.stub(Invoker, 'serviceClientCall')
				.resolves(createInvokeResponse(200, { id: commerceAccountProcessId }));

			const accountProcess = session.getSessionInstance(AccountProcess);

			assert.deepStrictEqual(await accountProcess.send(...basicParams, null, { endDate: new Date() }),
				{ code: 200, body: { id: commerceAccountProcessId } });

			assertSaveAccountProcess({
				process: validProcessName,
				status: 'pending',
				endDate: sinon.match.date,
				accountId: validAccountId
			});
		});

		it('Should call Commerce API with minimal fields if Options has an invalid field', async () => {

			sinon.stub(Invoker, 'serviceClientCall')
				.resolves(createInvokeResponse(200, { id: commerceAccountProcessId }));

			const accountProcess = session.getSessionInstance(AccountProcess);

			assert.deepStrictEqual(await accountProcess.send(...basicParams, null, { makeMagic: true }),
				{ code: 200, body: { id: commerceAccountProcessId } });

			assertSaveAccountProcess({
				process: validProcessName,
				status: 'pending',
				accountId: validAccountId
			});
		});

		it('Should call Commerce API with full fields', async () => {

			sinon.stub(Invoker, 'serviceClientCall')
				.resolves(createInvokeResponse(200, { id: commerceAccountProcessId }));

			const accountProcess = session.getSessionInstance(AccountProcess);

			assert.deepStrictEqual(await accountProcess.send(...basicParams, { message: 'Ok' }, { startDate: true, endDate: true }),
				{ code: 200, body: { id: commerceAccountProcessId } });

			assertSaveAccountProcess({
				process: validProcessName,
				status: 'pending',
				content: { message: 'Ok' },
				startDate: sinon.match.date,
				endDate: sinon.match.date,
				accountId: validAccountId
			});
		});

		it('Should return 404 as response if Account is not found in Commerce', async () => {

			sinon.stub(Invoker, 'serviceClientCall')
				.resolves(createInvokeResponse(404, { message: 'Account not found' }));

			const accountProcess = session.getSessionInstance(AccountProcess);

			assert.deepStrictEqual(await accountProcess.send(...basicParams), { code: 404, body: { message: 'Account not found' } });

			assertSaveAccountProcess({
				process: validProcessName,
				status: 'pending',
				accountId: validAccountId
			});
		});

		it('Should return 500 as response if Commerce fails', async () => {

			sinon.stub(Invoker, 'serviceClientCall')
				.resolves(createInvokeResponse(500, { message: 'Internal Commerce Error' }));

			const accountProcess = session.getSessionInstance(AccountProcess);

			assert.deepStrictEqual(await accountProcess.send(...basicParams), { code: 500, body: { message: 'Internal Commerce Error' } });

			assertSaveAccountProcess({
				process: validProcessName,
				status: 'pending',
				accountId: validAccountId
			});
		});
	});

	context('When no JANIS_SERVICE_NAME is set', () => {
		it('Should reject if env JANIS_SERVICE_NAME is found', async () => {

			const accountProcess = session.getSessionInstance(AccountProcess);

			sinon.stub(Invoker, 'serviceClientCall');

			await assert.rejects(accountProcess.send(...basicParams), { code: AccountProcessError.codes.SERVICE_NAME_MISSING });

			sinon.assert.notCalled(Invoker.serviceClientCall);
		});

	});


});
