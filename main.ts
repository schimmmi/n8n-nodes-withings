import { WithingsApi } from './nodes/WithingsApi.node';
import { WithingsOAuth2Api } from './credentials/WithingsOAuth2Api.credentials';

export const nodes = [
  WithingsApi,
];

export const credentials = [
  WithingsOAuth2Api,
];
