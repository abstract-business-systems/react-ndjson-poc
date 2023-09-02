import React, { useEffect, useState } from 'react';
import json from './services/json';

const App = () => {
	// eslint-disable-next-line unused-imports/no-unused-vars
	const [dummy, setRecords] = useState([]);

	useEffect(() => {
		(async () => {
			const url = 'http://192.168.1.6:8080/lineData1GB.json';

			json.peekHeap();

			const records = await json.getMutatedChunks(url);

			json.peekHeap();

			setRecords(records);
		})();
	}, []);

	return <div>
		streaming ndjson
	</div>;
};

export default App;
