# CLOUD-TP-frontend

Frontend of the **CLOUD-TP** project developed with React. This README explains how to run the application locally and how to deploy it to AWS S3 using AWS CLI.

---

## Prerequisites

Make sure you have the following tools installed:

* [Node.js](https://nodejs.org)
* [AWS CLI](https://aws.amazon.com/cli/) (only required for AWS deployment)

---

## Running the application locally

1. Install dependencies:

```bash
npm install
```
2. Install serve:

```bash
npm install -g serve
```
3. Build the application:

```bash
npm run build
```

4. Serve the application locally:

```bash
serve -s build
```

> This will start a local server, and you can view the application in your browser.

---

## Deploying the application to an S3 bucket

1. Build the application:

```bash
npm run build
```

2. Configure your AWS CLI credentials:

```bash
aws configure set aws_access_key_id <your access key>
aws configure set aws_secret_access_key <your secret key>
aws configure set aws_session_token <your session token>   # required if using AWS Academy Learner Lab
aws configure set region us-east-1
```

3. Verify that your bucket exists and is accessible:

```bash
aws s3 ls
```

4. Sync the build folder to your S3 bucket:

```bash
aws s3 sync build/ s3://<your-bucket-name>
```

> This will deploy the React application to your S3 bucket and make it accessible depending on the bucket permissions.

---

## Additional Notes

* If you are using **temporary credentials** (such as in AWS Academy Learner Lab), remember they **expire** after some time and need to be updated.
* This README assumes you already have an S3 bucket created and ready for deployment.
