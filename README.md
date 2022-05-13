# Account Process

![Build Status](https://github.com/janis-commerce/account-process/workflows/Build%20Status/badge.svg)
[![Coverage Status](https://coveralls.io/repos/github/janis-commerce/account-process/badge.svg?branch=master)](https://coveralls.io/github/janis-commerce/account-process?branch=master)
[![npm version](https://badge.fury.io/js/%40janiscommerce%2Faccount-process.svg)](https://www.npmjs.com/package/@janiscommerce/account-process)

Creates or Updates a Process of Janis Commerce Service Account

## :arrow_down: Installation
```sh
npm install @janiscommerce/account-process
```

## :new: Changes from _v2.0.0_

### Using Lambda instead of Api

Now the package uses Commerce Lambda function `SaveAccountProcess` instead of old Api.

### Response

The response of `send()` has changed cause now we are using [lambda](https://www.npmjs.com/package/@janiscommerce/lambda) instead of [microservice-call](https://www.npmjs.com/package/@janiscommerce/microservice-call).

<details>
    <summary>Response 200 Example</summary>

**Previous response**

```json
{
    "statusCode": 200,
    "body": {
        "id": "5dea9fc691240d0008408000",
    }
}
```

**Current response**

```json
{
    "statusCode": 200,
    "payload": {
        "code": 200,
        "accountProcess": {
            "id": "5dea9fc691240d0008408000",
            "service": "my-service-name",
            "process": "import-readme",
            "accountId": "5dea9fc691240d00084083f8",
            "status": "pending"
        }
    }
}
```
</details>

<details>
    <summary>Response 404 Example</summary>

**Previous response**

```json
{
    "statusCode": 404,
    "body": {
        "message": "Account not found",
    }
}
```

**Current response**

```json
{
    "statusCode": 200,
    "payload": {
        "code": 404,
        "errorMessage": "Account not found for ID '5dea9fc691240d0008408000'"
    }
}
```
</details>


## :wrench: Configuration

:warning: This package need to be instance with [API-Session](https://github.com/janis-commerce/api-session), before use.


:x: Wrong:
```js
const { AccountProcess } = require('@janiscommerce/account-process');
const accountProcess = new AccountProcess();
```

:heavy_check_mark: Good:
```js
const { AccountProcess } = require('@janiscommerce/account-process');
const { ApiSession } = require('@janiscommerce/api-session');

const accountProcess = session.getSessionInstance(AccountProcess);
```

## :calling: API

* `send(accountId, processName, status, content, options)`
    * **Async**
    * Description: Update `processName` for `accountId` in Commerce with `status`.
    * Parameters:
        * `accountId` : *ObjectId* Account ID in Commerce
        * `processName` : *String* name of the process
        * `status` : *String* new Status for that process
        * `content` : *Object*, **OPTIONAL**, Extra Data you want to add for that process, whatever you want to save, for example a message, or an error stack, etc.
        * `options` : *Object*, **OPTIONAL**, To add the Start Date or an End Date.
            * `dateStart`: *Boolean* `true` or Date *Object*
            * `dateEnd`: *Boolean* `true` or Date *Object*
    * Returns: *Object*
        * `statusCode`: Status code response from the **Commerce** Lambda `SaveAccountProcess`
        * `payload`: *Object*
            * `code`: *Number*. Status code with the process response
            * `accountProcess`: *Object*. The AccountProcess saved in Commerce Service

## :spades: Statuses

You can get the valid Statuses using:

* `statuses`
    * **static getter**
    * Returns: *Object*
        * `pending`
        * `processing`
        * `success`
        * `error`

| Status | Using package | View in **Commerce** Service |
|------|-----------------|-----------------------|
| pending | `AccountProcess.statuses.pending` | ![account-process-status-pending](https://user-images.githubusercontent.com/39351850/89794239-23c64980-dafd-11ea-8f1c-9e9d593b829e.png) |
| processing | `AccountProcess.statuses.processing` | ![account-process-status-processing](https://user-images.githubusercontent.com/39351850/89794244-2628a380-dafd-11ea-9445-b91831f70c37.png) |
| success | `AccountProcess.statuses.success` | ![account-process-status-success](https://user-images.githubusercontent.com/39351850/89794248-288afd80-dafd-11ea-839a-91a47a28e8fd.png) |
| error | `AccountProcess.statuses.error` | ![account-process-status-error](https://user-images.githubusercontent.com/39351850/89794254-2aed5780-dafd-11ea-9287-72c2bd61b41a.png) |

 ## Content

This is used to keep an extra information in Account Process API, like a log.

In the process:

```js
await accountProcess.send(
    '5dea9fc691240d00084083f8',
    'import-readme',
    AccountProcess.statuses.pending,
    { message: 'Start Importing Categories from ' } // CONTENT
);
```

In Commerce:

![account-process-content](https://user-images.githubusercontent.com/39351850/89668364-018dbb00-d8b4-11ea-8bbd-b19a2f223056.png)

## :clock1: Options

Now, there are 2 options

* `startDate`: *Boolean* `true` or specific Date `Object`, to add an Date-Now ISO-String, to indicate the start of the process
* `endDate`: *Boolean* `true` or specific Date `Object`, to add an Date-Now ISO-String, to indicate the end of the process

This is use to set in Account-Process API these properties.

In the process:

```js

const accountProcess = this.session.getSessionInstance(AccountProcess);

// Start the process in current date
await accountProcess.send(
    '5dea9fc691240d00084083f8',
    'import-readme',
    AccountProcess.statuses.pending,
    null,
    { startDate: true }
);

// Start the process in a specific date
await accountProcess.send(
    '5dea9fc691240d00084083f8',
    'import-readme',
    AccountProcess.statuses.pending,
    null,
    { startDate: myStoredStartDate }
);

// Finish the process in current date
await accountProcess.send(
    '5dea9fc691240d00084083f8',
    'import-readme',
    AccountProcess.statuses.success,
    null,
    { endDate: true }
);

// Finish the process in specific date
await accountProcess.send(
    '5dea9fc691240d00084083f8',
    'import-readme',
    AccountProcess.statuses.success,
    null,
    { endDate: myStoredEndDate }
);
```

## :arrow_forward: Usage

* Send with minimal data, and pending status, and create a process in Commerce

```js

const accountProcess = this.session.getSessionInstance(AccountProcess);

const response = await accountProcess.send(
    '5dea9fc691240d00084083f8',
    'import-readme',
    AccountProcess.statuses.pending
)

/*
Response: {
    statusCode: 200,
    payload: {
        code: 200,
        accountProcess: {
            id: '5dea9fc691240d0008408000', // the id of the AccountProcess created or updated
            service: 'my-service-name',
            process: 'import-readme',
            accountId: '5dea9fc691240d00084083f8',
            status: 'pending'
        }
    }
}

*/

```
* Send with content, and processing status, and Account is not found in Commerce

```js

const accountProcess = this.session.getSessionInstance(AccountProcess);

const response = await accountProcess.send(
    '5dea9fc691240d00084083f8',
    'import-readme',
    AccountProcess.statuses.processing,
    { itemsImported: 10, itemsNotModified: 1 }
);

/*
Response: {
    statusCode: 200,
    payload: {
        code: 404,
        errorMessage: 'Account not found for ID \'5dea9fc691240d00084083f8\''
    }
}

*/

```
* Send with a Start Date and error status, and Commerce is failing

```js

const accountProcess = this.session.getSessionInstance(AccountProcess);

const response = await accountProcess.send(
    '5dea9fc691240d00084083f8',
    'import-readme',
    AccountProcess.statuses.error,
    null // No Content,
    { startDate: true }
);

/*
Response: {
    statusCode: 503
}

*/

```

* Send with an End Date, and success status, and update an existing process in Commerce

```js

const accountProcess = this.session.getSessionInstance(AccountProcess);

const response = await accountProcess.send(
    '5dea9fc691240d00084083f8',
    'import-readme',
    AccountProcess.statuses.success,
    { importedCount: 56400 },
    { endDate: true }
);

/*
Response: {
    statusCode: 200,
    payload: {
        code: 200,
        accountProcess: {
            id: '5dea9fc691240d0008408000',
            service: 'my-service-name',
            process: 'import-readme',
            accountId: '5dea9fc691240d00084083f8',
            status: 'success'
            endDate: '2022-05-13T13:26:25.414Z',
            content: { importedCount: 56400 }
        }
    }
}

*/

```

## :x: Errors

The errors are informed with a `AccountProcessError`.
This object has a code that can be useful for a debugging or error handling.
The codes are the following:

| Code | Description            |
|------|------------------------|
| 1    | No Session             |
| 2    | Invalid Account Id     |
| 3    | Invalid Process Name   |
| 4    | Invalid Status         |
| 5    | Invalid Content        |
| 6    | Invalid Options        |
