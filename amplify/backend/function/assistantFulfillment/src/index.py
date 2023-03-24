"""
 This code sample demonstrates an implementation of the Lex Code Hook Interface
 in order to serve a bot which manages dentist appointments.
 Bot, Intent, and Slot models which are compatible with this sample can be found in the Lex Console
 as part of the 'MakeAppointment' template.

 For instructions on how to set up and test this bot, as well as additional samples,
 visit the Lex Getting Started documentation http://docs.aws.amazon.com/lex/latest/dg/getting-started.html.
"""

import json
import dateutil.parser
import datetime
import time
import os
import math
import random
import logging
import boto3
import copy
from botocore.config import Config
from botocore.exceptions import ClientError

logger = logging.getLogger()
logger.setLevel(logging.INFO)



""" --- Helpers to build responses which match the structure of the necessary dialog actions --- """


def elicit_slot(session_attributes, intent_name, slots, slot_to_elicit, message, response_card):
    return {
        'sessionAttributes': session_attributes,
        'dialogAction': {
            'type': 'ElicitSlot',
            'intentName': intent_name,
            'slots': slots,
            'slotToElicit': slot_to_elicit,
            'message': message,
            'responseCard': response_card
        }
    }


def confirm_intent(session_attributes, intent_name, slots, message, response_card):
    return {
        'sessionAttributes': session_attributes,
        'dialogAction': {
            'type': 'ConfirmIntent',
            'intentName': intent_name,
            'slots': slots,
            'message': message,
            'responseCard': response_card
        }
    }


def close(session_attributes, fulfillment_state, message):
    response = {
        'sessionAttributes': session_attributes,
        'dialogAction': {
            'type': 'Close',
            'fulfillmentState': fulfillment_state,
            'message': message
        }
    }

    return response


def delegate(session_attributes, slots):
    return {
        'sessionAttributes': session_attributes,
        'dialogAction': {
            'type': 'Delegate',
            'slots': slots
        }
    }


def build_response_card(title, subtitle, options):
    """
    Build a responseCard with a title, subtitle, and an optional set of options which should be displayed as buttons.
    """
    buttons = None
    if options is not None:
        buttons = []
        for i in range(min(5, len(options))):
            buttons.append(options[i])

    return {
        'contentType': 'application/vnd.amazonaws.card.generic',
        'version': 1,
        'genericAttachments': [{
            'title': title,
            'subTitle': subtitle,
            'buttons': buttons
        }]
    }



def buildConfig(intent_request):
    
    # Get session attributes
    sessionAttributes = intent_request['sessionState'].get('sessionAttributes')
    
    # Set region to virginia if no session attributes or region variable
    if not sessionAttributes or sessionAttributes.get('region') is None:
        region = 'us-east-1'
    else:
        region = sessionAttributes['region']
    
    # Create dict config  
    my_config = Config(
        region_name = region,
        signature_version = 'v4',
        retries = {
            'max_attempts': 10,
            'mode': 'standard'
        }
    )
    
    # Return config
    return my_config


