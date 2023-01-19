import { useCallback, useEffect } from 'react';
import { inject, observer } from 'mobx-react';
import { Typography, Paper, Theme, Grid, Fab, makeStyles } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { History } from 'history';
import { CourtStore } from '../../../stores/courtStore';

const useStyles = makeStyles((theme: Theme) => ({
  courtCard: {
    margin: `${theme.spacing(1)}px`,
    padding: `${theme.spacing(1)}px`,
    [theme.breakpoints.down('sm')]: {
      maxWidth: 250,
    },
    [theme.breakpoints.up('md')]: {
      maxWidth: 300,
    },
    [theme.breakpoints.up('xl')]: {
      maxWidth: 450,
    },
  },
  fab: {
    position: 'fixed',
    right: '25%',
    bottom: '10vh',
  },
}));

interface Props {
  routing: History;
  courtStore: CourtStore;
}

const CourtPage = (props: Props) => {

  useEffect(() => {
    document.title = 'SCOTUS App | Admin | Court';
  }, []);   

  const createCourt = useCallback(() => {
    props.routing.push('/admin/court/create');
  }, [props.routing]);

  const courts = props.courtStore.allCourts;
  const classes = useStyles();
  
  return (
    <>
      <Typography variant="h5">Appeals Courts:</Typography>
      <Grid container>
        {courts.map(court => (
          <Grid item key={court.id} xs={12} md={6} lg={4} xl={3}>
            <Paper className={classes.courtCard} variant="elevation">
              <Typography variant="subtitle2" color="textSecondary">{court.shortName}</Typography>
              <Typography>{court.name}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Fab className={classes.fab} onClick={createCourt} color="primary" aria-label="add">
        <AddIcon />
      </Fab>
    </>
  );
};

export default inject('routing', 'courtStore')(observer(CourtPage));