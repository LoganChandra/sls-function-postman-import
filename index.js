#! /usr/bin/env node

const { Collection, Item } = require('postman-collection');
const yaml = require('js-yaml')
const fs = require('fs')


const handler = async () => {
	let definitionInput = process.argv[0 + 2],
		endpoint = process.argv[1 + 2],
		name = process.argv[2 + 2],
		headers = process.argv[3 + 2];

	try {

		let inputfile = definitionInput
		let fileSync = fs.readFileSync(inputfile, { encoding: 'utf-8' })
		let filteredFileSync = fileSync.replace(/!ImportValue /g, "")
		let definition = yaml.load(filteredFileSync)
		let requestHeader = fs.readFileSync(headers, { encoding: 'utf-8' })

		// CREATING POSTMAN COLLECTION
		const postmanCollection = new Collection({
			info: {
				name: name
			},
			item: [],
		});

		// ADDING ITEMS TO THE POSTMAN COLLECTIONS
		Object.entries(definition).forEach(entry => {
			const [key, value] = entry;
			const postmanRequest = createRequest(key, value, requestHeader, endpoint)
			postmanCollection.items.add(postmanRequest);
		});

		// JSONIFYING COLLECTION
		const collectionJSON = postmanCollection.toJSON();

		fs.writeFile("output.json", JSON.stringify(collectionJSON), function (err) {
			if (err) {
				console.log(err);
			}
		});
	} catch (e) {
		console.log("ERROR", e)
		throw new Error(e.response?.data.error || e);
	}
};

// CREATING THE REQUESTS
function createRequest(functionName, details, requestHeader, endpoint) {
	requestHeader = JSON.parse(requestHeader)
	let httpEvent = (details?.events || []).filter(ele => ele.http != undefined)[0]
	let postmanRequest = new Item({
		name: functionName,
		request: {
			header: requestHeader,
			url: {
				raw: `${endpoint}/${httpEvent?.http?.path}`,
				host: [
					endpoint
				],
				path: httpEvent?.http?.path.split('/')
			},
			method: httpEvent?.http?.method,
			auth: null,
		}
	});
	return postmanRequest
}
handler()