""" --- Intents --- """
def listInstances(intent_request):
    logger.info('Received a request to list EC2 instances')
    
    # Build config
    config = buildConfig(intent_request)
    
    # Create client 
    ec2 = boto3.client('ec2', config = config)
    
    # Get optional filter variables
    slots = intent_request['sessionState']['intent']['slots']
    instanceAmi = slots['ami']
    instanceType = slots['instanceType']
    subnetType = slots['subnetType']
    
    # Build list of filters
    filters = []
    if instanceAmi is not None: 
        filters.append({
            'Name': 'image-id',
            'Values': [instanceAmi['value']['interpretedValue']]
        })
        
    if instanceType is not None: 
        filters.append({
            'Name': 'instance-type',
            'Values': [instanceType['value']['interpretedValue']]
        })        
        


    # Describe instances
    response = ec2.describe_instances(Filters = filters)
    instancesFilteredAttributes = filterInstanceAttributes(response)
    
    # Additional filtering (for filters that requires additional API calls)
    if subnetType is not None:
        instancesFilteredAttributes = filterInstancesBySubnetType(ec2, instancesFilteredAttributes, subnetType['value']['interpretedValue'])
    
    # Extract instance Ids
    instanceIds = [instance['InstanceId'] for instance in instancesFilteredAttributes]
    logger.info(instancesFilteredAttributes)
    
    # Add instance to session attributes
    sessionAttributes = updateSessionAttributes(intent_request, 'instances', json.dumps(instancesFilteredAttributes, default=str))
    
    # Prepare resulting message
    if len(filters) > 0 or subnetType is not None:
        # message = "You have a total of {} instances based on your filters. InstanceIds are: {}. Additional information is attached.".format(len(instancesFilteredAttributes), instanceIds)
        message = "You have a total of {} instances based on your filters. Additional information is attached".format(len(instancesFilteredAttributes))
    else: 
        # message = "You have a total of {} instances. InstanceIds are: {}. Additional information is attached.".format(len(instancesFilteredAttributes), instanceIds)
        message = "You have a total of {} instances. Additional information is attached.".format(len(instancesFilteredAttributes))

        
        
    # Add selected-instances context
    # contexts = [{
    #     'name': 'selected-instances',
    #     'contextAttributes': {},
    #     'timeToLive': {
    #         'timeToLiveInSeconds': 3600, 
    #         'turnsToLive': 5
    #     }        
    # }]


    # Return response
    intentName = intent_request['sessionState']['intent']['name']
    return prepareResponse(intentName, sessionAttributes, message, [])
    
    

def filterInstanceAttributes(ec2DescribeResponse):
    
    # Aggregate instances
    instances = []
    for reservation in ec2DescribeResponse.get('Reservations'):
        reservationInstances = reservation.get('Instances')
        instances += reservationInstances    
    
    # Filter instance attributes
    desiredAttributes = ['ImageId', 'InstanceId', 'InstanceType', 'State', 'KeyName', 'LaunchTime', 'Placement', 'PrivateIpAddress', 'PublicIpAddress', 'SubnetId']
    instancesFilteredAttributes = [{attribute:value for attribute, value in instance.items() if attribute in desiredAttributes} for instance in instances]
    
    # Eliminate terminated instances
    instancesFilteredAttributes = [instance for instance in instancesFilteredAttributes if instance['State']['Name'] != 'terminated']
    
    # Return
    return instancesFilteredAttributes
    
    
def filterInstancesBySubnetType(ec2, instances, targetSubnetType): 
    
    # Initialize results
    filteredInstances = []
    
    # Loop through instances
    for instance in instances: 
        
        # Get subnet type for instance
        subnetType = getSubnetType(ec2, instance['SubnetId'])
        print(subnetType, targetSubnetType)
        if subnetType != targetSubnetType: continue
        
        # Store in filtered instances
        instance['SubnetType'] = subnetType
        filteredInstances.append(instance)

    # Return instances
    return filteredInstances
    
    
def getSubnetType(ec2, subnetId):
    
    # Get subnet's route table
    response = ec2.describe_route_tables(Filters = [{'Name': 'association.subnet-id', 'Values': [subnetId]}])
    RouteTable = response['RouteTables']    

    # Check if subnet is associated with main table
    if not RouteTable: 
        # print('Subnet is associated with main route table')

        # Get main route table
        response2 = ec2.describe_route_tables(Filters = [{'Name': 'association.main', 'Values': ['true']}])
        routes = response2['RouteTables'][0]['Routes']

        # Check if routes include igw
        isPublic = any([route['GatewayId'].startswith('igw-') for route in routes])    

    else: 

        # Get route table routes
        routes = RouteTable[0]['Routes']

        # Check if routes include igw
        isPublic = any([route['GatewayId'].startswith('igw-') for route in routes])


    return 'public' if isPublic else 'private'
    
