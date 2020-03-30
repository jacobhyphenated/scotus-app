import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import Login from './login';
import { UserStore } from '../../../stores/userStore';
import { Grid, Paper, Button, Theme } from '@material-ui/core';
import { Switch, Route } from 'react-router';
import { History } from 'history';
import { withStyles } from '@material-ui/styles';
import JusticePage from './justice';

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
    },
    {
      route: 'court',
      display: 'Court',
    },
    {
      route: 'docket',
      display: 'Docket',
    },
    {
      route: 'case',
      display: 'Case',
    }];

    return (
      <>
      { !isAdmin ?
        <Login />
        :
        <Grid className={classes.root} container direction="row" spacing={1}>
          <Grid item xs={12} sm={3} md={2}>
            <Paper className={classes.leftNav} elevation={1}>
              {adminRoutes.map(({route, display}) => {
                return (
                  <Button fullWidth className={classes.leftButton} key={route} variant='text'
                    color={location.pathname.indexOf(`admin/${route}`) >= 0 ? 'secondary' : 'primary'} 
                    onClick={() => push(`/admin/${route}`)}>{display}</Button>
                );
              })}
            </Paper>
          </Grid>
          <Grid item xs={12} sm={9} md={10}>
            {location.pathname}
            <Switch>
              <Route path="/admin/justice" component={JusticePage} />
            </Switch>
          </Grid>
        </Grid>
      }
      </>
    )
  }
}

export default withStyles(styles)(Admin);
