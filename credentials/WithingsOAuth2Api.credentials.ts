import {
  ICredentialType,
  INodeProperties,
  ICredentialTestRequest,
  Icon,
  IAuthenticateGeneric,
} from 'n8n-workflow';

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
      default: 'https://wbsapi.withings.net/v2/oauth2',
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
      description: 'Comma-separated list of scopes. Common scopes: user.info, user.metrics, user.activity, user.sleepevents',
    },
  ];

  // Override tokenDataPostReceiveProcess to add Withings-specific parameters
  tokenDataPostReceiveProcess = {
    includeCredentialsOnRefreshOnBody: true,
    preSend: [
      {
        // Add action=requesttoken parameter to token request
        type: 'body',
        properties: {
          action: 'requesttoken',
        },
      },
    ],
  };

  // Define how to authenticate requests
  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        Authorization: '=Bearer {{$credentials.accessToken}}',
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: 'https://wbsapi.withings.net',
      url: '/v2/user',
      method: 'GET',
      qs: {
        action: 'getdevice',
      },
    },
  };
}
