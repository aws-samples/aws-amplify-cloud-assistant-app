
// React imports
import React, { useEffect } from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

// Material UI Imports
import { Box } from '@mui/system'
import { Stack } from '@mui/material'
import { Button, Card, CardMedia, CardContent, CardActions, Typography, Grid } from '@mui/material'
// import { createTheme } from '@mui/system'
import { TextField } from '@mui/material'
import {Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from '@mui/material'

// Amplify imports
import {API, graphqlOperation} from 'aws-amplify'
import Auth from '@aws-amplify/auth'

// GraphQL code imports
import { createConversation, deleteConversation } from '../graphql/mutations'
import { conversationsByUser } from '../graphql/queries'

// Other imports
import image from '../images/banner.jpg'

// // Create theme
// const theme = createTheme({
//     status: {
//       danger: '#e53e3e',
//     },
//     palette: {
//       primary: {
//         main: '#0971f1',
//         darker: '#053e85',
//       },
//       neutral: {
//         main: '#64748B',
//         contrastText: '#fff',
//       },
//     },
//   });


const createConversationHandler = async(handleCreateDialog, name, description, userConversations, setUserConversations) => {
    console.log('Create conversation wil happen here...')

    // Close dialog
    handleCreateDialog(false)

    // Create conversation
    let conversation = {
        name: name,
        description: description,
        user: Auth.user.attributes.email
    }
    console.log(conversation)
    console.log(Auth.user)
    
    // Call mutation
    let result = await API.graphql(graphqlOperation(createConversation, {input: conversation}))
    let newConversationObj = result.data.createConversation
    console.log(newConversationObj)

    // Update state information
    setUserConversations(userConversations => [...userConversations, newConversationObj])
}

const fetchUserConversations = async() => {
    // Get username
    const userId = Auth.user.attributes.email

    // Call query
    let result = await API.graphql(graphqlOperation(conversationsByUser, {user: userId, sortDirection: "DESC"}))
    return result
}

const deleteConversationHandler = async(handleDeleteDialog, conversationToRemove, userConversations, setUserConversations) => {

    // Close dialog
    handleDeleteDialog(false)

    // API call
    console.log("Removing conversation: ", conversationToRemove.id)
    let result = await API.graphql(graphqlOperation(deleteConversation, {input: {id: conversationToRemove.id}}))

    // Remove from list
    setUserConversations(userConversations.filter((conversation) => conversation.id !== conversationToRemove.id))

}

const Conversations = () => {

    // create conversation dialog state
    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [conversationToDelete, setConversationToDelete] = useState(null)
    const [conversationName, setConversationName] = useState("")
    const [conversationDescription, setConversationDescription] = useState("")
    const [userConversations, setUserConversations] = useState([])

    // Effect to initialize conversations
    useEffect(() => {
        async function loadUserConversations() {
            const result = await fetchUserConversations()
            const userConversations = result.data.conversationsByUser.items
            console.log(userConversations)
            setUserConversations(userConversations)
            
        }
        loadUserConversations()
    }, [])


    // Create Dialog handler
    const handleCreateDialog = (desiredState) => {
        setCreateDialogOpen(desiredState)

        if(desiredState === false){
            setConversationName("")
            setConversationDescription("")
        }
    }    
    // Delete Dialog handler
    const handleDeleteDialog = (desiredState, conversation) => {
        setDeleteDialogOpen(desiredState)

        if(desiredState === true){
            setConversationToDelete(conversation)
        }
    }      

    return (
        <div>
            <Box  sx={{flexGrow: 1, p:3, mt:7}}>
                <Card sx={{mb: 2}}>
                    <CardMedia sx={{maxWidth: 1900}}
                        component="img"
                        height="260"
                        // image="aws.png"
                        src={image}
                        alt="Cloud Assistant"
                    />
                </Card>                

                <Dialog open={createDialogOpen} onClose={() => (handleCreateDialog(false))}>
                    <DialogTitle>Create New Conversation</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            To create a new conversation with the assistant, please provide a conversation title and description. 
                        </DialogContentText>
                        <Stack>
                            <TextField
                                autoFocus
                                margin="dense"
                                id="name"
                                label="Conversation Title"
                                variant="filled"
                                fullwidth="true"
                                required
                                value={conversationName}
                                onChange={(e) => {setConversationName(e.target.value)}}
                            />
                            <TextField
                                margin="dense"
                                id="description"
                                label="Conversation Description"
                                variant="filled"
                                fullwidth="true"
                                required
                                value={conversationDescription}
                                onChange={(e) => {setConversationDescription(e.target.value)}}
                            /> 
                        </Stack>
                       
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => (handleCreateDialog(false))}>Cancel</Button>
                        <Button onClick={() => (createConversationHandler(handleCreateDialog, conversationName, conversationDescription, userConversations, setUserConversations))}>Create</Button>
                    </DialogActions>
                </Dialog> 
                <Dialog
                    open={deleteDialogOpen}
                    onClose={() => (handleDeleteDialog(false))}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">
                        {"Delete Conversation?"}
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            Are you sure you want to delete this conversation? All data and dialog information 
                            associated with the conversation will be permanently deleted!
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => (handleDeleteDialog(false))}>Cancel</Button>
                        <Button onClick={(e) => (deleteConversationHandler(handleDeleteDialog, conversationToDelete, userConversations, setUserConversations))} autoFocus>Delete</Button>
                    </DialogActions>
                </Dialog>                  

                <Grid container justifyContent="space-between">
                    <Grid item>
                        <Typography variant="h4" gutterBottom sx={{fontWeight: 'bold'}}>Previous Conversations</Typography>                        
                    </Grid>
                    <Grid>
                        <Button variant="contained" onClick={() => (handleCreateDialog(true))}>New Conversation</Button>
                    </Grid>
                </Grid>
                
                <Stack spacing={2}>
                     {userConversations.map((conversation) => (
                        <Card key={conversation.id} sx={{backgroundColor: 'light-gray'}}>
                            {/* <CardActionArea> */}
                                <CardContent>
                                    <Grid container justifyContent="space-between" >  
                                        <Grid item>
                                            <Typography sx={{ fontSize: 25 }} color="text.primary" >
                                                {conversation.name}
                                            </Typography>   
                                            <Typography sx={{ fontSize: 15 }} color="text.secondary">
                                                Description - {conversation.description}
                                            </Typography>                                       
                                        </Grid>
                                        <Grid item>
                                            <Typography sx={{ fontSize: 15 }} color="text.secondary" gutterBottom>
                                                Created On: {conversation.createdAt}
                                            </Typography>
                                        </Grid>
                                    </Grid> 
                                </CardContent>
                                <CardActions sx={{backgroundColor: "#F5F5F5"}}>
                                    <Grid container justifyContent="space-between">
                                        <Grid item>
                                            <Button size="small" variant="text" component={Link} to={"interact/" + conversation.id}>Go To Conversation</Button>
                                            <Button size="small" variant="text">Share</Button> 
                                        </Grid>
                                        <Grid item>
                                            <Button size="small" variant="contained" color="error" onClick={() => (handleDeleteDialog(true, conversation))}>Delete</Button>
                                        </Grid>
                                    </Grid>
                                </CardActions>
                                
                            {/* </CardActionArea> */}
                        </Card>                             
                                                     
                        
                     ))}
                   
                 </Stack>
                 {/* <Grid container sx={{marginTop: 2}} justifyContent="right">
                    <Button variant="contained" onClick={() => (handleCreateDialog(true))}>New Conversation</Button>
                </Grid>                  */}
            </Box>
        </div>
    )
}

export default Conversations