def createInstance(intent_request):
    logger.info('Received a request to create an EC2 instance')
    
    # Build config and create ec2 resource
    config = buildConfig(intent_request)
    ec2Res = boto3.resource('ec2', config = config)   
    ec2 = boto3.client('ec2', config = config)   
    
    # Extract slot variables
    slots = intent_request['sessionState']['intent']['slots']
    instanceAmi = slots['ami']['value']['interpretedValue']
    instanceType = slots['instanceType']['value']['interpretedValue']
    instanceCount = int(slots['count']['value']['interpretedValue'])

    # Get default security group id
    securityGroupId = [group['GroupId'] for group in ec2.describe_security_groups()['SecurityGroups'] if group['GroupName'] == 'default'][0]
        
    # Create the instance
    response = ec2Res.create_instances(ImageId = instanceAmi, \
                InstanceType = instanceType, SecurityGroupIds = [securityGroupId], \
                MinCount = instanceCount, MaxCount = instanceCount)    
    newInstanceIds = [instance.instance_id for instance in response]
    time.sleep(0.5)
    
    # Describe newly created instances & extract subset of attributes
    describeResponse = ec2.describe_instances(InstanceIds = [instance.instance_id for instance in response])
    instancesFilteredAttributes = filterInstanceAttributes(describeResponse)
                
    # Store created instances in session attriubtes
    sessionAttributes = updateSessionAttributes(intent_request, 'instances', json.dumps(instancesFilteredAttributes, default=str))    
    
    # Return response
    intentName = intent_request['sessionState']['intent']['name']
    message = '{} instances were launched with the following ids: {}'.format(instanceCount, newInstanceIds)
    
    logger.info(message)    
    return prepareResponse(intentName, sessionAttributes, message)



def terminateInstances(intent_request):
    logger.info('Received a request to terminate an EC2 instance')
    
    # Build config and create ec2 resource
    config = buildConfig(intent_request)
    ec2 = boto3.client('ec2', config = config)    
    
    
    # Extract selected instances from session attributes
    sessionAttributes = intent_request['sessionState'].get('sessionAttributes')
    logger.info(sessionAttributes)
    selectedInstances = json.loads(sessionAttributes['instances'])
    instanceIds = [instance['InstanceId'] for instance in selectedInstances]

    # Create the instance
    response = ec2.terminate_instances(InstanceIds = instanceIds)    
                
    # Create message
    message = 'These instances were terminated: {}'.format(instanceIds)
    logger.info(message)
    
    # Return response
    intentName = intent_request['sessionState']['intent']['name']
    sessionAttributes = intent_request['sessionState'].get('sessionAttributes')
    return prepareResponse(intentName, sessionAttributes, message)



def changeRegion(intent_request):
    logger.info('Received a request to change the region')
    
    # Get region slot
    slots = intent_request['sessionState']['intent']['slots']
    region = slots['region']['value']['interpretedValue']
    
    # Change region in session attributes
    sessionAttributes = updateSessionAttributes(intent_request, 'region', region)
    
    # Prepare resulting message
    message = "Assistant is now operating in the {} region".format(region)
    intentName = intent_request['sessionState']['intent']['name']

    return prepareResponse(intentName, sessionAttributes, message)    



def isOpenRule(rule): 
    
    # Get ip ranges
    ipRanges = rule['IpRanges']
    if not ipRanges: return False
    
    # Check ip
    if ipRanges[0]['CidrIp'] == '0.0.0.0/0': return True
    return False

def listRules(intent_request):
    logger.info('Received a request to list security group rules')
    
    # Build config and create ec2 resource
    config = buildConfig(intent_request)
    ec2Res = boto3.resource('ec2', config = config)   
    ec2 = boto3.client('ec2', config = config)     

    # Get default security group id
    securityGroupId = [group['GroupId'] for group in ec2.describe_security_groups()['SecurityGroups'] if group['GroupName'] == 'default'][0]
    
    # Find security group resource & get inbound rules
    sg = ec2Res.SecurityGroup(securityGroupId)
    inboundRules = sg.ip_permissions
    logger.info(inboundRules)
    
    # Identify open rules
    openRules = [rule for rule in inboundRules if isOpenRule(rule)]
    openPorts = [rule['ToPort'] for rule in openRules]
    
    # Update session attributes
    sessionAttributes = updateSessionAttributes(intent_request, 'sg-open-rules', json.dumps(openRules, default=str))     
    
    # Create message
    message = 'There are {} security group rules with unrestricted inbound traffic to the following ports: {}'.format(len(openRules), openPorts)
    logger.info(message)
    
    # Return response
    intentName = intent_request['sessionState']['intent']['name']
    return prepareResponse(intentName, sessionAttributes, message)    
    
    
