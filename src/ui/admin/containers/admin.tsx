import { useEffect, useMemo, useContext } from 'react';
import { observer } from 'mobx-react';
import Login from './login';
import { UserStoreContext } from '../../../stores/userStore';
import { Grid, Paper, Button, Theme, Hidden } from '@material-ui/core';
import { Route, Routes, useNavigate } from 'react-router';
import { makeStyles } from '@material-ui/styles';
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
import { useLocation } from 'react-router';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(1),
  },
  leftNav: {
    height: '90vh',
    padding: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  collapsedNav: {
    padding: theme.spacing(1),
  },
  leftButton: {
    justifyContent: 'start',
  },
  main: {
    height: '90vh',
    overflowY: 'scroll',
    padding: theme.spacing(2),
  },
}));

const Admin = () => {

  useEffect(() => {
    document.title = 'SCOTUS App | Admin';
  }, []);

  const userStore = useContext(UserStoreContext);

  const isAdmin = userStore.isAdmin;
  const navigate = useNavigate();
  const location = useLocation();
  const classes = useStyles();

  const adminRoutes = useMemo(() => [{
      route: 'justice',
      display: 'Justice',
      click: () => navigate(`/admin/justice`),
    },
    {
      route: 'court',
      display: 'Court',
      click: () => navigate(`/admin/court`),
    },
    {
      route: 'docket',
      display: 'Docket',
      click: () => navigate(`/admin/docket`),
    },
    {
      route: 'case',
      display: 'Case',
      click: () => navigate(`/admin/case`),
    },
    {
      route: 'term',
      display: 'Term',
      click: () => navigate(`/admin/term`),
    },
  ], [navigate]);

  return (
    <>
    { !isAdmin ?
      <Login />
      :
      <Grid className={classes.root} container direction="row">
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
            <Routes>
              <Route path="justice/create" element={<CreateJusticePage />} />
              <Route path="justice" element={<JusticePage />} />
              <Route path="court/create" element={<CreateCourtPage />} />
              <Route path="court" element={<CourtPage />} />
              <Route path="docket/create" element={<CreateDocketPage />} />
              <Route path="docket/edit/:id" element={<EditDocketPage />} />
              <Route path="docket" element={<DocketPage />} />
              <Route path="case/create" element={<CreateCasePage />} />
              <Route path="case/edit/:id" element={<EditCasePage />} />
              <Route path="case" element={<CasePage />} />
              <Route path="term/create" element={<CreateTermPage />} />
              <Route path="term/edit/:id" element={<EditTermPage />} />
              <Route path="term" element={<TermAdminPage />} />
            </Routes>
          </Paper>
        </Grid>
      </Grid>
    }
    </>
  );
};

export default observer(Admin);
