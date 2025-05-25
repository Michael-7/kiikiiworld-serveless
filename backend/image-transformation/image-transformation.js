import sharp from 'sharp';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

const region = 'eu-central-1';
const s3 = new S3Client({ region });

export const handler = async (event) => {
  console.log('event', event);
  const bucket = event.Records[0].s3.bucket.name;
  const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));

  console.log('key: ', key);
  console.log('bucket: ', bucket);

  const originalImg = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  const imgBody = originalImg.Body;
  const stream = imgBody instanceof Readable ? imgBody : Readable.from(imgBody);
  const imageBuffer = await streamToBuffer(stream);

  const optimizedImg = await sharp(imageBuffer)
    .resize({ width: 640 }) // optional resize
    .webp({ quality: 95 })
    .toBuffer();

  const outputKey = key.replace('original/', 'optimized/').replace(/\.\w+$/, '.webp');

  await s3.send(new PutObjectCommand({
    Bucket: bucket,
    Key: outputKey,
    Body: optimizedImg,
    ContentType: 'image/webp',
  }));

  return {
    statusCode: 200,
    body: `Image optimized to ${outputKey}`,
  };
};

function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', chunk => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}
