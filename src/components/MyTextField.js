import React from 'react'
import { TextField } from '@mui/material'

const MyTextField = ({newQuery, setNewQuery, handleKeyPress, SendButton}) => {
    return (
        <TextField 
            fullWidth id="outlined-basic" 
            label="Your command" variant="filled" 
            InputProps={{endAdornment: <SendButton/>}} 
            autoComplete="off" value={newQuery} 
            onChange={(e) => {setNewQuery(e.target.value)}}
            onKeyDown={handleKeyPress}></TextField> 
    )
}

export default MyTextField
