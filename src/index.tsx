import ReactDOM from 'react-dom';
import { createBrowserHistory } from 'history';
import { configure as mobxConfigure } from 'mobx';
import { Provider } from 'mobx-react';
import { RouterStore, syncHistoryWithStore } from 'mobx-react-router';
import { Router } from 'react-router';
import './index.css';
import { App } from './App';
import * as serviceWorker from './serviceWorker';
import { ThemeProvider, createTheme, CssBaseline } from '@material-ui/core';
import { UserStore } from './stores/userStore';
import { JusticeStore, JusticeStoreContext } from './stores/justiceStore';
import { NetworkService } from './services/networkService';
import { CourtStore, CourtStoreContext } from './stores/courtStore';
import { DocketStore, DocketStoreContext } from './stores/docketStore';
import { CaseStore, CaseStoreContext } from './stores/caseStore';
import { OpinionStore, OpinionStoreContext } from './stores/opinionStore';
import { UserStoreContext } from './stores/userStore';

mobxConfigure({
  enforceActions: "observed", // don't allow state modifications outside actions
  computedRequiresReaction: true,
  reactionRequiresObservable: true,
}); 
const browserHistory = createBrowserHistory();
const routingStore = new RouterStore();
const networkService = new NetworkService(process.env.REACT_APP_API_SERVER!);
const userStore = new UserStore(networkService);
const justiceStore = new JusticeStore(networkService);
const courtStore = new CourtStore(networkService);
const docketStore = new DocketStore(networkService);
const caseStore = new CaseStore(networkService, docketStore);
const opinionStore = new OpinionStore(networkService);

const stores = {
  routing: routingStore,
};

const history = syncHistoryWithStore(browserHistory, routingStore);

const theme = createTheme({
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
    <UserStoreContext.Provider value={userStore}>
      <JusticeStoreContext.Provider value={justiceStore}>
        <CourtStoreContext.Provider value={courtStore}>
          <DocketStoreContext.Provider value={docketStore}>
            <OpinionStoreContext.Provider value={opinionStore}>
              <CaseStoreContext.Provider value={caseStore}>
                <Router history={history}>
                  <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <App />
                  </ThemeProvider>
                </Router>
              </CaseStoreContext.Provider>
            </OpinionStoreContext.Provider>
          </DocketStoreContext.Provider>
        </CourtStoreContext.Provider>
      </JusticeStoreContext.Provider>
    </UserStoreContext.Provider>
  </Provider>,
  document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
