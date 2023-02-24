// React Components
import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router';

// Material Components
import { Grid, Divider} from '@mui/material';
import { Typography } from '@mui/material';
import { Box, Drawer, Toolbar, List, ListItem, ListItemText } from '@mui/material';
import SendIcon from '@mui/icons-material/Send'
import { IconButton } from '@mui/material';
import { ListItemAvatar, Avatar } from '@mui/material';
import { blue, orange } from '@mui/material/colors';
import ResponseCard from './ResponseCard';
import MyTextField from './MyTextField';
import { LinearProgress } from '@mui/material';

// Amplify Imports
import Interactions from '@aws-amplify/interactions';
import Auth from '@aws-amplify/auth';

// GraphQL imports
import {API, graphqlOperation} from 'aws-amplify'
import { getConversation } from '../graphql/queries';
import { createUtterance } from '../graphql/mutations';


// Initial values for state variables
const chatWidth = 360
const initialDialogs = [
    {
        text: "Hello, How can I help you today?",
        author: "AWS"
    }, 
]
const initialAnswers = [
    {
        intent: "Introducing the Cloud Assistant",
        description: "The Cloud Assistant is an AI designed to help you configure your AWS account using natural language. The assistant leverages advanced NLU (Natural Language Understanding) models as well as a flexible fullfillment serverless backend to perform all sorts of simple or advanced configurations in your AWS account on your behalf.",
        data: {}
    },
]


// Component for AWS dialog item
const AwsDialogItem = ({text}) => {
    return (
        <ListItem key={text} button sx={{paddingLeft: '10px', paddingRight: '10px', marginTop:'5px', marginBottom:'5px'}}>
            <ListItemAvatar sx={{minWidth: 0}} >
                <Avatar sx={{bgcolor: orange[500], fontSize: '1rem', marginRight: '8px'}} variant="rounded">AWS</Avatar>
            </ListItemAvatar> 
            <ListItemText 
                secondary={
                    <Typography variant="body2" color="text.primary" fontSize="0.9rem">{text}</Typography>
                }
            />   
        </ListItem>          
    )
}

// Component for user dialog item
const MeDialogItem = ({text, reusePreviousDialog, userInitials}) => (
    <ListItem key={text} button sx={{paddingLeft: '10px', paddingRight: '10px', marginTop:'5px', marginBottom:'5px'}} onClick={reusePreviousDialog}>
        <ListItemText 
            secondary={
                <Typography variant="body2" color="text.primary" fontSize="0.9rem" align="right" >{text}</Typography>
            }
        />
        <ListItemAvatar sx={{minWidth: 45}}>
            <Avatar sx={{bgcolor: blue[500], fontSize: '1rem', marginLeft: '8px'}} variant="rounded">{userInitials}</Avatar>
        </ListItemAvatar>                            
    </ListItem>              
)

const fetchConversationDetails = async(conversationId) => {

    // Make API call
    console.log('Fetching conversation: ', conversationId)
    let result = await API.graphql(graphqlOperation(getConversation, {id: conversationId}))
    return result
    
}

