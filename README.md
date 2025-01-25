# kiikiiworld-serveless

serverless blog

# terraform

run `./aws-login.sh` in ./deployment to login to AWS and then `export AWS_PROFILE=mmh-sandbox`.
run `terraform apply -auto-approve` in the ./deployment/terraform folder.

## You need to create the aws secret yourself in the GUI

And then change the `SECRETS_ENDPOINT` variables
