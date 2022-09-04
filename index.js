#! /usr/bin/env node
const { Collection, Item } = require('postman-collection');
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const BUCKET_NAME = process.env.BUCKET_NAME;
const yaml = require('js-yaml')
const fs = require('fs')


const handler = async () => {
	let definitionYML = process.env.npm_config_definitionyml
	let apiEndpoint = process.env.npm_config_apiendpoint
	let apiName = process.env.npm_config_apiname
	let headerJSON = process.env.npm_config_headerjson

	let inputfile = definitionYML,
		definition = yaml.load(fs.readFileSync(inputfile, { encoding: 'utf-8' })),
		requestHeader = fs.readFileSync(headerJSON, { encoding: 'utf-8' });

	try {

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
function createRequest(functionName, details, requestHeader, apiEndpoint) {
	requestHeader = JSON.parse(requestHeader)
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

// GET SIGNED URL FROM S3
async function getSignedUrl(Obj, key) {

	const putS3Params = {
		Bucket: BUCKET_NAME,
		Key: key,
		Body: JSON.stringify(Obj),
	};
	const presignedParams = { Bucket: BUCKET_NAME, Key: key, Expires: 120 };

	await s3.putObject(putS3Params).promise();

	const signedUrl = await s3.getSignedUrlPromise(
		'getObject',
		presignedParams
	);

	return signedUrl
}
handler()