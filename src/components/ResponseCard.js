import React from "react";

// Material Imports
import { Grid, Card, Typography, CardContent, CardActions, Button } from "@mui/material"
import { Alert } from "@mui/material";
import { Stack } from "@mui/material";
import LaunchIcon from "@mui/icons-material/Launch"

// My components
import MyFlexibleTable from './MyFlexibleTable'



const ResponseCard = ({intent, cardDescription, data}) => {

    const getCardTitle = () => {
        console.log('Getting card title')
        let cardTitle = ""
        switch(intent){
            case 'ec2-list': 
                cardTitle = 'EC2 Instance List'
                break
            case 'ec2-create': 
                cardTitle = 'New EC2 Instance'
                break                
            case 'ec2-terminate': 
                cardTitle = 'Terminated EC2 Instance'
                break          
            case 's3-copy-to-new-bucket': 
                cardTitle = 'S3 Object Copy'
                break          
            case 's3-create-bucket': 
                cardTitle = 'New S3 Bucket'
                break          
            case 's3-list-buckets': 
                cardTitle = 'S3 Bucket List'
                break          
            case 's3-search': 
                cardTitle = 'S3 Search Results'
                break          
            case 'set-region': 
                cardTitle = 'Region Switch'
                break                
            case 'sg-rule-list': 
                cardTitle = 'Security Group Rules'
                break       
            default: 
                cardTitle = intent
        }
        return cardTitle
    }


    const getVisual = () => {
        const visual = ""

        let rows = []
        let cols = []
        switch(intent){

            case 'ec2-list': 
                // console.log("Building visual for instance list")
                // console.log(data)
                const allInstanceData = JSON.parse(data.sessionAttributes.instances)
                if(allInstanceData.length === 0) return (null)
                                
                allInstanceData.forEach(instance => {
                    const AZ = instance.Placement.AvailabilityZone
                    const state = instance.State.Name
                    delete instance.Placement
                    delete instance.State
                    delete instance.KeyName
                    instance.AZ = AZ
                    instance.State = state
                    
                    if (!("PublicIpAddress" in instance)){
                        instance.PublicIpAddress = "N/A";
                    }else{
                        const publicIp = instance.PublicIpAddress
                        delete instance.PublicIpAddress
                        instance.PublicIpAddress = publicIp
                    }
                    // console.log(instance)
                    rows.push(Object.values(instance))
                })
                cols = Object.keys(allInstanceData[0])
                const rowIndex = cols.indexOf('InstanceId')
                return <MyFlexibleTable rows={rows} cols={cols} rowIndex={rowIndex} />

            case 'ec2-create': 
                const newInstancesData = JSON.parse(data.sessionAttributes.instances)
                return (
                    <Stack spacing={1} sx={{ width: '100%' }}>
                        {newInstancesData.map((instanceData) => (
                            <Alert variant="filled" severity="success">Instance {instanceData.InstanceId} was launched successfully with the following private IP: {instanceData.PrivateIpAddress}</Alert>
                        ))}
                    </Stack>
                )
                
            case 'ec2-terminate': 
                const terminatedInstancesData = JSON.parse(data.sessionAttributes.instances)
                return (
                    <Stack spacing={1} sx={{ width: '100%' }}>
                        {terminatedInstancesData.map((instanceData) => (
                            <Alert variant="filled" severity="warning">Instance {instanceData.InstanceId} was successfully terminated</Alert>
                        ))}

                    </Stack>
                )            

            case 's3-copy-to-new-bucket': 
                break  

            case 's3-create-bucket': 
                break      
                
            case 's3-list-buckets': 
                // console.log("Building visual for bucket list")
                const allBucketData = JSON.parse(data.sessionAttributes['s3-bucket-list'])
                // console.log(allBucketData)
                if(allBucketData.length === 0) return (null)    
                cols = ['Index', 'Bucket Name', 'Creation Date', 'Versioning']
                for (let i=0; i < allBucketData.length; i++){
                    rows.push([i+1, allBucketData[i].Name, allBucketData[i].CreationDate, allBucketData[i].Versioning.toString()])
                }
                return <MyFlexibleTable rows={rows} cols={cols} rowIndex={0} />      

            case 's3-search': 
                const searchResultsData = JSON.parse(data.sessionAttributes['s3-found-objects'])
                console.log(searchResultsData)
                if(searchResultsData.length === 0) return (null)    
                cols = ['Object Key', 'Bucket Name', 'Last Modified', 'Size', 'Storage Class']
                for (let i=0; i < searchResultsData.length; i++){
                    rows.push([searchResultsData[i].Key, searchResultsData[i].Bucket, searchResultsData[i].LastModified, searchResultsData[i]['Size'], searchResultsData[i].StorageClass])
                }
                return <MyFlexibleTable rows={rows} cols={cols} rowIndex={0} />     

            case 'set-region': 
                break  

            case 'sg-rule-list': 
                break     
                  
            default: 
                return visual
        }
        return visual        
    }


    return (
        <Grid item>
            <Card elevation={2}>
                <CardContent>
                    <Typography gutterBottom variant="h5" component="div" >
                        {getCardTitle()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                        {cardDescription}
                    </Typography>
                    {getVisual()}
                </CardContent>
                {Object.keys(data).length > 0 && 
                    <CardActions spacing={0} mt={0} pt={0}>
                        <Button size="small" endIcon={<LaunchIcon/>}>Explore in Console</Button>
                        <Button size="small">Share</Button>
                    </CardActions>                
                }

            </Card>   
        </Grid>
    )
}

export default React.memo(ResponseCard)
