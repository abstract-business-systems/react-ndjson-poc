/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */
/* eslint-disable init-declarations */
import { map } from '@laufire/utils/collection';
import axios from 'axios';
import canNdjsonStream from 'can-ndjson-stream';

const formatBytes = (bytes) => {
	const decimals = 2;

	if(!+bytes)
		return '0 Bytes';

	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ['Bytes',
		'KiB',
		'MiB',
		'GiB',
		'TiB',
		'PiB',
		'EiB',
		'ZiB',
		'YiB'];

	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return `${ parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) } ${ sizes[i] }`;
};

/* eslint-disable max-statements */
const services = {
	ndJSON: async (url) => {
		const { parse, stringify } = JSON;
		const cache = [];

		const response = await fetch(url);
		const exampleReader = canNdjsonStream(response.body).getReader();

		let result;

		while(!result || !result.done) {
			result = await exampleReader.read();
			result.value && cache.push(parse(stringify(result.value)));
		}

		return cache;
	},
	gen: (gb) => {
		const target = [];
		const unit = 1024;
		let i = unit * gb;

		while(i--)
			target.push(new Uint8Array(unit * unit));

		return target;
	},
	getChunks: async (url) => {
		const response = await fetch(url);
		const readableStream = response.body;

		const reader = readableStream.getReader();
		const chunks = [];

		let done;
		let value;

		while(!done) {
			({ value, done } = await reader.read());
			if(done)
				return chunks;

			chunks.push(value);
		}
	},
	getDecodedChunks: async (url) => {
		const chunks = await services.getChunks(url);
		const textDecoder = new TextDecoder();
		const lineJSON = chunks.map((chunk) => textDecoder.decode(chunk));

		return lineJSON;
	},
	getMutatedChunks: async (url) => {
		const chunks = await services.getChunks(url);
		const textDecoder = new TextDecoder();

		for(let i = 0; i < chunks.length; i++)
			chunks[i] = textDecoder.decode(chunks[i]);

		return chunks;
	},
	fetch: async (url) => {
		const res = await fetch(url);

		return res.json();
	},
	axiosFetch: async (url) => {
		const r = await axios(url);

		return r;
	},
	stringToJSON: JSON.parse,
	chunksToJSON: (chunks) => {
		let balance = '';

		for(let i = 0; i < chunks.length; i++) {
			const data = chunks[i].split('\n');

			data[0] = balance + data[0];
			balance = data.pop();
			chunks[i] = data;
		}

		return chunks.flat();
	},
	parseLineJSON: async (url) => {
		const records = services
			.chunksToJSON(await services.getMutatedChunks(url));

		for(let i = 0; i < records.length; i++)
			records[i] = JSON.parse(records[i]);

		return records;
	},
	peekHeap: () =>
		console.log(map(JSON.parse(JSON.stringify(window.performance.memory,
			['totalJSHeapSize', 'usedJSHeapSize', 'jsHeapSizeLimit'])),
		formatBytes)),
};

export default services;
