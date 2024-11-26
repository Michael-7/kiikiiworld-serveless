import {
  DynamoDBClient,
  QueryCommand,
  PutItemCommand,
} from "@aws-sdk/client-dynamodb";

// import { tableName } from "../env";

const tableName = "kiikiiworld-serverless-prd";
const feedTableName = "kiikiiworld-serverless-prd-feed";

const client = new DynamoDBClient({ region: "eu-central-1" });

export const handler = async (event) => {
  console.log("event: ", event);

  if (
    event.httpMethod === "GET" &&
    event.queryStringParameters &&
    event.queryStringParameters["type"]
  ) {
    return await getPostByType(event.queryStringParameters["type"]);
  } else if (
    event.httpMethod === "GET" &&
    event.queryStringParameters["postYear"]
  ) {
    return await getPosts(event.queryStringParameters["postYear"]);
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

async function getPosts(year) {
  const queryCmd = new QueryCommand({
    TableName: tableName,
    IndexName: feedTableName,
    KeyConditionExpression: "PostYear = :pk",
    ExpressionAttributeValues: {
      ":pk": {
        S: year,
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
    PostYear: {
      S: parsedPost.date.slice(0, 4),
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
