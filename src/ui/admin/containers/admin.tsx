import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import Login from './login';
import { UserStore } from '../../../stores/userStore';
import { Grid, Paper, Button, Theme } from '@material-ui/core';
import { Switch, Route } from 'react-router';
import { History } from 'history';
import { withStyles } from '@material-ui/styles';
import JusticePage from './justice';
import CreateJusticePage from './createJustice';
import CourtPage from './court';
import CreateCourtPage from './createCourt';

interface Props {
  userStore?: UserStore;
  routing?: History;
  classes?: {[id: string]: string};
}

const styles = (theme: Theme) => ({
  root: {
    'margin-top': `${theme.spacing(1)}px`,
    overflow: 'none',
  },
  leftNav: {
    height: '90vh',
    padding: `${theme.spacing(1)}px`,
  },
  leftButton: {
    justifyContent: 'start',
  },
  main: {
    height: '90vh',
    'overflow-y': 'scroll',
    padding: `${theme.spacing(2)}px`,
  },
});

@inject('userStore', 'routing')
@observer
class Admin extends Component<Props> {
  render() {
    const isAdmin = this.props.userStore?.isAdmin;
    const { push, location } = this.props.routing!;
    const classes = this.props.classes!;

    const adminRoutes = [{
      route: 'justice',
      display: 'Justice',
      click: () => push(`/admin/justice`),
    },
    {
      route: 'court',
      display: 'Court',
      click: () => push(`/admin/court`),
    },
    {
      route: 'docket',
      display: 'Docket',
      click: () => push(`/admin/docket`),
    },
    {
      route: 'case',
      display: 'Case',
      click: () => push(`/admin/case`),
    }];

    return (
      <>
      { !isAdmin ?
        <Login />
        :
        <Grid className={classes.root} container direction="row" spacing={1}>
          <Grid item xs={12} sm={3} md={2}>
            <Paper className={classes.leftNav} elevation={1}>
              {adminRoutes.map(({route, display, click}) => {
                return (
                  <Button fullWidth className={classes.leftButton} key={route} variant='text'
                    color={location.pathname.indexOf(`admin/${route}`) >= 0 ? 'secondary' : 'primary'} 
                    onClick={click}>{display}</Button>
                );
              })}
            </Paper>
          </Grid>
          <Grid item xs={12} sm={9} md={10}>
            <Paper className={classes.main} elevation={0}>
              <Switch>
                <Route path="/admin/justice/create" component={CreateJusticePage} />
                <Route path="/admin/justice" component={JusticePage} />
                <Route path="/admin/court/create" component={CreateCourtPage} />
                <Route path="/admin/court" component={CourtPage} />
                {
                  /*
                  use render to pass props to route components
                  <Route
                    path='/dashboard'
                    render={(props) => <Dashboard {...props} isAuthed={true} />}
                  />
                  */
                }
              </Switch>
            </Paper>
          </Grid>
        </Grid>
      }
      </>
    );
  }
}

export default withStyles(styles)(Admin);
