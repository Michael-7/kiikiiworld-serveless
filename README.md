# kiikiiworld-serveless

serverless blog

# terraform

run `./aws-login.sh` in ./deployment to login to AWS and then `export AWS_PROFILE=mmh-sandbox`.
run `npm run build` in ./frontend to build the frontend
run `terraform apply -auto-approve` in the ./deployment/terraform folder.

## You need to create the aws secret yourself in the GUI

And then change the `SECRETS_ENDPOINT` variables

You also need to create certificates in us-east-1 for (kiikiiworld.com & www.kiikiiworld.com) for cloudfront
and eu-central-1 (api.kiikiiworld.com) for api gateway
