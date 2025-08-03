// This file is the entry point for n8n to discover the node
// It loads the compiled JavaScript code from the dist directory

// Import from the compiled dist directory
const { nodes, credentials } = require('./dist');

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
