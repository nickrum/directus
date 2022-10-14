#!/usr/bin/env node
'use strict';

const { create } = require('@directus/extensions-sdk/cli');

run();

async function run() {
	// eslint-disable-next-line no-console
	console.log('This utility will walk you through creating a Directus extension.\n');

	await create();
}
