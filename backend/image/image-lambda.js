import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// TODO MAKE https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/javascript_s3_code_examples.html

const bucketName = 'kiikiiworld-serverless-prd-image';
const region = 'eu-central-1';

export const handler = async (event) => {
  console.log('event: ', event);

  if (event.httpMethod === 'GET') {
    const fileName = event.queryStringParameters['fileName'];
    const fileType = event.queryStringParameters['fileType'];
    const fileSize = event.queryStringParameters['fileSize'];

    if (!event.queryStringParameters || !fileName || !fileType || !fileSize) {
      return generateResponse(
        'You need to add fileName, fileSize and fileType query parametes.',
        400,
      );
    }

    if (fileSize > 5242880) {
      return generateResponse('Your file size is too large.', 403);
    }

    const clientUrl = await createPresignedUrlWithClient({
      bucket: bucketName,
      region,
      fileName,
      fileType,
      fileSize,
    });

    return generateResponse(clientUrl);

    // await put(clientUrl, "Hello World");

    // const params = {
    //   Bucket: bucketName,
    //   Key: fileName,
    //   Expires: 60, // URL validity in seconds
    //   ContentType: fileType,
    // };

    // const presignedUrl = await getSignedUrl("putObject", params);

    // return generateResponse(presignedUrl);
  }

  // if (event.httpMethod === "POST") {
  //   return generateResponse("POST MESSAGE");
  // }

  return generateResponse('SKIPPED');
};

const createPresignedUrlWithClient = ({
                                        region,
                                        bucket,
                                        fileName,
                                        fileType,
                                        fileSize,
                                      }) => {
  const client = new S3Client({ region });
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: fileName,
    ContentType: fileType,
    ContentLength: fileSize,
  });
  return getSignedUrl(client, command, { expiresIn: 3600 });
};

function generateResponse(responseMessage, statusCode = 200) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: responseMessage,
    }),
  };
}
