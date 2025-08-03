import {
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class WithingsOAuth2Api implements ICredentialType {
  name = 'withingsOAuth2Api';
  displayName = 'Withings OAuth2 API';
  documentationUrl = 'https://developer.withings.com/oauth2/';
  extends = ['oAuth2Api'];
  properties: INodeProperties[] = [
    {
      displayName: 'Client ID',
      name: 'clientId',
      type: 'string',
      default: '',
    },
    {
      displayName: 'Client Secret',
      name: 'clientSecret',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
    },
    {
      displayName: 'OAuth2 Flow',
      name: 'oauth2Flow',
      type: 'hidden',
      default: 'authorizationCode',
    },
    {
      displayName: 'Auth URL',
      name: 'authUrl',
      type: 'hidden',
      default: 'https://account.withings.com/oauth2_user/authorize2',
    },
    {
      displayName: 'Token URL',
      name: 'tokenUrl',
      type: 'hidden',
      default: 'https://wbsapi.withings.net/v2/oauth2',
    },
    {
      displayName: 'Scope',
      name: 'scope',
      type: 'string',
      default: 'user.info,user.metrics,user.activity,user.sleepevents',
    },
    {
      displayName: 'Authentication',
      name: 'authentication',
      type: 'hidden',
      default: 'header',
    },
    {
      displayName: 'Token Type',
      name: 'tokenType',
      type: 'hidden',
      default: 'Bearer',
    },
  ];
}
