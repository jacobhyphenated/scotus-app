import React, { Component } from 'react';
import './App.css';
import { Route, Switch, Redirect } from 'react-router';
import Home from './ui/home/containers/home';
import Admin from './ui/admin/containers/admin';
import CasePage from './ui/case/containers/case';
import AllTermCasesPage from './ui/home/containers/allTermCases';
import HomeIcon from '@material-ui/icons/Home';
import { inject } from 'mobx-react';
import { History } from 'history';
import { Button, Grid, Paper, IconButton } from '@material-ui/core';

interface Props {
  routing?: History
}
@inject('routing')
export default class App extends Component<Props> {

  navHome = () => {
    this.props.routing!.push('/');
  }

  navAdmin = () => {
    this.props.routing!.push('/admin');
  }

  render() {
    return (
      <div>
        <Paper elevation={2}>
          <Grid
            container
            direction="row"
            justify="space-between"
            alignItems="center"
          >
            <IconButton onClick={this.navHome}>
              <HomeIcon color="action" />
            </IconButton>
            
            SCOTUS App
            <Button onClick={this.navAdmin} color="primary" variant="text">admin</Button>
          </Grid>
        </Paper>
        <Switch>
          <Route exact path="/" component={Home} />
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
