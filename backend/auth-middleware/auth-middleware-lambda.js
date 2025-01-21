// https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-lambda-authorizer.html
// https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-use-lambda-authorizer.html

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

const tableName = 'kiikiiworld-serverless-users-prd';

const client = new DynamoDBClient({ region: 'eu-central-1' });

// TODO
const CLIENT_URL = 'http://localhost:3000';
// TODO: change to api url
const RP_ID = 'localhost';

function getCookie(id, cookie) {
  const returnCookieArray = cookie.split(';');
  const returnCookieFull = returnCookieArray.find(cook => cook.split('=')[0].includes(id));
  const returnCookie = returnCookieFull.split('=')[1];

  return JSON.parse(decodeURIComponent(returnCookie));
}


// A simple token-based authorizer example to demonstrate how to use an authorization token
// to allow or deny a request. In this example, the caller named 'user' is allowed to invoke
// a request if the client-supplied token value is 'allow'. The caller is not allowed to invoke
// the request if the token value is 'deny'. If the token value is 'unauthorized' or an empty
// string, the authorizer function returns an HTTP 401 status code. For any other token value,
// the authorizer returns an HTTP 500 status code.
// Note that token values are case-sensitive.

export const handler = function(event, context, callback) {
  console.log('AUTH EVENT: ', event);

  const auth = 'Allow';

  return {
    'principalId': 'user',
    'policyDocument': {
      'Version': '2012-10-17',
      'Statement': [{ 'Action': 'execute-api:Invoke', 'Resource': [event.methodArn], 'Effect': auth }],
    },
  };

//   var token = event.authorizationToken;
//   switch (token) {
//     case 'allow':
//       callback(null, generatePolicy('user', 'Allow', event.methodArn));
//       break;
//     case 'deny':
//       callback(null, generatePolicy('user', 'Deny', event.methodArn));
//       break;
//     case 'unauthorized':
//       callback('Unauthorized');   // Return a 401 Unauthorized response
//       break;
//     default:
//       callback('Error: Invalid token'); // Return a 500 Invalid token response
//   }
};

// Help function to generate an IAM policy
var generatePolicy = function(principalId, effect, resource) {
  var authResponse = {};

  authResponse.principalId = principalId;

  if (effect && resource) {
    var policyDocument = {};
    policyDocument.Version = '2012-10-17';
    policyDocument.Statement = [];
    var statementOne = {};
    statementOne.Action = 'execute-api:Invoke';
    statementOne.Effect = effect;
    statementOne.Resource = resource;
    policyDocument.Statement[0] = statementOne;
    authResponse.policyDocument = policyDocument;
  }

  // Optional output with custom properties of the String, Number or Boolean type.
  authResponse.context = {
    'stringKey': 'stringval',
    'numberKey': 123,
    'booleanKey': true,
  };

  return authResponse;
};
