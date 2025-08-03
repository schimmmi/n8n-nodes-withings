module.exports = {
	nodes: [
		{
			packageName: 'n8n-nodes-withings',
			nodeClass: 'WithingsApi',
			sourcePath: './dist/nodes/WithingsApi/WithingsApi.node.js',
		},
	],
	credentials: [
		{
			packageName: 'n8n-nodes-withings',
			credentialClass: 'WithingsOAuth2Api',
			sourcePath: './dist/credentials/WithingsOAuth2Api.credentials.js',
		},
	],
};
