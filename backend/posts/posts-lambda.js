const {
  DynamoDBClient,
  QueryCommand,
  PutItemCommand,
} = require("@aws-sdk/client-dynamodb");

const tableName = "kiikiiworld-serverless-prd";
const client = new DynamoDBClient({ region: "eu-central-1" });

exports.handler = async (event) => {
  console.log("event: ", event);
  let responseMessage = "Hello World!!!!";

  if (
    event.httpMethod === "GET" &&
    event.queryStringParameters &&
    event.queryStringParameters["type"]
  ) {
    return await getPostByType(event.queryStringParameters["type"]);
  } else if (event.httpMethod === "POST" && event.body) {
    return await putPost(event.body);
  }

  return generateResponse("SKIPPED");
};

async function putPost(post) {
  console.log(transformPost(post));

  const putCmd = new PutItemCommand({
    TableName: tableName,
    Item: transformPost(post),
  });

  return await sendCommand(putCmd);
}

async function getPostByType(type) {
  const queryCmd = new QueryCommand({
    TableName: tableName,
    KeyConditionExpression: "PostType = :pk",
    ExpressionAttributeValues: {
      ":pk": {
        S: type,
      },
    },
  });

  return await sendCommand(queryCmd);
}

function transformPost(post) {
  const parsedPost = JSON.parse(post);

  // content is all properties except date, id and type.
  const { date, id, type, ...postContent } = parsedPost;

  const sendPost = {
    DateId: {
      S: `${parsedPost.date}__${parsedPost.id}`,
    },
    PostType: {
      S: parsedPost.type,
    },
    YearMonth: {
      S: parsedPost.date.slice(0, 7),
    },
    Content: {
      S: JSON.stringify(postContent),
    },
  };

  return sendPost;
}

async function sendCommand(command) {
  try {
    const results = await client.send(command);
    return generateResponse(results);
  } catch (err) {
    console.log("error", err);
    return generateResponse(err);
  }
}

function generateResponse(responseMessage) {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: responseMessage,
    }),
  };
}
