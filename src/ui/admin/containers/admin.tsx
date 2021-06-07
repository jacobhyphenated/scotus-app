import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import Login from './login';
import { UserStore } from '../../../stores/userStore';
import { Grid, Paper, Button, Theme, Hidden } from '@material-ui/core';
import { Switch, Route } from 'react-router';
import { History } from 'history';
import { createStyles, WithStyles, withStyles } from '@material-ui/styles';
import JusticePage from './justice';
import CreateJusticePage from './createJustice';
import CourtPage from './court';
import CreateCourtPage from './createCourt';
import DocketPage from './docket';
import CreateDocketPage from './createDocket';
import EditDocketPage from './editDocket';
import CasePage from './case';
import CreateTermPage from './createTerm';
import CreateCasePage from './createCase';
import EditCasePage from './editCase';
import TermAdminPage from './term';
import EditTermPage from './editTerm';

interface Props extends WithStyles<typeof styles> {
  userStore?: UserStore;
  routing?: History;
}

const styles = (theme: Theme) => createStyles({
  root: {
    marginTop: `${theme.spacing(1)}px`,
    overflow: 'none',
  },
  leftNav: {
    height: '90vh',
    padding: `${theme.spacing(1)}px`,
  },
  collapsedNav: {
    padding: `${theme.spacing(1)}px`,
  },
  leftButton: {
    justifyContent: 'start',
  },
  main: {
    height: '90vh',
    overflowY: 'scroll',
    padding: `${theme.spacing(2)}px`,
  },
});

@inject('userStore', 'routing')
@observer
class Admin extends Component<Props> {

  componentDidMount() {
    document.title = 'SCOTUS App | Admin';
  }

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
    },
    {
      route: 'term',
      display: 'Term',
      click: () => push(`/admin/term`),
    }];

    return (
      <>
      { !isAdmin ?
        <Login />
        :
        <Grid className={classes.root} container direction="row" spacing={1}>
          <Grid item xs={12} sm={3} md={2}>
            <Hidden xsDown>
              <Paper className={classes.leftNav} elevation={1}>
                {adminRoutes.map(({route, display, click}) => {
                  return (
                    <Button fullWidth className={classes.leftButton} key={route} variant='text'
                      color={location.pathname.includes(`admin/${route}`) ? 'secondary' : 'primary'} 
                      onClick={click}>{display}</Button>
                  );
                })}
              </Paper>
            </Hidden>
            <Hidden smUp>
              <Paper className={classes.collapsedNav} elevation={1}>
                {adminRoutes.map(({route, display, click}) => {
                  return (
                    <Button className={classes.leftButton} key={route} variant='text'
                      color={location.pathname.includes(`admin/${route}`) ? 'secondary' : 'primary'} 
                      onClick={click}>{display}</Button>
                  );
                })}
              </Paper>
            </Hidden>
          </Grid>
          <Grid item xs={12} sm={9} md={10}>
            <Paper className={classes.main} elevation={0}>
              <Switch>
                <Route path="/admin/justice/create" component={CreateJusticePage} />
                <Route path="/admin/justice" component={JusticePage} />
                <Route path="/admin/court/create" component={CreateCourtPage} />
                <Route path="/admin/court" component={CourtPage} />
                <Route path="/admin/docket/create" component={CreateDocketPage} />
                <Route path="/admin/docket/edit/:id" component={EditDocketPage} />
                <Route path="/admin/docket" component={DocketPage} />
                <Route path="/admin/case/term/create" component={CreateTermPage} />
                <Route path="/admin/case/create" component={CreateCasePage} />
                <Route path="/admin/case/edit/:id" component={EditCasePage} />
                <Route path="/admin/case" component={CasePage} />
                <Route path="/admin/term/create" component={CreateTermPage} />
                <Route path="/admin/term/edit/:id" component={EditTermPage} />
                <Route path="/admin/term" component={TermAdminPage} />
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
