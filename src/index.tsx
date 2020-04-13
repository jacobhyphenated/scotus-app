import React from 'react';
import ReactDOM from 'react-dom';
import { createBrowserHistory } from 'history';
import { configure } from 'mobx';
import { Provider } from 'mobx-react';
import { RouterStore, syncHistoryWithStore } from 'mobx-react-router';
import { Router } from 'react-router';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { ThemeProvider, createMuiTheme, CssBaseline } from '@material-ui/core';
import { UserStore } from './stores/userStore';
import { JusticeStore } from './stores/justiceStore';
import { NetworkService } from './services/networkService';
import { CourtStore } from './stores/courtStore';
import { DocketStore } from './stores/docketStore';

configure({ enforceActions: "observed" }); // don't allow state modifications outside actions

const browserHistory = createBrowserHistory();
const routingStore = new RouterStore();
const networkService = new NetworkService(process.env.REACT_APP_API_SERVER!);
const userStore = new UserStore(networkService);
const justiceStore = new JusticeStore(networkService);
const courtStore = new CourtStore(networkService);
const docketStore = new DocketStore(networkService);

const stores = {
  routing: routingStore,
  userStore,
  justiceStore,
  courtStore,
  docketStore,
  // ...other stores
};

const history = syncHistoryWithStore(browserHistory, routingStore);

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#607d8b',
    },
    secondary: {
      main: '#0288d1',
    },
  },
});

ReactDOM.render(
  <Provider {...stores}>
    <Router history={history}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </Router>
  </Provider>,
  document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
