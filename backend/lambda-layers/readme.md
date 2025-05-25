# Creating a lambda layer with native binaries

Open AWS CloudShell in AWS console.
Run `uname -m` to check OS architecture.
Create a new Node.js project on the root.

```bash
cd /
sudo mkdir sharp-layer
cd sharp-layer
sudo npm init -y
sudo npm install sharp
```

Next, create the Lamba layer zip artifact.

```bash
cd /
sudo mkdir -p nodejs/node20
sudo cp -r sharp-layer/node_modules nodejs/node20/
sudo zip -r layer_content.zip nodejs
```

When your Lambda function runs, AWS Lambda will:

- Look in `/opt` (where your layer is mounted)
- Add `/opt/nodejs/node_modules` or `/opt/nodejs/node20/node_modules` to NODE_PATH
- Then `require('sharp')` works as expected

If your structure is wrong (e.g., missing node_modules or using the wrong version folder), you’ll get:
Cannot find module 'sharp' or other import-related errors

Creating the layer with AWS CLI.

```bash
aws lambda publish-layer-version --layer-name node-sharp-layer \
--zip-file fileb://sharp_layer.zip \
--compatible-runtimes nodejs20.x \
--compatible-architectures "x86_64"
```

## Using this layer

This layer is for nodejs20.x, you can upload it using the above cli command.
