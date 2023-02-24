import { Card, CardContent, Grid, Typography, List, ListItem } from '@mui/material'
import React from 'react'

const About = () => {
    return (
        <Grid container sx={{ mt: 10 }}>
            <Grid container >
                <Grid sx={{mb: 2}}>
                    <Card elevation={2}>
                        <CardContent>
                            <Typography gutterBottom variant="h6" component="div" >
                                About the Cloud Assistant
                            </Typography>
                            <Typography variant="body2" color="text.primary" >
                                The Cloud assistant provides users with a conversational
                                interface leveraging Natural Language Understanding (NLU) to interact with various AWS services and
                                automates/performs all sorts of simple or advanced operations on behalf of users. It allows users to
                                manage their AWS accounts using natural language thus reducing time spent navigating the AWS
                                console or figuring out the proper CLI commands. 
                            </Typography>
                        </CardContent>
                    </Card>   
                </Grid>
            </Grid> 

            <Grid container spacing={2}>
                <Grid item xs={4} >
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Example EC2 Queries</Typography>
                            <List>
                                <ListItem><Typography color="text.secondary" variant="body2">* Can you show me all my ec2 instances?</Typography></ListItem>
                                <ListItem><Typography color="text.secondary" variant="body2">* Launch 1 linux instance on t2 micro</Typography></ListItem>
                                <ListItem><Typography color="text.secondary" variant="body2">* Launch 2 windows instances on t3 micro</Typography></ListItem>
                                <ListItem><Typography color="text.secondary" variant="body2">* List ec2 instances</Typography></ListItem>
                                <ListItem><Typography color="text.secondary" variant="body2">* Find all windows instances</Typography></ListItem>
                                <ListItem><Typography color="text.secondary" variant="body2">* Find all instances running on t2 micro</Typography></ListItem>
                                <ListItem><Typography color="text.secondary" variant="body2">* Are there instances deployed to a public subnet?</Typography></ListItem>
                                <ListItem><Typography color="text.secondary" variant="body2">* Terminate these instances</Typography></ListItem>
                            </List>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Example S3 Queries</Typography>
                            <List>
                                <ListItem><Typography color="text.secondary" variant="body2">* Show me all my S3 buckets</Typography></ListItem>
                                <ListItem><Typography color="text.secondary" variant="body2">* Search for "py" in bucket 7</Typography></ListItem>
                                <ListItem><Typography color="text.secondary" variant="body2">* Search for "ppt" in bucket 7</Typography></ListItem>
                                <ListItem><Typography color="text.secondary" variant="body2">* Search for "ppt" across all buckets</Typography></ListItem>
                                <ListItem><Typography color="text.secondary" variant="body2">* Create a new S3 bucket</Typography></ListItem>
                                <ListItem><Typography color="text.secondary" variant="body2">* Copy found files to new bucket</Typography></ListItem>
                            </List>
                        </CardContent>
                    </Card>                
                </Grid>


                <Grid item xs={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Other Example Queries</Typography>
                            <List>
                                <ListItem><Typography color="text.secondary" variant="body2">* Switch region to ohio</Typography></ListItem>
                                <ListItem><Typography color="text.secondary" variant="body2">* Switch back region to Virginia</Typography></ListItem>
                                <ListItem><Typography color="text.secondary" variant="body2">* Are there any wide open security group rules?</Typography></ListItem>
                                <ListItem><Typography color="text.secondary" variant="body2">*  Modify security group rules to allow traffic from 10.11.12.13</Typography></ListItem>
                            </List>
                        </CardContent>
                    </Card>    
                </Grid>   
            </Grid>
               

        </Grid>        
    )
}

export default About
