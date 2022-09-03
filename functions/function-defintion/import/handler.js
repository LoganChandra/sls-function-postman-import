const { okResponse, errResponse } = require('../../utils/response.js');
const { Collection, Item, Header } = require('postman-collection');

module.exports.lambda_handler = async (event) => {
	const { requestId } = event.requestContext;
	const { definition, apiEndpoint, apiName, headers } = JSON.parse(event.body);

	try {
		// DEFINING THE HEADERS
		const requestHeader = createHeader(headers)

		// CREATING POSTMAN COLLECTION
		const postmanCollection = new Collection({
			info: {
				name: apiName
			},
			item: [],
		});

		// ADDING ITEMS TO THE POSTMAN COLLECTIONS
		Object.entries(definition).forEach(entry => {
			const [key, value] = entry;
			const postmanRequest = createRequest(key, value, requestHeader, apiEndpoint)
			postmanCollection.items.add(postmanRequest);
		});

		// JSONIFYING COLLECTION
		const collectionJSON = postmanCollection.toJSON();

		return okResponse({
			data: collectionJSON,
		});
	} catch (e) {
		console.log("ERROR", e)
		return errResponse({
			request_id: requestId,
			message: 'Unable to post data',
			status_code: 400,
			error_object: e.response?.data.error || e,
		});
	}
};

// CREATE HEADERS FOR THE REQUEST
function createHeader(headers) {
	// EXAMPLE: 'Authorization:\nContent-Type:application/json\ncache-control:no-cache\n';
	const rawHeaderString = headers;
	const rawHeaders = Header.parse(rawHeaderString);
	return rawHeaders.map((h) => new Header(h));
}

// CREATING THE REQUESTS
function createRequest(functionName, details, requestHeader, apiEndpoint) {
	console.log("functionName, details, requestHeader, apiEndpoint", JSON.stringify(functionName), JSON.stringify(details), JSON.stringify(requestHeader), JSON.stringify(apiEndpoint))
	let httpEvent = (details?.events || []).filter(ele => ele.http != undefined)[0]
	let postmanRequest = new Item({
		name: functionName,
		request: {
			header: requestHeader,
			url: {
				raw: `${apiEndpoint}/${httpEvent?.http?.path}`,
				host: [
					apiEndpoint
				],
				path: httpEvent?.http?.path.split('/')
			},
			method: httpEvent?.http?.method,
			auth: null,
		}
	});
	return postmanRequest
}
