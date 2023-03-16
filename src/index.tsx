import { createRoot } from 'react-dom/client';
import { configure as mobxConfigure } from 'mobx';
import './index.css';
import { App } from './App';
import * as serviceWorker from './serviceWorker';
import {
  ThemeProvider,
  Theme,
  StyledEngineProvider,
  createTheme,
  CssBaseline,
} from '@mui/material';
import { UserStore } from './stores/userStore';
import { JusticeStore, JusticeStoreContext } from './stores/justiceStore';
import { NetworkService } from './services/networkService';
import { CourtStore, CourtStoreContext } from './stores/courtStore';
import { DocketStore, DocketStoreContext } from './stores/docketStore';
import { CaseStore, CaseStoreContext } from './stores/caseStore';
import { OpinionStore, OpinionStoreContext } from './stores/opinionStore';
import { UserStoreContext } from './stores/userStore';
import { BrowserRouter } from 'react-router-dom';


declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}


mobxConfigure({
  enforceActions: "observed", // don't allow state modifications outside actions
  computedRequiresReaction: true,
  reactionRequiresObservable: true,
});
const networkService = new NetworkService(process.env.REACT_APP_API_SERVER!);
const userStore = new UserStore(networkService);
const justiceStore = new JusticeStore(networkService);
const courtStore = new CourtStore(networkService);
const docketStore = new DocketStore(networkService);
const caseStore = new CaseStore(networkService, docketStore);
const opinionStore = new OpinionStore(networkService);

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

const root = createRoot(document.getElementById('root')!);

root.render(
  <UserStoreContext.Provider value={userStore}>
    <JusticeStoreContext.Provider value={justiceStore}>
      <CourtStoreContext.Provider value={courtStore}>
        <DocketStoreContext.Provider value={docketStore}>
          <OpinionStoreContext.Provider value={opinionStore}>
            <CaseStoreContext.Provider value={caseStore}>
              <BrowserRouter>
                <StyledEngineProvider injectFirst>
                  <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <App />
                  </ThemeProvider>
                </StyledEngineProvider>
              </BrowserRouter>
            </CaseStoreContext.Provider>
          </OpinionStoreContext.Provider>
        </DocketStoreContext.Provider>
      </CourtStoreContext.Provider>
    </JusticeStoreContext.Provider>
  </UserStoreContext.Provider>,
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
