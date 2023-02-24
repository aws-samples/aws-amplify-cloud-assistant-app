

// React imports
import { useHistory } from 'react-router';

// Material UI components
import { Button, IconButton } from '@mui/material';
import { AppBar, Box, Toolbar, Typography} from '@mui/material';
import { Link } from 'react-router-dom';
import { Menu as MenuIcon } from '@mui/icons-material';

// Amplify imports
import Auth from '@aws-amplify/auth';
import { Hub } from '@aws-amplify/core';


const Header = () => {

    let history = useHistory()
    const signout = async () => {
        try {
            await Auth.signOut();
            Hub.dispatch('UI Auth', {   // channel must be 'UI Auth'
                event: 'AuthStateChange',    // event must be 'AuthStateChange'
                message: 'signedout'    // message must be 'signedout'
            });
        } catch (error) {
            console.log('error signing out: ', error);
        }
    }

    return (
        <Box sx={{flexGrow: 1}}>
            <AppBar position="fixed" sx={{zIndex: (theme) => theme.zIndex.drawer + 1}}>
                <Toolbar>
                    <IconButton size="large" edge="start" color="inherit" sx={{ mr: 2 }}>
                        <MenuIcon></MenuIcon>
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>Cloud Assistant</Typography>
                    <Button component={Link} to="/conversations" color="inherit">Conversations</Button>
                    {/* <Button component={Link} to="/interact" color="inherit">Interact</Button> */}
                    <Button component={Link} to="/about" color="inherit">About</Button>
                    <Button color="inherit" onClick={signout} >Sign Out</Button>
 
                </Toolbar>
            </AppBar>

        </Box>
    )
}

export default Header
