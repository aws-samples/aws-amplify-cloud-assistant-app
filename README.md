# The Cloud Assistant

This application demonstrates how AWS Amplify can be used to build and deploy an automated AWS account management web application powered by a conversational AI built with Amazon Lex (Figure 1). This application (hereinafter referred to as the cloud assistant) provides users with a conversational interface leveraging Natural Language Understanding (NLU) to interact with various AWS services and automates/performs all sorts of simple or advanced operations on behalf of users. It allows users to manage their AWS accounts using natural language thus reducing time spent navigating the AWS console or figuring out the proper CLI commands. You can use this sample application as an example of how Amplify in combination with other AWS services can be used to build any other kind of assistant-powered web application. 

For more information, please read the associated AWS blog post here.

![Architecture Diagram](/static/images/architecture.png)*Figure 1: Application Architecture*

This project uses React framework and leverages AWS Amplify. This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

[[_TOC_]]

## Pre-Requisites
- AWS Account
- Install NodeJS and NPM
- Install and configure AWS Amplify CLI
  - Install Amplify CLI using: ```npm install -g @aws-amplify/cli```
  - Configure Amplify profile using: ```amplify configure```
- Prepare Python Environment
  - Install Python 3.8 
  - Create virtualenv using: ```python -m venv pathToEnv```
  - Activate python virtualenv using: ```source pathToEnv/Scripts/activate```
  - Install pipenv in virtual environment with ```pip3 install pipenv```

> Important: make sure to run all subsequent Amplify commands with the python virtual environment activated!


## Step I - Initialize and deploy Amplify backend
Initialize the Amplify project with: ```amplify init --app https://github.com/aws-samples/aws-amplify-cloud-assistant-app.git```. The command will: 
  - Clone the repository into local directory (i.e., where command is run)
  - Initialize Amplify project: Make sure to select Amplify profile created during ```amplify configure``` step. 
  - Deploy the application backend (Auth, Api, Lambda, Hosting)
  - Configure the frontend to use the backend
  - Start the application on a local development server

After the command has completed, open the repository directory in your favorite code editor (e.g. Visual Studio Code)

## Step II - Create the assistant bot using Amazon Lex
1. Create a zip file containing the contents of “bot” directory
2. Navigate to the Amazon Lex console and click "Get Started"
    - Select "Import" from the "Action" dropdown to import the bot
    - Name the bot and upload the zip file created in step 1
    - Select Create a role with basic Amazon Lex permissions
    - Choose "No" under the Children's Online Privacy Protection Act (COPPA)
    - Set the session timeout to 5 minutes
3. Build the draft version of the bot
    - Select the newly created bot, and navigate to the "Intents" section of the "Draft version"
    - Select the "Build" button at the top and wait for the build to finish
4. Create a new bot version
    - Navigate to the "Bot versions" section from the left-hand menu
    - Click "Create version", and push the "Create" button
5. Create a new Alias for the bot to be used by the application
    - Navigate to the "Aliases" section of the menu and select "Create alias"
    - Name the alias "AliasForApp" Choose the newly created version (i.e. Version 1)
    - Navigate to the newly created alias, click on "English (US)" to choose the backend lambda
    - Choose the assistantFulfillment-{envName} lambda with "$LATEST" version, and save



## Step III - Integrate bot with application front-end
1. Take note of key bot information from the Lex console 
    - Locate the Bot ID from the bot page
    - Locate the Bot Alias ID from the Alias page
2. Edit the App.js under the src folder of the repository
    - Update the bot ID (line 36)
    - Update the bot alias ID (line 37)
    - Update the region if bot was not deployed to us-east-1
3. Allow the Cognito Auth role access to the Lex bot
    - Navigate to the "Roles" section of the IAM console
    - Search for the "authRole". Select role matching this format: amplify-awsassistant-sampledev-{number}-authRole
    - Select "Attach Policies" from the "Add permissions" drop down.
    - Search for this policy "AmazonLexRunBotsOnly", select it, and click "Attach policies"


## Step IV - Publish and test application
1. Publish the application front-end using ```amplify publish```
2. Navigate to the Amplify console, select the "awsassistant" app
3. Select the "Hosting environments" tab, and copy the Domain URL
4. Open a new web browser tab, and navigate to the copied URL
5. Select "Create account" to create a new account and login
    - Provide a username (should be an email), password, email, and phone number. Click "Create Account"
    - Due to the privileges given to authenticated users, a confirmation code will not be sent
    - Click "Back to Sign In", and follow next step to confirm user
6. To confirm the user, navigate to the Cognito service on the AWS console
    - Select "User Pools", and select the assistant user pool
    - Navigate to "Users" tab, and select the new user (should have an "Unconfirmed" status)
    - Click on "Actions" button at the top of the page, then "Confirm account", and confirm
7. Sign in to the application
    - Sign in with your previously created username and password
    - You can choose to configure account recovery or skip it  
8. Select "NEW CONVERSATION" to create a new conversation with the assistant
    - Provide a title and description for the conversation, and click "Create"
9. Navigate to the newly created conversation
    - Click on "GO TO CONVERSATION" on your newly created conversation card
    - Try out the example commands below (e.g. "Launch 1 linux instance on t2 micro")

## Example Commands

#### EC2 Instance Commands
```
> Can you show me all my ec2 instances?
> Launch 1 linux instance on t2 micro
> Launch 2 red hat instances on t3 micro
> List ec2 instances
> Find all red hat instances
> Find all instances running on t2 micro
> Are there any instances deployed to a public subnet?
> Terminate these instances (Note: Make sure to run this command AFTER a previous command has already identified some instances such as any of the commands above)
```
<!-- #### Region Switch Commands 
```
> Switch region to ohio
> List all ec2 instances
> Switch back region to Virginia
``` -->
#### Security Group Rules Commands
``` 
> Are there any wide open security group rules? (Note: if this command returns no rules, edit the default security group through the AWS console, and introduce some rules with access from 0.0.0.0 on a couple of ports (e.g. HTTP or SSH), then try the command again)
> Modify security group rules to allow traffic from 10.11.12.13
```

#### S3 Commands
```
> Show me all my S3 buckets
> Search for "py" in bucket 7 (Note: replace number with bucket index from the "list S3 buckets" command)
> Search for "ppt" in bucket 7 (Note: replace number with bucket index from the "list S3 buckets" command)
> Search for "ppt" across all buckets
> Create a new S3 bucket (Note: the assistant will follow-up to ask you for a bucket name. Do not include any spaces in the bucket name)
> Copy found files to new bucket
```



## Cleanup
To cleanup all created resources, perform the following: 
- Navigate to the Amplify console, select the “awsassistant” app, click the Actions dropdown and select “Delete App”
- Navigate to the Amazon Lex console, select the assistant bot, click the Actions dropdown, and select “Delete”