def listS3Buckets(intent_request):
    logger.info('Received a request to list all S3 buckets')
    
    # Build config and create s3 resource dfg
    config = buildConfig(intent_request)
    s3 = boto3.client('s3')    
    
    # List all buckets
    buckets = s3.list_buckets()['Buckets']
    bucketNames = [bucket['Name'] for bucket in buckets]
    bucketList = [str(idx+1) + ') ' + bucket['Name'] for idx, bucket in enumerate(buckets)]
    bucketList = '\n'.join(bucketList)   
    
    # Store versioning information
    for i in range(len(buckets)): 
        buckets[i]['Versioning'] = True if s3.get_bucket_versioning(Bucket=buckets[i]['Name']).get('Status') == 'Enabled' else False    
    
    # Update session attributes
    sessionAttributes = updateSessionAttributes(intent_request, 's3-bucket-list', json.dumps(buckets, default=str))    
    
    # Create message
    # message = 'There are {} S3 buckets. They are listed below: \n'.format(len(bucketNames)) + bucketList
    message = 'There are {} S3 buckets. Bucket names and other information is attached.'.format(len(bucketNames))
    logger.info(message)
    
    # Return response
    intentName = intent_request['sessionState']['intent']['name']
    return prepareResponse(intentName, sessionAttributes, message)      
    
    
    
def searchS3(intent_request):
    logger.info('Received a request to search in S3')
    
    # Build config and create s3 resource
    config = buildConfig(intent_request)
    s3 = boto3.client('s3')    
    
    # List all buckets
    buckets = s3.list_buckets()['Buckets']
    bucketNames = [bucket['Name'] for bucket in buckets]

    # Get available slots
    slots = intent_request['sessionState']['intent']['slots']
    pattern = slots['objName']['value']['originalValue']
    bucketIndex = None
    if slots['bucketIndex'] is not None: bucketIndex = slots['bucketIndex']['value']['interpretedValue']

    # Initialize results
    items = []
    maxPerBucket = 10
    printableItems = ''
    
    # Search in specific bucket
    if bucketIndex is not None: 
        
        # Get bucket name
        logger.info('Search in single bucket')
        bucketIndex = int(bucketIndex) - 1
        bucketName = bucketNames[bucketIndex]
        
        # Search bucket
        items = searchBucket(s3, bucketName, pattern)
        itemKeys = [str(idx+1) + ') ' + item['Key'] for idx, item in enumerate(items)]
        
        logger.info(items)
        if items: printableItems = '\n'.join(itemKeys)  

        # Create message
        logger.info(items)
        # message = '{} objects were found containing the keyword "{}" in bucket {}. Items are listed below: {}'.format(len(items), pattern, bucketName, printableItems)      
        message = '{} objects were found containing the keyword "{}" in bucket {}. Search results are attached.'.format(len(items), pattern, bucketName) 
        
        
    # Search across all buckets (powerful)
    else: 

        # Loop through buckets
        logger.info('Search in all buckets')
        for bucketName in bucketNames: 
            
            # Skip admin buckets
            if 'isengard' in bucketName.lower(): continue
            
            # Search in bucket
            logger.info('Searching in bucket {}'.format(bucketName))
            bucketItems = searchBucket(s3, bucketName, pattern)
            if not bucketItems: continue
        
            # Append items
            items += bucketItems[:maxPerBucket]


        # Create message
        itemKeys = [str(idx+1) + ') ' + item['Key'] for idx, item in enumerate(items)]
        if items: printableItems = '\n'.join(itemKeys)  
        # message = '{} objects were found containing the keyword "{}" across all buckets. Items are listed below: {}'.format(len(items), pattern, printableItems)
        message = '{} objects were found containing the keyword "{}" across all buckets. Search results are attached.'.format(len(items), pattern)
    
    #Update session attributes
    sessionAttributes = updateSessionAttributes(intent_request, 's3-found-objects', json.dumps(items, default=str))    
    
    # Log message
    logger.info(message)
    
    # Return response
    intentName = intent_request['sessionState']['intent']['name']
    return prepareResponse(intentName, sessionAttributes, message)        
    
    
