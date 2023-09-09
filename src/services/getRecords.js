/* eslint-disable init-declarations */
/* eslint-disable no-await-in-loop */
/* eslint-disable max-statements */
const getRecords = async (url, processor = (v) => v) => {
	const response = await fetch(url);
	const readableStream = response.body;

	const reader = readableStream.getReader();
	const textDecoder = new TextDecoder();

	const records = [];

	let done;
	let value;
	let balance = '';

	while(!done) {
		({ value, done } = await reader.read());
		if(done)
			return records;

		const data = (balance + textDecoder.decode(value)).split('\n');

		balance = data.pop();

		for(let i = 0; i < data.length; i++)
			records.push(JSON.parse(data[i]).map(processor));
	}
};

export default getRecords;
