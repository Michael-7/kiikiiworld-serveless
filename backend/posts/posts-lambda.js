import {
  DynamoDBClient,
  QueryCommand,
  PutItemCommand,
  DeleteItemCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";

// import { tableName } from "../env";

const tableName = "kiikiiworld-serverless-prd";
const feedTableName = "kiikiiworld-serverless-prd-feed";

const client = new DynamoDBClient({ region: "eu-central-1" });

export const handler = async (event) => {
  console.log("* event: ", event);

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
  } else if (
    event.httpMethod === "DELETE" &&
    event.queryStringParameters["id"] &&
    event.queryStringParameters["type"] &&
    event.queryStringParameters["date"]
  ) {
    deletePost(
      event.queryStringParameters["id"],
      event.queryStringParameters["type"],
      event.queryStringParameters["date"]
    );
  } else if (event.httpMethod === "PUT" && event.body) {
    return await putPost(event.body);
  } else if (event.httpMethod === "PATCH" && event.body) {
    return await patchPost(event.body);
  }

  return generateResponse("SKIPPED");
};

async function putPost(post) {
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

async function deletePost(postId, postType, postDate) {
  const dateId = `${postDate}__${postId}`;

  const deleteCmd = new DeleteItemCommand({
    TableName: tableName,
    Key: {
      PostType: { S: postType },
      DateId: { S: dateId },
    },
  });

  return await sendCommand(deleteCmd);
}

async function patchPost(post) {
  const parsedPost = JSON.parse(post);
  const { date, id, type, ...postContent } = parsedPost;

  const dateId = `${date}__${id}`;

  const patchPost = new UpdateItemCommand({
    TableName: tableName,
    Key: {
      PostType: {S: type},
      DateId: {S: dateId},
    },
    UpdateExpression: "set Content = :body",
    ExpressionAttributeValues: {
      ":body": { S: JSON.stringify(postContent) },
    }
  });

  return await sendCommand(patchPost);
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