def searchBucket(client, bucketName, pattern): 
    
    # Get paginator
    paginator = client.get_paginator('list_objects_v2')
    page_iterator = paginator.paginate(Bucket=bucketName)    
    
    # Search for pattern
    items = []
    objects = page_iterator.search("Contents[?contains(Key, `{}`) || contains(Key, `{}`)][]".format(pattern, pattern.capitalize()))
    for item in objects:
        if item is None: continue # here
        item['Bucket'] = bucketName
        items.append(item)
        
    # Return items
    return items
    
    
def createS3Bucket(intent_request): 
    logger.info('Received a request to create an S3 bucket')
    
    # Build config and create s3 resource
    config = buildConfig(intent_request)
    s3Res = boto3.resource('s3')    
    
    # Define parameters
    acl = 'private'
    
    # Read bucket name from slots
    slots = intent_request['sessionState']['intent']['slots']
    bucketName = slots['bucketName']['value']['originalValue']   
    bucketName = bucketName.lower()

    # Create bucket
    try:
        bucket = s3Res.create_bucket(ACL=acl, Bucket=bucketName)  #CreateBucketConfiguration= {'LocationConstraint': config.region_name}
    except ClientError as err: 
        logger.info(err.response)
        # if err.response['Error']['Code'] == 'BucketAlreadyExists':
        try:
            logger.info('Retrying bucket creation with a random bucket suffix...')
            timeSuffix = datetime.datetime.now().strftime('-%m-%d-%Y-%H-%M-%S')
            bucket = s3Res.create_bucket(ACL=acl, Bucket=bucketName + timeSuffix)
        except Exception as ex:
            logger.info(ex)
            logger.info('Some other error happened...exiting')
            return
            
    # Update session attributes
    sessionAttributes = updateSessionAttributes(intent_request, 's3-new-bucket', bucket.name)    
    
    # Create message
    message = 'A new S3 bucket was created with the following name: {}'.format(bucket.name)
    logger.info(message)
    
    # Return response
    intentName = intent_request['sessionState']['intent']['name']
    return prepareResponse(intentName, sessionAttributes, message)         


def copyToNewBucket(intent_request): 
    logger.info('Received a request to copy files to a new S3 bucket')
    
    # Build config and create s3 resource
    config = buildConfig(intent_request)
    s3Res = boto3.resource('s3')       
    
    # Retrive new bucket and search results from session attributes
    sessionAttributes = intent_request['sessionState'].get('sessionAttributes')
    logger.info(sessionAttributes)
    newBucketName = sessionAttributes['s3-new-bucket']
    s3Objects = json.loads(sessionAttributes['s3-found-objects'])
    
    # Get new bucket resource
    newbucket = s3Res.Bucket(newBucketName)
    
    
    # Copy files to new bucket
    for obj in s3Objects:
        
        # create source copy
        copy_source = {
            'Bucket': obj['Bucket'],
            'Key': obj['Key']
        }        
    
        # Copy to bucket
        newbucket.copy(copy_source, obj['Key'])
        
        
    # Create message
    message = '{} target files/objects were successfully copied to new bucket {}'.format(len(s3Objects), newBucketName)
    logger.info(message)
    
    # Return response
    intentName = intent_request['sessionState']['intent']['name']
    return prepareResponse(intentName, sessionAttributes, message)         
    

    
