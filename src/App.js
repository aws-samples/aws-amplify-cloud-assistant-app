
import './App.css';

// React router components - test 3
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

// Import ROBOTO
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

// Import key components
import Interact from './components/Interact'
import Conversations from './components/Conversations';
import About from './components/About';
import Header from './components/Header';

// Bot related imports
import { Interactions } from 'aws-amplify';
import AWSLex2Provider from '@thefat32/aws-amplify-lex-provider-v2';

// Amplify components section
import Amplify from 'aws-amplify';
import awsmobile from './aws-exports';
import {withAuthenticator} from '@aws-amplify/ui-react'


// Start of body
Interactions.addPluggable(new AWSLex2Provider())

Amplify.configure({
  ...awsmobile,
  bots: {
    "AWS-Configurator": {
      botId: "FJZEEWWPBU",
      botAliasId: "G0UH3YLBPS",
      localeId: "en_US",
      region: "us-east-1",
      providerName: "AWSLex2Provider"
    }
  }
})

function App() {
  return (
    <Router>
      {/* Header Component */}
      <Header/>
      <Switch>
        <Route exact path='/'><Conversations /></Route>
        <Route exact path='/conversations'><Conversations /></Route>
        <Route exact path='/interact/:conversationId'><Interact /></Route>
        <Route exact path='/about'><About /></Route>
      </Switch>
    </Router>
  );
}

export default withAuthenticator(App);
// export default App;
