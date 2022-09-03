const { okResponse, errResponse } = require('../../utils/response.js');
const { Collection, Item } = require('postman-collection');
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const BUCKET_NAME = process.env.BUCKET_NAME;

module.exports.lambda_handler = async (event) => {
	const { requestId } = event.requestContext;
	const { definition, apiEndpoint, apiName, requestHeader } = JSON.parse(event.body);

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

		// GENERATING SIGNED URL
		let fileKey = `${apiName.replace(" ", "_").toUpperCase()}${new Date().toISOString()}.json`
		let signedURL = await getSignedUrl(collectionJSON, fileKey)

		return okResponse({
			data: signedURL,
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

// CREATING THE REQUESTS
function createRequest(functionName, details, requestHeader, apiEndpoint) {
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
