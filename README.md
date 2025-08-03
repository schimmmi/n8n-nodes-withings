# n8n-nodes-withings

This is an n8n community node for integrating with the [Withings](https://www.withings.com/) API. It allows you to connect to your Withings account and access health and fitness data through OAuth2 authentication.

## Features

- OAuth2 authentication with Withings API
- Dummy node to register Withings OAuth2 API credentials

## Prerequisites

- [n8n](https://n8n.io/) (version 1.0.0 or later)
- Withings developer account and API credentials

## Installation

Follow these instructions to install this node in your n8n instance:

```bash
npm install n8n-nodes-withings
```

For Docker-based n8n installations, you can use the [n8n-docker-custom](https://github.com/n8n-io/n8n-docker-custom) approach.

## Configuration

1. Create a developer account at [Withings Developer](https://developer.withings.com/)
2. Register a new application to get your Client ID and Client Secret
3. Set the callback URL to: `https://your-n8n-domain.com/rest/oauth2-credential/callback`
4. In n8n, create a new credential of type "Withings OAuth2 API"
5. Enter your Client ID and Client Secret
6. Configure the scopes as needed (default: user.info,user.metrics,user.activity,user.sleepevents)
7. Complete the OAuth2 flow by connecting to your Withings account

## Usage

This node currently serves as a dummy node to register the Withings OAuth2 API credentials. Future versions will include additional functionality for retrieving and working with Withings data.

## Resources

- [Withings API Documentation](https://developer.withings.com/api-reference)
- [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/community-nodes/)

## Version History

- 0.1.0: Initial release with OAuth2 authentication support

## License

[MIT](LICENSE.md)
