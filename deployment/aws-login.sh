#!/bin/bash

# Activate Python virtual environment
source ~/.venv/aws/bin/activate

# Log in to AWS using ADFS
aws-adfs login --profile mmh-sandbox

# Set the AWS profile environment variable
# export AWS_PROFILE=mmh-sandbox

# Get the AWS caller identity
# aws sts get-caller-identity

# Deactivate the virtual environment
deactivate