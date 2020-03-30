import React, { Component } from 'react';
import './App.css';
import { Route, Switch, Redirect } from 'react-router';
import Home from './ui/home/containers/home'
import Admin from './ui/admin/containers/admin'
import HomeIcon from '@material-ui/icons/Home'
import { inject } from 'mobx-react';
import { History } from 'history';
import { Button, Grid, Paper, IconButton } from '@material-ui/core';

interface Props {
  routing?: History
}
@inject('routing')
export default class App extends Component<Props> {

  render() {
    const { push } = this.props.routing!;
    return (
      <div>
          <Paper elevation={2}>
            <Grid
              container
              direction="row"
              justify="space-between"
              alignItems="center"
            >
              <IconButton onClick={() => push('/')}>
                <HomeIcon color="action" />
              </IconButton>
              
              SCOTUS App
              <Button onClick={() => push('/admin')} color="primary" variant="text">admin</Button>
            </Grid>
          </Paper>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route path="/admin" component={Admin} />
          <Redirect to="/" />
        </Switch>
      </div>
    );
  }
}
