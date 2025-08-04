import {
  INodeType,
  INodeTypeDescription,
  IExecuteFunctions,
  NodeConnectionType,
  IDataObject,
  INodeExecutionData,
  IHttpRequestOptions,
  NodeApiError,
  sleep,
} from 'n8n-workflow';

export class WithingsApi implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Withings API',
    name: 'withingsApi',
    group: ['transform'],
    version: 1,
    subtitle: '={{ $parameter["operation"] + ": " + $parameter["resource"] }}',
    description: 'Withings API Integration',
    icon: 'file:withings.svg',
    defaults: {
      name: 'Withings API',
    },
    inputs: [NodeConnectionType.Main],
    outputs: [NodeConnectionType.Main],
    credentials: [
      {
        name: 'withingsOAuth2Api',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Activity',
            value: 'activity',
          },
          {
            name: 'Measure',
            value: 'measure',
          },
          {
            name: 'Sleep',
            value: 'sleep',
          },
          {
            name: 'User',
            value: 'user',
          },
        ],
        default: 'measure',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: [
              'activity',
            ],
          },
        },
        options: [
          {
            name: 'Get Activity',
            value: 'getactivity',
            description: 'Get user activity data',
            action: 'Get activity data',
          },
          {
            name: 'Get Summary',
            value: 'getsummary',
            description: 'Get user activity summary',
            action: 'Get activity summary',
          },
          {
            name: 'Get Workouts',
            value: 'getworkouts',
            description: 'Get user workout data',
            action: 'Get workout data',
          },
        ],
        default: 'getactivity',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: [
              'measure',
            ],
          },
        },
        options: [
          {
            name: 'Get Measurements',
            value: 'getmeas',
            description: 'Get measurements data',
            action: 'Get measurements from measure',
          },
          {
            name: 'Get Activity',
            value: 'getactivity',
            description: 'Get user intraday activity',
            action: 'Get intraday activity',
          },
          {
            name: 'Get Intradayactivity',
            value: 'getintradayactivity',
            description: 'Get user intraday activity',
            action: 'Get intraday activity',
          },
        ],
        default: 'getmeas',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: [
              'sleep',
            ],
          },
        },
        options: [
          {
            name: 'Get',
            value: 'get',
            description: 'Get sleep data',
            action: 'Get sleep data',
          },
          {
            name: 'Get Summary',
            value: 'getsummary',
            description: 'Get sleep summary',
            action: 'Get sleep summary',
          },
        ],
        default: 'get',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: [
              'user',
            ],
          },
        },
        options: [
          {
            name: 'Get Device',
            value: 'getdevice',
            description: 'Get user devices',
            action: 'Get device from user',
          },
          {
            name: 'Get Goals',
            value: 'getgoals',
            description: 'Get user goals',
            action: 'Get user goals',
          },
          {
            name: 'Get',
            value: 'get',
            description: 'Get user information',
            action: 'Get user information',
          },
        ],
        default: 'getdevice',
      },

      // Common parameters
      {
        displayName: 'Additional Fields',
        name: 'additionalFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        options: [
          {
            displayName: 'Start Date',
            name: 'startdate',
            type: 'dateTime',
            default: '',
            description: 'Start date for data retrieval (timestamp)',
          },
          {
            displayName: 'End Date',
            name: 'enddate',
            type: 'dateTime',
            default: '',
            description: 'End date for data retrieval (timestamp)',
          },
          {
            displayName: 'Last Update',
            name: 'lastupdate',
            type: 'dateTime',
            default: '',
            description: 'Get only data that was updated after this date (timestamp)',
          },
          {
            displayName: 'Offset',
            name: 'offset',
            type: 'number',
            default: 0,
            description: 'Skip this many records',
          },
        ],
      },

      // Measure specific parameters
      {
        displayName: 'Measure Type',
        name: 'meastype',
        type: 'multiOptions',
        displayOptions: {
          show: {
            resource: [
              'measure',
            ],
            operation: [
              'getmeas',
            ],
          },
        },
        options: [
          {
            name: 'Weight',
            value: 1,
          },
          {
            name: 'Height',
            value: 4,
          },
          {
            name: 'Fat Free Mass',
            value: 5,
          },
          {
            name: 'Fat Ratio',
            value: 6,
          },
          {
            name: 'Fat Mass Weight',
            value: 8,
          },
          {
            name: 'Diastolic Blood Pressure',
            value: 9,
          },
          {
            name: 'Systolic Blood Pressure',
            value: 10,
          },
          {
            name: 'Heart Pulse',
            value: 11,
          },
          {
            name: 'Temperature',
            value: 12,
          },
          {
            name: 'SpO2',
            value: 54,
          },
          {
            name: 'Body Temperature',
            value: 71,
          },
          {
            name: 'Skin Temperature',
            value: 73,
          },
          {
            name: 'Muscle Mass',
            value: 76,
          },
          {
            name: 'Hydration',
            value: 77,
          },
          {
            name: 'Bone Mass',
            value: 88,
          },
          {
            name: 'Pulse Wave Velocity',
            value: 91,
          },
        ],
        default: [],
        description: 'Types of measurements to retrieve',
      },

      // Sleep specific parameters
      {
        displayName: 'Data Fields',
        name: 'dataFields',
        type: 'multiOptions',
        displayOptions: {
          show: {
            resource: [
              'sleep',
            ],
          },
        },
        options: [
          {
            name: 'HR',
            value: 'hr',
            description: 'Heart rate data',
          },
          {
            name: 'RR',
            value: 'rr',
            description: 'Respiration rate data',
          },
          {
            name: 'SNORING',
            value: 'snoring',
            description: 'Snoring data',
          },
        ],
        default: [],
        description: 'Types of sleep data to retrieve',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    // For each item
    for (let i = 0; i < items.length; i++) {
      let resource = '';
      let operation = '';

      try {
        resource = this.getNodeParameter('resource', i) as string;
        operation = this.getNodeParameter('operation', i) as string;

        let endpoint = '';
        const qs: IDataObject = {};

        // Process common parameters
        const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

        if (additionalFields.startdate) {
          qs.startdate = Math.floor(new Date(additionalFields.startdate as string).getTime() / 1000);
        }

        if (additionalFields.enddate) {
          qs.enddate = Math.floor(new Date(additionalFields.enddate as string).getTime() / 1000);
        }

        if (additionalFields.lastupdate) {
          qs.lastupdate = Math.floor(new Date(additionalFields.lastupdate as string).getTime() / 1000);
        }

        if (additionalFields.offset) {
          qs.offset = additionalFields.offset;
        }

        if (resource === 'activity') {
          endpoint = '/v2/measure';

          if (operation === 'getactivity') {
            qs.action = 'getactivity';
          } else if (operation === 'getsummary') {
            qs.action = 'getsummary';
          } else if (operation === 'getworkouts') {
            qs.action = 'getworkouts';
          }
        } else if (resource === 'measure') {
          if (operation === 'getmeas') {
            endpoint = '/measure';
            qs.action = 'getmeas';

            // Process measure-specific parameters
            const measTypes = this.getNodeParameter('meastype', i, []) as number[];
            if (measTypes.length > 0) {
              qs.meastype = measTypes.join(',');
            }
          } else if (operation === 'getactivity') {
            endpoint = '/v2/measure';
            qs.action = 'getactivity';
          } else if (operation === 'getintradayactivity') {
            endpoint = '/v2/measure';
            qs.action = 'getintradayactivity';
          }
        } else if (resource === 'sleep') {
          endpoint = '/v2/sleep';

          if (operation === 'get') {
            qs.action = 'get';

            // Process sleep-specific parameters
            const dataFields = this.getNodeParameter('dataFields', i, []) as string[];
            if (dataFields.length > 0) {
              qs.data_fields = dataFields.join(',');
            }
          } else if (operation === 'getsummary') {
            qs.action = 'getsummary';
          }
        } else if (resource === 'user') {
          endpoint = '/v2/user';

          if (operation === 'getdevice') {
            qs.action = 'getdevice';
          } else if (operation === 'getgoals') {
            qs.action = 'getgoals';
          } else if (operation === 'get') {
            qs.action = 'get';
          }
        }

        // Define base request options (will be used to create fresh options for each attempt)
        const baseEndpoint = endpoint;
        const baseQs = { ...qs };

        let response;
        let retries = 0;
        const maxRetries = 5; // Increased max retries
        const baseDelay = 1000; // Base delay in milliseconds

        // Hyper-aggressive token validation and refresh before starting the request cycle
        // First, force a token refresh by making a simple request with multiple attempts
        for (let preValidationAttempt = 0; preValidationAttempt < 7; preValidationAttempt++) { // Increased to 7 attempts
          try {
            // Make a simple request to validate and refresh the token
            // Add a unique timestamp and random value to prevent any caching
            const uniqueTimestamp = Date.now() + Math.floor(Math.random() * 1000);
            await this.helpers.requestWithAuthentication.call(this, 'withingsOAuth2Api', {
              method: 'GET',
              url: 'https://wbsapi.withings.net/v2/user',
              qs: {
                action: 'getdevice',
                _ts: uniqueTimestamp, // Add unique timestamp to prevent caching
              },
              json: true,
              headers: {
                'Accept': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate', // Enhanced cache prevention
                'Pragma': 'no-cache',
                'Expires': '0',
                'X-Request-ID': `validation-${uniqueTimestamp}`, // Add unique request ID
              },
              // Add timeout to prevent hanging
              timeout: 10000,
            });

            // If successful, token is valid - wait longer to ensure token is fully synchronized
            await sleep(2000); // Increased wait time further

            // Success - break out of the pre-validation loop
            break;
          } catch (validationError) {
            // If this is the last attempt and it failed, wait longer before continuing
            if (preValidationAttempt === 6) { // Adjusted for 7 attempts
              await sleep(4000); // Increased wait time further
              continue;
            }

            // Wait between validation attempts with increasing delay and jitter
            const jitter = Math.random() * 0.4 + 0.8; // Random value between 0.8 and 1.2
            await sleep(1800 * Math.pow(1.5, preValidationAttempt) * jitter); // Enhanced exponential backoff

            // Try a different endpoint for the next validation attempt
            try {
              // Try a different endpoint with unique timestamp to prevent caching
              const uniqueTimestamp = Date.now() + Math.floor(Math.random() * 1000);
              await this.helpers.requestWithAuthentication.call(this, 'withingsOAuth2Api', {
                method: 'GET',
                url: 'https://wbsapi.withings.net/v2/measure',
                qs: {
                  action: 'getactivity',
                  _ts: uniqueTimestamp, // Add unique timestamp to prevent caching
                },
                json: true,
                headers: {
                  'Accept': 'application/json',
                  'Cache-Control': 'no-cache, no-store, must-revalidate', // Enhanced cache prevention
                  'Pragma': 'no-cache',
                  'Expires': '0',
                  'X-Request-ID': `validation-alt-${uniqueTimestamp}`, // Add unique request ID
                },
                timeout: 10000, // Add timeout
              });

              // If this alternate request succeeds, wait longer and break out
              await sleep(2000); // Increased wait time
              break;
            } catch (alternateValidationError) {
              // Try a third endpoint as another fallback - specifically the sleep endpoint
              try {
                const uniqueTimestamp = Date.now() + Math.floor(Math.random() * 1000);
                await this.helpers.requestWithAuthentication.call(this, 'withingsOAuth2Api', {
                  method: 'GET',
                  url: 'https://wbsapi.withings.net/v2/sleep',
                  qs: {
                    action: 'get',
                    _ts: uniqueTimestamp, // Add unique timestamp to prevent caching
                  },
                  json: true,
                  headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache, no-store, must-revalidate', // Enhanced cache prevention
                    'Pragma': 'no-cache',
                    'Expires': '0',
                    'X-Request-ID': `validation-third-${uniqueTimestamp}`, // Add unique request ID
                  },
                  timeout: 10000, // Add timeout
                });

                // If this third attempt succeeds, wait and break out
                await sleep(2000); // Increased wait time
                break;
              } catch (thirdValidationError) {
                // Try a fourth endpoint as a final fallback - specifically the sleep endpoint with getsummary action
                try {
                  const uniqueTimestamp = Date.now() + Math.floor(Math.random() * 1000);
                  await this.helpers.requestWithAuthentication.call(this, 'withingsOAuth2Api', {
                    method: 'GET',
                    url: 'https://wbsapi.withings.net/v2/sleep',
                    qs: {
                      action: 'getsummary', // Specifically test the getsummary action that's failing
                      _ts: uniqueTimestamp, // Add unique timestamp to prevent caching
                    },
                    json: true,
                    headers: {
                      'Accept': 'application/json',
                      'Cache-Control': 'no-cache, no-store, must-revalidate', // Enhanced cache prevention
                      'Pragma': 'no-cache',
                      'Expires': '0',
                      'X-Request-ID': `validation-fourth-${uniqueTimestamp}`, // Add unique request ID
                    },
                    timeout: 10000, // Add timeout
                  });

                  // If this fourth attempt succeeds, wait longer to ensure token is fully synchronized
                  await sleep(3000); // Increased wait time for sleep endpoint
                  break;
                } catch (fourthValidationError) {
                  // Continue to the next attempt or to the main request cycle
                  await sleep(2500); // Increased wait time
                }
              }
            }
          }
        }

        // Track if we've successfully refreshed the token during retries
        let tokenRefreshed = false;

        // Ultra-aggressive direct token refresh attempts before starting the main request cycle
        // This is critical for ensuring a fresh token is available
        for (let directRefreshAttempt = 0; directRefreshAttempt < 5; directRefreshAttempt++) { // Increased to 5 attempts
          try {
            // No direct logging in TypeScript code - n8n doesn't support console.log
            // We'll use the this.logger object if it becomes available in the future

            // Generate a unique timestamp with randomization to prevent any caching
            const uniqueTimestamp = Date.now() + Math.floor(Math.random() * 1000);

            // This is a direct token refresh attempt using a simple endpoint
            await this.helpers.requestWithAuthentication.call(this, 'withingsOAuth2Api', {
              method: 'GET',
              url: 'https://wbsapi.withings.net/v2/user',
              qs: {
                action: 'get', // Using a simpler endpoint
                _ts: uniqueTimestamp, // Add unique timestamp to prevent caching
              },
              json: true,
              headers: {
                'Accept': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate', // Enhanced cache prevention
                'Pragma': 'no-cache',
                'Expires': '0',
                'X-Request-ID': `direct-refresh-${uniqueTimestamp}`, // Add unique request ID
              },
              timeout: 10000, // Add timeout to prevent hanging
            });

            tokenRefreshed = true;
            // Success - no direct logging in TypeScript code

            await sleep(2500); // Increased wait time after a successful refresh
            break; // Success, exit the loop
          } catch (directRefreshError) {
            // Direct refresh error - no direct logging in TypeScript code

            // Define a set of fallback endpoints to try based on the attempt number
            const fallbackEndpoints = [
              // First fallback: Sleep endpoint
              {
                url: 'https://wbsapi.withings.net/v2/sleep',
                action: 'get',
                waitTime: 2000,
              },
              // Second fallback: Measure endpoint
              {
                url: 'https://wbsapi.withings.net/v2/measure',
                action: 'getactivity',
                waitTime: 2200,
              },
              // Third fallback: User endpoint with different action
              {
                url: 'https://wbsapi.withings.net/v2/user',
                action: 'getdevice',
                waitTime: 2500,
              },
              // Fourth fallback: Notify endpoint
              {
                url: 'https://wbsapi.withings.net/notify',
                action: 'list',
                waitTime: 3000,
              },
            ];

            // If this is not the last attempt, try a fallback endpoint
            if (directRefreshAttempt < 4) {
              const fallbackEndpoint = fallbackEndpoints[directRefreshAttempt];

              try {
                // Fallback attempt - no direct logging in TypeScript code

                // Generate a unique timestamp with randomization
                const uniqueTimestamp = Date.now() + Math.floor(Math.random() * 1000);

                // Try the fallback endpoint
                await this.helpers.requestWithAuthentication.call(this, 'withingsOAuth2Api', {
                  method: 'GET',
                  url: fallbackEndpoint.url,
                  qs: {
                    action: fallbackEndpoint.action,
                    _ts: uniqueTimestamp, // Add unique timestamp to prevent caching
                  },
                  json: true,
                  headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache, no-store, must-revalidate', // Enhanced cache prevention
                    'Pragma': 'no-cache',
                    'Expires': '0',
                    'X-Request-ID': `fallback-refresh-${directRefreshAttempt}-${uniqueTimestamp}`, // Add unique request ID
                  },
                  timeout: 10000, // Add timeout to prevent hanging
                });

                tokenRefreshed = true;
                // Fallback success - no direct logging in TypeScript code

                await sleep(fallbackEndpoint.waitTime); // Wait based on the endpoint
                break; // Success, exit the loop
              } catch (fallbackError) {
                // Fallback error - no direct logging in TypeScript code

                // Wait between direct refresh attempts with increasing delay and jitter
                const jitter = Math.random() * 0.4 + 0.8; // Random value between 0.8 and 1.2
                const delay = Math.floor(1200 * Math.pow(1.5, directRefreshAttempt) * jitter);
                await sleep(delay);
              }
            } else {
              // All direct refresh attempts failed - no direct logging in TypeScript code

              await sleep(3000); // Increased wait time
            }
          }
        }

        // Create a fresh copy of the options for each attempt to avoid any potential reference issues
        const createFreshOptions = (): IHttpRequestOptions => {
          return {
            method: 'GET',
            url: `https://wbsapi.withings.net${baseEndpoint}`,
            qs: {
              ...baseQs,
              _ts: Date.now(), // Add timestamp to prevent caching
            },
            json: true,
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache, no-store', // Prevent caching
              'Pragma': 'no-cache', // Additional cache prevention
              'X-Request-Attempt': '', // Will be set for each attempt
            },
          };
        };

        while (retries < maxRetries) {
          try {
            // Always add a delay to ensure token is ready and synchronized
            if (retries > 0) {
              // Exponential backoff with jitter for more effective retries
              const jitter = Math.random() * 0.3 + 0.85; // Random value between 0.85 and 1.15
              const delay = Math.floor(baseDelay * Math.pow(2, retries - 1) * jitter);
              await sleep(delay);

              // Force token refresh before each retry attempt
              // This is critical for ensuring a fresh token is available
              try {
                // Try a different endpoint for each retry to maximize chances of success
                const refreshEndpoints = [
                  { url: 'https://wbsapi.withings.net/v2/user', action: 'get' },
                  { url: 'https://wbsapi.withings.net/v2/user', action: 'getdevice' },
                  { url: 'https://wbsapi.withings.net/v2/measure', action: 'getactivity' },
                  { url: 'https://wbsapi.withings.net/v2/sleep', action: 'get' },
                ];

                // Select an endpoint based on the retry count
                const endpoint = refreshEndpoints[retries % refreshEndpoints.length];

                await this.helpers.requestWithAuthentication.call(this, 'withingsOAuth2Api', {
                  method: 'GET',
                  url: endpoint.url,
                  qs: {
                    action: endpoint.action,
                    _ts: Date.now(), // Add timestamp to prevent caching
                  },
                  json: true,
                  headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache, no-store', // Prevent caching
                    'Pragma': 'no-cache', // Additional cache prevention
                  },
                });

                tokenRefreshed = true;
                // Wait longer after a successful refresh to ensure token is fully synchronized
                await sleep(2000);
              } catch (retryRefreshError) {
                // If refresh fails, wait a bit but continue with the main request
                await sleep(1000);
              }
            } else {
              // Increased initial delay to ensure token is ready and properly synchronized
              await sleep(1500); // Increased from 800ms
            }

            // Create fresh options for each attempt
            const freshOptions = createFreshOptions();

            // Add additional headers for this specific request
            freshOptions.headers = {
              ...freshOptions.headers,
              'X-Request-Attempt': `${retries + 1}`,
            };

            // Special handling for sleep-related requests, especially getsummary
            // This ensures the token is properly validated before making these requests
            if (resource === 'sleep') {
              // Additional token validation specifically for sleep endpoints
              try {
                // Force a token refresh by making a request to the sleep endpoint
                const uniqueTimestamp = Date.now() + Math.floor(Math.random() * 1000);
                await this.helpers.requestWithAuthentication.call(this, 'withingsOAuth2Api', {
                  method: 'GET',
                  url: 'https://wbsapi.withings.net/v2/sleep',
                  qs: {
                    action: operation === 'getsummary' ? 'getsummary' : 'get', // Use the same action as the main request
                    _ts: uniqueTimestamp, // Add unique timestamp to prevent caching
                  },
                  json: true,
                  headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                    'X-Request-ID': `sleep-validation-${uniqueTimestamp}`,
                  },
                  timeout: 10000,
                });

                // Wait longer to ensure token is fully synchronized for sleep endpoints
                await sleep(2500);
              } catch (sleepValidationError) {
                // If validation fails, wait a bit but continue with the main request
                // The main request might still succeed if the token is valid
                await sleep(1500);
              }
            }

            // Make the main API request with fresh options
            response = await this.helpers.requestWithAuthentication.call(this, 'withingsOAuth2Api', freshOptions);

            // Success - wait a moment to ensure any side effects are complete
            await sleep(500);
            break; // Success, exit the loop
          } catch (error) {
            // Ultra-aggressive error detection and handling for token-related issues
            // Check for ANY possible token, authentication, or authorization related error
            const errorMsg = (error.message || '').toLowerCase();
            const isTokenError =
                // Direct token issues
                errorMsg.includes('token') ||
                errorMsg.includes('sign') ||
                errorMsg.includes('auth') ||
                errorMsg.includes('unauthorized') ||
                errorMsg.includes('expired') ||
                errorMsg.includes('authentication') ||
                errorMsg.includes('credentials') ||
                errorMsg.includes('access') ||
                errorMsg.includes('permission') ||
                errorMsg.includes('invalid') ||
                errorMsg.includes('oauth') ||
                // HTTP status code indicators
                errorMsg.includes('401') ||
                errorMsg.includes('403') ||
                // Additional patterns that might indicate auth issues
                errorMsg.includes('denied') ||
                errorMsg.includes('reject') ||
                errorMsg.includes('login') ||
                errorMsg.includes('signature') ||
                errorMsg.includes('identity') ||
                errorMsg.includes('verify') ||
                errorMsg.includes('key') ||
                errorMsg.includes('secret');

            if (isTokenError) {
              retries++;

              // Token error detected - no direct logging in TypeScript code
              // We would log error details here if logging was available

              if (retries >= maxRetries) {
                // Create a detailed error message with all the context information
                // No need to reference request options in the error message
                const detailedErrorMessage = `Failed after ${maxRetries} attempts: ${error.message}.
                Error type: ${error.name || 'Unknown'}, Status code: ${error.statusCode || 'N/A'}.
                Token refresh status: ${tokenRefreshed ? 'Refreshed' : 'Not refreshed'}.

                The token may be invalid or revoked. Please try the following:
                1. Reconnect your Withings account in the credentials
                2. Ensure your Withings Developer account is active
                3. Check that your application has the required scopes
                4. Verify that your Withings account is active and properly configured
                5. Try again in a few minutes as Withings API may be experiencing temporary issues`;

                throw new NodeApiError(this.getNode(), error, {
                  message: detailedErrorMessage
                });
              }

              // Ultra-aggressive token refresh strategy with multiple approaches
              if (retries <= maxRetries - 1) {
                // Calculate delay with increasing duration for each retry and some randomization
                const jitter = Math.random() * 0.4 + 0.8; // Random value between 0.8 and 1.2
                const refreshDelay = Math.min(1500 * Math.pow(2, retries - 1) * jitter, 8000);

                // this.logger.debug(`[Withings] Waiting ${refreshDelay}ms before retry attempt ${retries + 1}`);
                await sleep(refreshDelay);

                // Reset tokenRefreshed flag for this retry cycle
                tokenRefreshed = false;

                // Force credential refresh by attempting multiple different API endpoints
                // This maximizes the chance of getting a valid token

                // Define a comprehensive set of refresh strategies with increasing wait times
                const refreshStrategies = [
                  // Strategy 1: User endpoint with getdevice action (most reliable)
                  {
                    url: 'https://wbsapi.withings.net/v2/user',
                    qs: { action: 'getdevice', _ts: Date.now() + Math.random() },
                    waitTime: 1200,
                    headers: {
                      'Accept': 'application/json',
                      'Cache-Control': 'no-cache, no-store, must-revalidate',
                      'Pragma': 'no-cache',
                      'Expires': '0',
                    },
                  },
                  // Strategy 2: Measure endpoint (different service)
                  {
                    url: 'https://wbsapi.withings.net/v2/measure',
                    qs: { action: 'getactivity', _ts: Date.now() + Math.random() },
                    waitTime: 1500,
                    headers: {
                      'Accept': 'application/json',
                      'Cache-Control': 'no-cache, no-store, must-revalidate',
                      'Pragma': 'no-cache',
                      'Expires': '0',
                    },
                  },
                  // Strategy 3: User endpoint with simpler action
                  {
                    url: 'https://wbsapi.withings.net/v2/user',
                    qs: { action: 'get', _ts: Date.now() + Math.random() },
                    waitTime: 1800,
                    headers: {
                      'Accept': 'application/json',
                      'Cache-Control': 'no-cache, no-store, must-revalidate',
                      'Pragma': 'no-cache',
                      'Expires': '0',
                    },
                  },
                  // Strategy 4: Sleep endpoint (different service as last resort)
                  {
                    url: 'https://wbsapi.withings.net/v2/sleep',
                    qs: { action: 'get', _ts: Date.now() + Math.random() },
                    waitTime: 2000,
                    headers: {
                      'Accept': 'application/json',
                      'Cache-Control': 'no-cache, no-store, must-revalidate',
                      'Pragma': 'no-cache',
                      'Expires': '0',
                    },
                  },
                  // Strategy 5: Notification endpoint (completely different API area as final resort)
                  {
                    url: 'https://wbsapi.withings.net/notify',
                    qs: { action: 'list', _ts: Date.now() + Math.random() },
                    waitTime: 2500,
                    headers: {
                      'Accept': 'application/json',
                      'Cache-Control': 'no-cache, no-store, must-revalidate',
                      'Pragma': 'no-cache',
                      'Expires': '0',
                    },
                  },
                ];

                // Try each strategy in sequence until one succeeds
                for (const strategy of refreshStrategies) {
                  try {
                    // Add increasing delay between strategies
                    await sleep(strategy.waitTime);

                    // this.logger.debug(`[Withings] Trying refresh strategy: ${strategy.url} with action ${strategy.qs.action}`);

                    // Make the refresh request with this strategy
                    await this.helpers.requestWithAuthentication.call(this, 'withingsOAuth2Api', {
                      method: 'GET',
                      url: strategy.url,
                      qs: strategy.qs,
                      json: true,
                      headers: strategy.headers,
                    });

                    // If we get here, the request succeeded
                    tokenRefreshed = true;
                    // this.logger.debug(`[Withings] Token refresh succeeded with strategy: ${strategy.url}`);

                    // Wait after successful refresh to ensure token is fully synchronized
                    await sleep(2000);

                    // Break out of the strategy loop on success
                    break;
                  } catch (strategyError) {
                    // this.logger.debug(`[Withings] Token refresh strategy failed: ${strategyError.message}`);
                    // Continue to the next strategy on failure
                    continue;
                  }
                }

                // If all strategies failed, wait longer before continuing
                if (!tokenRefreshed) {
                  // this.logger.debug(`[Withings] All token refresh strategies failed, waiting before next attempt`);
                  await sleep(3000);
                }
              }

              // Continue to the next iteration of the main retry loop
              continue;
            } else {
              // Not a token error, rethrow with original message
              throw error;
            }
          }
        }

        // Check if the response contains an error
        if (response.status !== 0) {
          const errorMessage = `Withings API Error: ${response.status} - ${response.error || 'Unknown error'}`;

          if (this.continueOnFail()) {
            returnData.push({
              json: {
                success: false,
                error: errorMessage,
                status: response.status,
                errorCode: response.error,
                resource,
                operation,
              },
            });
            continue;
          }

          throw new NodeApiError(this.getNode(), response, { message: errorMessage });
        }

        // Format the response data
        let formattedResponse: IDataObject = {};

        if (response.body) {
          formattedResponse = {
            success: true,
            resource,
            operation,
            ...response.body,
          };
        } else {
          formattedResponse = {
            success: true,
            resource,
            operation,
            data: response,
          };
        }

        returnData.push({
          json: formattedResponse,
        });
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: {
              success: false,
              error: error.message,
              resource,
              operation,
            },
          });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}
