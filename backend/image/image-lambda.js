import { getSignedUrl } from "@aws-sdk/client-s3";

// TODO MAKE https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/javascript_s3_code_examples.html

const bucketName = "kiikiiworld-serverless-prd-image";

exports.handler = async (event) => {
  console.log("event: ", event);

  if (event.httpMethod === "GET") {
    const fileName = event.queryStringParameters["fileName"];
    const fileType = event.queryStringParameters["fileType"];

    if (!event.queryStringParameters || !fileName || !fileType) {
      return generateResponse(
        "You need to add fileName and fileType query parametes.",
        400
      );
    }

    const params = {
      Bucket: bucketName,
      Key: fileName,
      Expires: 60, // URL validity in seconds
      ContentType: fileType,
    };

    const presignedUrl = await getSignedUrl("putObject", params);

    return generateResponse(presignedUrl);
  }

  return generateResponse("SKIPPED");
};

function generateResponse(responseMessage, statusCode = 200) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: responseMessage,
    }),
  };
}