const Interact = () => {

    // Get parameters
    let { conversationId } = useParams()    

    // Define state variables here
    const [dialogs, setDialogs] = useState(initialDialogs)
    const [newQuery, setNewQuery] = useState("")
    const [answers, setAnswers] = useState(initialAnswers)
    const [loading, setLoading] = useState(false)
    const [userInitials, setUserInitials] = useState("")
    const [conversation, setConversation] = useState(null)

    // References
    const scrollRef = useRef(null)
    const dialogScrollRef = useRef(null)

    // Effects
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({behaviour: "smooth"})
        }
    }, [answers])

    useEffect(() => {
        if (dialogScrollRef.current) {
            dialogScrollRef.current.scrollIntoView({behaviour: "smooth"})
        }
    }, [dialogs])    

    // Effect for loading user
    useEffect(() => {
        let username = Auth.user.attributes.email
        console.log('Logged username: ', username)
        const userInitials = username.substring(0, 2).toUpperCase()
        console.log('Logged user initials: ', userInitials)
        setUserInitials(userInitials)
    }, [])

    // Effect for loading conversation
    useEffect(() => {
        async function loadConversationDetails(){
            let result = await fetchConversationDetails(conversationId)

            // set conversation state
            if(result) {
                let conversation = result.data.getConversation
                setConversation(conversation)
                console.log(conversation)

                // Get utterances
                const utterances = conversation.utterances.items

                // Set dialogs state
                let dialogsArray = initialDialogs.concat(utterances)
                setDialogs(dialogsArray)

                // Set answers state
                let answersArray = []
                utterances.forEach((utterance) => {
                    if (utterance.author !== "AWS") return
                    if (utterance.data === "{}") return
                    const responseData = JSON.parse(utterance.data)
                    console.log(responseData)
                    answersArray.push({
                        intent: responseData.sessionState.intent.name, 
                        description: responseData.messages[0].content, 
                        data: responseData.sessionState
                    })
                })
                console.log('Cards will be built from the answers below')
                console.log(answersArray)

                // Set the answers state
                answersArray.unshift(initialAnswers[0])
                setAnswers(answersArray)

            }
            
        }
        loadConversationDetails()
    }, [])


    // Define function for creating dialog item
    const createDialogEntry = async(author, text, data, conversationId) => {

        // Create dialog object
        const newDialog = {
            author: author,
            text: text
        }

        // Add dialog object to dialogs state
        setDialogs(prevDialogs => [...prevDialogs, newDialog])
        console.log('New dialog was created and added to state:' + newDialog)

        // API call to persist in DB
        let conversation = {
            author: author,
            text: text,
            data: data,
            conversationId
        }
        let result = await API.graphql(graphqlOperation(createUtterance, {input: conversation}))
        console.log("Create utterance in this conversation")
        console.log(result)

    }

    // Define functions that update state
    const sendQuery = async () => {

        // Create dialog entry
        await createDialogEntry(userInitials, newQuery, {}, conversationId)

        // Reset the query field and show loader
        setNewQuery("")
        setLoading(true)

        // Send query to assistant
        const response = await Interactions.send("AWS-Configurator", newQuery)

        // // Get IP address
        // const res = await axios.get('https://geolocation-db.com/json/')
        // console.log(res.data);


        // Remove load and log response
        setLoading(false)
        console.log(response)
        
        // Check if messages exist
        if(response.messages) {         

            // Add answer to answer state if dialog is closed 
            if (response.sessionState.dialogAction.type === "Close") {
                const newAnswer = {intent: response.sessionState.intent.name, description: response.messages[0].content, data: response.sessionState}
                setAnswers(prevAnswers => [...prevAnswers, newAnswer])
                console.log(answers)
                await createDialogEntry('AWS', response.messages[0].content, JSON.stringify({messages: response.messages, sessionState: response.sessionState}), conversationId)
            }else{
                await createDialogEntry('AWS', response.messages[0].content, {}, conversationId)
            }
        }
        // Fall back intent
        else{
            const fallbackText = "Sorry, can you say that again?"
            await createDialogEntry('AWS', fallbackText, {}, conversationId)
        }

    }    

    // Send query if users clicks on the ENTER key
    const handleKeyPress = (e) => {
        // console.log('--->A key was pressed', e.keyCode)
        if(e.keyCode === 13){
           console.log('value', e.target.value);
           sendQuery()
        }
     }    

    // Send button component
    const SendButton = () => (
        <IconButton color="primary" onClick={sendQuery}>
            <SendIcon />
        </IconButton>
    )    

    // Initialize query text with previous query
    const reusePreviousDialog = (e) => {
        console.log(e)
        setNewQuery(e.target.textContent)
    }

    return (
        <Box sx={{display: "flex"}}>

            {/* DRAWER SECTION - DIALOG SECTION */}
            <Drawer
                variant="permanent"
                sx={{
                    width: chatWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: {
                        width: chatWidth,
                        boxSizing: "border-box"
                    }
                }}
            >
                <Toolbar/>
                <Box sx={{overflow: "auto", height:'100vh'}}>
                    <List sx={{height: 'calc(100% - 73px)', overflowY: 'scroll'}}>
                        {dialogs.map((dialog, index) => (
                            <span key={index}>
                                {dialog.author === "AWS" ? <AwsDialogItem text={dialog.text}/> : <MeDialogItem text={dialog.text} reusePreviousDialog={reusePreviousDialog} userInitials={userInitials}/>}
                                <Divider /> 
                            </span>
                        ))}
                        <ListItem ref={dialogScrollRef}></ListItem>
                   </List>  
                    <Divider></Divider>  
                    <MyTextField newQuery={newQuery} setNewQuery={setNewQuery} handleKeyPress={handleKeyPress} SendButton={SendButton}></MyTextField>
                </Box>
            </Drawer>

            {/* MAIN CONTENT SECTION FOR SHOWING ASSISTANT RESPONSE DATA */}
            <Box  sx={{flexGrow: 1, p:3, mt:7}}>
                {/* <h2>
                    {conversation.name}
                </h2>                 */}
                <Grid container direction="column" spacing={2}> 
                    {answers.map((answer, index) => (
                        <>
                            <ResponseCard key={index} intent={answer.intent} cardDescription={answer.description} data={answer.data}/>
                        </>
                    ))}
                    <Grid item xs={12}>
                        {loading && <LinearProgress />}
                    </Grid>
                    <span ref={scrollRef}></span>
                   
                </Grid>         

            </Box>
        </Box>
    )
}

export default Interact

