# n8n-nodes-withings

This is an n8n community node for integrating with the [Withings](https://www.withings.com/) API. It allows you to connect to your Withings account and access health and fitness data through OAuth2 authentication.

## Features

- OAuth2 authentication with Withings API
- Complete integration with Withings API resources:
  - Activity data (getactivity, getsummary, getworkouts)
  - Measurements (getmeas, getactivity, getintradayactivity)
  - Sleep data (get, getsummary)
  - User information (getdevice, getgoals, get)
- Customizable parameters for all API operations
- Proper error handling and response formatting

## Prerequisites

- [n8n](https://n8n.io/) (version 1.0.0 or later, tested with 1.104.2)
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

### Withings OAuth2 Specifics

The Withings API has some special requirements for OAuth2 authentication:

- The token request requires an additional `action=requesttoken` parameter
- Authentication for API requests uses Bearer token in the Authorization header
- Token exchange requires specific formatting of the request body
- **Access tokens expire after 30 seconds** and need to be refreshed frequently

This node handles these requirements automatically through a custom authentication implementation. The token refresh is managed automatically with the following mechanisms:

1. **Proactive Token Refresh**: Tokens are refreshed 5 seconds before their 30-second expiration
2. **Smart Retry Logic**: If a token error occurs, the node uses an intelligent retry mechanism with:
   - Enhanced error detection for various token-related errors
   - Exponential backoff with jitter to prevent request storms
   - Detailed logging of token errors and retry attempts
   - Graceful failure with informative error messages after multiple attempts

These mechanisms work together to ensure reliable API communication even with Withings' short-lived tokens.

## Usage

The Withings API node provides access to various health and fitness data from your Withings account. Here's how to use it:

1. Add the Withings API node to your workflow
2. Select the Withings OAuth2 API credentials (create them if you haven't already)
3. Choose a resource (Activity, Measure, Sleep, or User)
4. Select an operation for the chosen resource
5. Configure any additional parameters as needed

### Available Resources and Operations

#### Activity Resource
- **Get Activity**: Retrieves user activity data
- **Get Summary**: Gets a summary of user activity
- **Get Workouts**: Retrieves workout data

#### Measure Resource
- **Get Measurements**: Retrieves body measurements (weight, height, etc.)
- **Get Activity**: Gets activity measurements
- **Get Intradayactivity**: Retrieves detailed intraday activity data

#### Sleep Resource
- **Get**: Retrieves sleep data
- **Get Summary**: Gets a summary of sleep data

#### User Resource
- **Get Device**: Retrieves information about user devices
- **Get Goals**: Gets user goals
- **Get**: Retrieves user information

### Common Parameters

Most operations support the following parameters:
- **Start Date**: The start date for data retrieval
- **End Date**: The end date for data retrieval
- **Last Update**: Get only data updated after this date
- **Offset**: Skip this many records

### Measure-Specific Parameters
- **Measure Type**: Select the types of measurements to retrieve (weight, height, blood pressure, etc.)

### Sleep-Specific Parameters
- **Data Fields**: Select the types of sleep data to retrieve (heart rate, respiration rate, snoring)

## Resources

- [Withings API Documentation](https://developer.withings.com/api-reference)
- [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/community-nodes/)

## Version History

- 0.4.3: Enhanced token error detection and improved retry mechanism with smart backoff
- 0.4.2: Improved token refresh handling with exponential backoff retry mechanism
- 0.4.1: Added support for Withings' 30-second token expiration with automatic refresh
- 0.4.0: Fixed empty Access Token URL field by using correct field name (accessTokenUrl)
- 0.3.9: Fixed "Unable to sign without access token" error in sleep summary endpoint
- 0.3.8: Fixed "Unable to sign without access token" error in sleep data endpoint
- 0.3.7: Changed credential type from genericAuth to oAuth2Api to enable Connect button
- 0.3.6: Implemented special Withings OAuth2 requirements with custom token exchange
- 0.3.5: Fixed empty Access Token URL field in credentials
- 0.3.4: Fixed "Unable to sign without access token" error in OAuth2 authentication
- 0.3.3: Made OAuth2 URLs hidden in the credentials UI for cleaner interface
- 0.3.2: Improved compatibility with n8n 1.104.2 for OAuth2 credential fields
- 0.3.1: Fixed Access Token URL field visibility in credentials
- 0.3.0: Fixed authentication issues with OAuth2 implementation
- 0.2.0: Complete implementation of Withings API with all resources and operations
- 0.1.0: Initial release with OAuth2 authentication support

## License

[MIT](LICENSE.md)