def replaceRules(intent_request):
    logger.info('Received a request to modify security group rules')
    myIpAddress = '76.243.176.78/32'
    
    # Build config and create ec2 resource
    config = buildConfig(intent_request)
    ec2Res = boto3.resource('ec2', config = config)   
    ec2 = boto3.client('ec2', config = config)    

    # Get default security group id
    securityGroupId = [group['GroupId'] for group in ec2.describe_security_groups()['SecurityGroups'] if group['GroupName'] == 'default'][0] 
    
    # Extract slot values
    slots = intent_request['sessionState']['intent']['slots']
    allowedIpAddress = myIpAddress if slots['ipAddress'] is None else  slots['ipAddress']['value']['originalValue'] + '/32'


    # Extract selected SG rules from session attributes
    sessionAttributes = intent_request['sessionState'].get('sessionAttributes')
    logger.info(sessionAttributes)
    selectedRules = json.loads(sessionAttributes['sg-open-rules'])
    logger.info(selectedRules)
    
    # Modify rules
    modifiedRules = []
    for rule in selectedRules:
        modifiedRule = copy.deepcopy(rule)
        modifiedRule['IpRanges'][0]['CidrIp'] = allowedIpAddress
        modifiedRules.append(modifiedRule)

    # Revoke previous rules, and authorize modified rules
    sg = ec2Res.SecurityGroup(securityGroupId)
    sg.revoke_ingress(IpPermissions = selectedRules)
    sg.authorize_ingress(IpPermissions = modifiedRules)

    
    # Create message
    message = 'Selected security group rules have been modified to allow traffic from: {}'.format(allowedIpAddress)
    logger.info(message)
    
    # Return response
    intentName = intent_request['sessionState']['intent']['name']
    return prepareResponse(intentName, sessionAttributes, message)    
    


def updateSessionAttributes(intent_request, paramName, paramValue):

    sessionAttributes = intent_request['sessionState'].get('sessionAttributes')
    if not sessionAttributes: sessionAttributes = {}
    sessionAttributes[paramName] = paramValue
    return sessionAttributes

    


def prepareResponse(intentName, sessionAttributes, message, contexts = []): 
    
    return  {
        'sessionState': {
            'activeContexts': contexts,
            'dialogAction': {'type': 'Close'},
            'intent': {
                'name': intentName,
                'state': 'Fulfilled'
            },
            'sessionAttributes': sessionAttributes,
        },
        
        'messages': [
            {
                'contentType': 'PlainText',
                'content': message
            },
            # {
            #     'contentType': 'PlainText',
            #     'content': "A secondary message"                
            # }
            ]
    }
    

def dispatch(intent_request):

    # Log request
    # logger.debug('dispatch userId={}, intentName={}'.format(intent_request['userId'], intent_request['currentIntent']['name']))

    # Get intent name
    # intent_name = intent_request['currentIntent']['name']
    intent_name = intent_request['sessionState']['intent']['name']

    # Dispatch ec2-list intent
    if intent_name == 'ec2-list':
        return listInstances(intent_request)
        
    # Dispatch ec2-create intent
    if intent_name == 'ec2-create':
        return createInstance(intent_request)
        
    # Dispatch ec2-terminate intent
    if intent_name == 'ec2-terminate':
        return terminateInstances(intent_request)        
        
    # Dispatch set-region intent
    if intent_name == 'set-region':
        return changeRegion(intent_request)
        
    # Dispatch sg-rule-list intent
    if intent_name == 'sg-rule-list':
        return listRules(intent_request)        
        
    # Dispatch sg-rule-list intent
    if intent_name == 'sg-rule-replace':
        return replaceRules(intent_request)          
        
    # Dispatch s3-list-buckets intent
    if intent_name == 's3-list-buckets':
        return listS3Buckets(intent_request)            
        
    # Dispatch s3-search intent
    if intent_name == 's3-search':
        return searchS3(intent_request)     
        
    # Dispatch s3-create bucket intent
    if intent_name == 's3-create-bucket':
        return createS3Bucket(intent_request)          
        
    # Dispatch s3-copy-to-new-bucket bucket intent
    if intent_name == 's3-copy-to-new-bucket':
        return copyToNewBucket(intent_request)        
        
    # Raise exception if intent is not recognized 
    raise Exception('Intent with name ' + intent_name + ' not supported')


""" --- Main handler --- """
def handler(event, context):
    
    # Log event and context
    logger.info(event)
    logger.info(context)

    # By default, treat the user request as coming from the America/New_York time zone.
    os.environ['TZ'] = 'America/New_York'
    time.tzset()
    logger.debug('event.bot.name={}'.format(event['bot']['name']))

    # dispatch event and return
    return dispatch(event)
