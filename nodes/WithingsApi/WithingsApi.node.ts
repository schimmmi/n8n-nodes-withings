import {
  INodeType,
  INodeTypeDescription,
  IExecuteFunctions,
  NodeConnectionType,
} from 'n8n-workflow';

export class WithingsApi implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Withings API',
    name: 'withingsApi',
    group: ['transform'],
    version: 1,
    description: 'Withings API Integration',
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
        displayName: 'Test Input',
        name: 'testInput',
        type: 'string',
        default: '',
      },
    ],
  };

  async execute(this: IExecuteFunctions) {
    const returnItems = [];
    returnItems.push({ json: { success: true } });
    return [returnItems];
  }
}
