import { Component } from 'react';
import './App.css';
import { Route, Switch, Redirect } from 'react-router';
import { Link } from 'react-router-dom';
import Home from './ui/home/containers/home';
import Admin from './ui/admin/containers/admin';
import CasePage from './ui/case/containers/case';
import AllTermCasesPage from './ui/home/containers/allTermCases';
import TermJusticeSummary from './ui/home/containers/termJusticeSummary';
import HomeIcon from '@material-ui/icons/Home';
import { inject } from 'mobx-react';
import { History } from 'history';
import { Button, Grid, Paper, IconButton } from '@material-ui/core';

interface Props {
  routing?: History
}
@inject('routing')
export default class App extends Component<Props> {

  render() {
    return (
      <div>
        <Paper elevation={2}>
          <Grid
            container
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Link to="/">
              <IconButton>
                <HomeIcon color="action" />
              </IconButton>
            </Link>
            SCOTUS App
            <Button component={Link} to="/admin" color="primary" variant="text">admin</Button>
          </Grid>
        </Paper>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route path="/term/:termId/justice/:justiceId" component={TermJusticeSummary} />
          <Route path="/term/:id/all" component={AllTermCasesPage} />
          <Route path="/term/:id" component={Home} />
          <Route path="/admin" component={Admin} />
          <Route path="/case/:id" component={CasePage} />
          <Redirect to="/" />
        </Switch>
      </div>
    );
  }
}
