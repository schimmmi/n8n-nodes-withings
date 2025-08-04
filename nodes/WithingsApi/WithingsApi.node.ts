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

        // Make the request
        const options: IHttpRequestOptions = {
          method: 'GET',
          url: `https://wbsapi.withings.net${endpoint}`,
          qs,
          json: true,
          // Ensure proper headers are set for authentication
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        };

        let response;
        let retries = 0;
        const maxRetries = 5; // Increased max retries
        const baseDelay = 1000; // Base delay in milliseconds

        // Pre-validate token before starting the request cycle
        try {
          // Make a simple request to validate the token
          await this.helpers.requestWithAuthentication.call(this, 'withingsOAuth2Api', {
            method: 'GET',
            url: 'https://wbsapi.withings.net/v2/user',
            qs: { action: 'getdevice' },
            json: true,
            headers: {
              'Accept': 'application/json',
            },
          });
          // If successful, token is valid
          await sleep(500); // Wait a bit longer before the main request to ensure token is fully synchronized
        } catch (validationError) {
          // Token might be invalid, but we'll continue with the retry logic
          await sleep(1000); // Wait even longer before starting the retry cycle

          // Try to force a token refresh immediately
          try {
            await this.helpers.requestWithAuthentication.call(this, 'withingsOAuth2Api', {
              method: 'GET',
              url: 'https://wbsapi.withings.net/v2/user',
              qs: { action: 'getdevice' },
              json: true,
              headers: {
                'Accept': 'application/json',
              },
            });
            // If successful, wait again to ensure token is ready
            await sleep(500);
          } catch (secondValidationError) {
            // Still failed, but we'll continue with the retry logic
            await sleep(1000);
          }
        }

        while (retries < maxRetries) {
          try {
            // Always add a delay to ensure token is ready and synchronized
            if (retries > 0) {
              // Exponential backoff with jitter for more effective retries
              const jitter = Math.random() * 0.3 + 0.85; // Random value between 0.85 and 1.15
              const delay = Math.floor(baseDelay * Math.pow(2, retries - 1) * jitter);
              await sleep(delay);
            } else {
              // Increased initial delay to ensure token is ready and properly synchronized
              await sleep(500);
            }

            response = await this.helpers.requestWithAuthentication.call(this, 'withingsOAuth2Api', options);
            break; // Success, exit the loop
          } catch (error) {
            // Check if this is a token expiration error - expanded detection patterns
            if (error.message && (
                error.message.toLowerCase().includes('token') ||
                error.message.toLowerCase().includes('sign') ||
                error.message.toLowerCase().includes('auth') ||
                error.message.toLowerCase().includes('unauthorized') ||
                error.message.toLowerCase().includes('expired') ||
                error.message.toLowerCase().includes('authentication') ||
                error.message.toLowerCase().includes('credentials') ||
                error.message.toLowerCase().includes('access') ||
                error.message.toLowerCase().includes('permission') ||
                error.message.toLowerCase().includes('invalid') ||
                error.message.toLowerCase().includes('oauth') ||
                error.message.toLowerCase().includes('401') ||
                error.message.toLowerCase().includes('403')
            )) {
              retries++;

              if (retries >= maxRetries) {
                throw new NodeApiError(this.getNode(), error, {
                  message: `Failed after ${maxRetries} attempts: ${error.message}. The token may be invalid or revoked. Please try the following:
                  1. Reconnect your Withings account in the credentials
                  2. Ensure your Withings Developer account is active
                  3. Check that your application has the required scopes`
                });
              }

              // Log token error (commented out as console.log is not available in this context)
              // For debugging, uncomment: this.logger.debug(`Token error detected: "${error.message}". Retrying in ${delay}ms (attempt ${retries}/${maxRetries})`);

              // Enhanced token refresh strategy with multiple approaches
              // Try different refresh strategies based on retry count
              if (retries <= maxRetries - 1) {
                // Calculate delay with increasing duration for each retry
                const refreshDelay = Math.min(1000 * Math.pow(2, retries - 1), 5000);
                await sleep(refreshDelay);

                try {
                  // First approach: Standard refresh request
                  await this.helpers.requestWithAuthentication.call(this, 'withingsOAuth2Api', {
                    method: 'GET',
                    url: 'https://wbsapi.withings.net/v2/user',
                    qs: { action: 'getdevice' },
                    json: true,
                    headers: {
                      'Accept': 'application/json',
                    },
                  });
                  // If successful, wait to ensure token is properly synchronized
                  await sleep(500);
                } catch (refreshError) {
                  // If first refresh attempt fails, try a different endpoint
                  await sleep(1000);

                  try {
                    // Second approach: Try a different endpoint
                    await this.helpers.requestWithAuthentication.call(this, 'withingsOAuth2Api', {
                      method: 'GET',
                      url: 'https://wbsapi.withings.net/v2/measure',
                      qs: { action: 'getactivity' },
                      json: true,
                      headers: {
                        'Accept': 'application/json',
                      },
                    });
                    // If successful, wait to ensure token is properly synchronized
                    await sleep(500);
                  } catch (secondRefreshError) {
                    // If second refresh attempt fails, try one more approach
                    await sleep(1500);

                    try {
                      // Third approach: Try a simpler endpoint with minimal parameters
                      await this.helpers.requestWithAuthentication.call(this, 'withingsOAuth2Api', {
                        method: 'GET',
                        url: 'https://wbsapi.withings.net/v2/user',
                        qs: { action: 'get' },
                        json: true,
                        headers: {
                          'Accept': 'application/json',
                        },
                      });
                      // If successful, wait longer to ensure token is properly synchronized
                      await sleep(1000);
                    } catch (thirdRefreshError) {
                      // All refresh attempts failed, but we'll continue with the retry logic
                      // Wait longer before the next main request attempt
                      await sleep(2000);
                    }
                  }
                }
              }

              continue; // Try again with delay at the beginning of the loop
            } else {
              throw error; // Not a token error, rethrow
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
