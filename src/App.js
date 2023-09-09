import React, { useEffect, useState } from 'react';
import getRecords from './services/getRecords';
import json from './services/json';

const App = () => {
	// eslint-disable-next-line unused-imports/no-unused-vars
	const [dummy, setRecords] = useState([]);

	useEffect(() => {
		(async () => {
			const url = 'http://192.168.1.6:8080/1GBLineJSONArray.json';

			json.peekHeap();

			const records = await getRecords(url, (v) => v + 1);

			json.peekHeap();

			setRecords(records);
		})();
	}, []);

	return <div>
		streaming ndjson
	</div>;
};

export default App;
