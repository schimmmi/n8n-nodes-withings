import {
  ICredentialType,
  INodeProperties,
  ICredentialTestRequest,
  Icon,
  IAuthenticateGeneric,
  IHttpRequestOptions,
  IDataObject,
} from 'n8n-workflow';
// Use Node.js built-in modules with type declarations
import * as https from 'https';
import * as process from 'process';

import { generateSignature, getNonce, formatScope } from '../utils/withings';

export class WithingsOAuth2Api implements ICredentialType {
  name = 'withingsOAuth2Api';
  displayName = 'Withings OAuth2 API';
  description = 'OAuth2 authentication for Withings API with custom token exchange';
  documentationUrl = 'https://developer.withings.com/oauth2/';
  icon: Icon = 'file:../nodes/WithingsApi/withings.svg';
  extends = ['oAuth2Api'];
  properties: INodeProperties[] = [
    {
      displayName: 'Grant Type',
      name: 'grantType',
      type: 'hidden',
      default: 'authorizationCode',
    },
    {
      displayName: 'Authorization URL',
      name: 'authUrl',
      type: 'hidden',
      default: 'https://account.withings.com/oauth2_user/authorize2',
    },
    {
      displayName: 'Access Token URL',
      name: 'accessTokenUrl',
      type: 'hidden',
      default: 'https://wbsapi.withings.net/v2/oauth2?action=requesttoken',
    },
    {
      displayName: 'Client ID',
      name: 'clientId',
      type: 'string',
      required: true,
      default: '',
      description: 'The Client ID from your Withings Developer Account',
    },
    {
      displayName: 'Client Secret',
      name: 'clientSecret',
      type: 'string',
      typeOptions: {
        password: true,
      },
      required: true,
      default: '',
      description: 'The Client Secret from your Withings Developer Account',
    },
    {
      displayName: 'Scope',
      name: 'scope',
      type: 'string',
      default: 'user.info,user.metrics,user.activity,user.sleepevents',
      description: 'Comma-separated list of scopes with the "user." prefix. Common scopes: user.info, user.metrics, user.activity, user.sleepevents',
    },
  ];

  // Override tokenDataPostReceiveProcess to add Withings-specific parameters
  // Withings tokens expire after 30 seconds, so we need aggressive refresh handling
  tokenDataPostReceiveProcess = {
    // Include credentials in the refresh request body
    includeCredentialsOnRefreshOnBody: true,

    // Pre-send modifications for token requests with signature and nonce
    preSend: async (requestOptions: IHttpRequestOptions, credentials: IDataObject) => {
      // Add action=requesttoken parameter to token request - required by Withings
      if (!requestOptions.body) {
        requestOptions.body = {};
      }

      // Use type assertion to tell TypeScript that body is an object with properties
      const bodyObj = requestOptions.body as Record<string, any>;
      bodyObj.action = 'requesttoken';

      // Only format scope if it doesn't already have the user. prefix
      if (bodyObj.scope) {
        const scopeStr = bodyObj.scope as string;
        // Check if the scope already has the user. prefix
        if (!scopeStr.includes('user.')) {
          bodyObj.scope = formatScope(scopeStr);
        }
      }

      // Add headers to prevent caching issues
      if (!requestOptions.headers) {
        requestOptions.headers = {};
      }

      requestOptions.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
      requestOptions.headers['Pragma'] = 'no-cache';
      requestOptions.headers['Expires'] = '0';

      // Add signature and nonce for enhanced security if we have client credentials
      if (credentials.clientId && credentials.clientSecret) {
        try {
          // Get a nonce from Withings API
          const nonce = await getNonce(
            credentials.clientId as string,
            credentials.clientSecret as string,
            async (options) => {
              // Use a simple HTTP request without external dependencies
              const http = https;

              return new Promise((resolve, reject) => {
                const requestOptions = {
                  method: options.method,
                  headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                  },
                };

                const req = http.request(options.url, requestOptions, (res: any) => {
                  let data = '';

                  res.on('data', (chunk: any) => {
                    data += chunk;
                  });

                  res.on('end', () => {
                    try {
                      const parsedData = JSON.parse(data);
                      resolve({ body: parsedData.body });
                    } catch (e) {
                      reject(e);
                    }
                  });
                });

                req.on('error', (error: any) => {
                  reject(error);
                });

                if (options.body) {
                  req.write(JSON.stringify(options.body));
                }

                req.end();
              });
            }
          );

          // Add nonce to the request
          bodyObj.nonce = nonce;

          // Generate and add signature
          bodyObj.signature = generateSignature(
            'requesttoken',
            credentials.clientId as string,
            credentials.clientSecret as string,
            nonce
          );
        } catch (error) {
          // Use a safer approach than console.error for TypeScript compatibility
          if (process && process.stderr && process.stderr.write) {
            process.stderr.write(`Error adding signature and nonce: ${error}\n`);
          }
          // Continue without signature if there's an error
        }
      }

      return requestOptions;
    },

    // Force token refresh before the 30-second expiration
    // Set to 15 seconds to refresh well before the 30-second expiration
    // This is more aggressive than before (was 20 seconds)
    expiresIn: 15,

    // Enable automatic token refresh
    autoRefresh: true,

    // Ensure proper token format and handling
    format: 'json',
    property: 'body',

    // Explicitly set the refresh token grant type for token refresh
    refreshGrantType: 'refresh_token',

    // Include the refresh token in the body of the refresh request
    includeRefreshToken: true,

    // Specify the key name for the refresh token in the request
    refreshTokenKey: 'refresh_token',

    // Ensure proper scope handling during refresh
    includeScopes: true,
  };

  // Define how to authenticate requests
  // Withings requires Bearer token in the Authorization header
  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        // Use Bearer token authentication with the access token
        Authorization: '=Bearer {{$credentials.accessToken}}',
        // Add cache prevention headers to every authenticated request
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'X-Request-Timestamp': '={{Date.now()}}', // Add timestamp to prevent caching
      },
      qs: {
        // Add a timestamp to query parameters to prevent caching
        _ts: '={{Date.now()}}',
      },
    },
  };

  // Define a robust test request for credential validation
  test: ICredentialTestRequest = {
    request: {
      baseURL: 'https://wbsapi.withings.net',
      url: '/v2/user',
      method: 'GET',
      qs: {
        action: 'getdevice',
        _ts: Date.now(), // Add timestamp to prevent caching
      },
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
      // Add timeout to prevent hanging
      timeout: 10000,
    },
  };
}
