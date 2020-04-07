import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Typography, Paper, withStyles, Theme, Grid, Fab } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { History } from 'history';
import { CourtStore } from '../../../stores/courtStore';

const styleDecorator = withStyles((theme: Theme) => ({
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
  classes: {[id: string]: string};
}

@inject('routing', 'courtStore')
@observer
class CourtPage extends Component<Props> {

  createCourt = () => {
    this.props.routing.push('/admin/court/create');
  };
  
  render() {
    const courts = this.props.courtStore.allCourts;
    return (
      <>
        <Typography variant="h5">Appeals Courts:</Typography>
        <Grid container>
          {courts.map(court => (
            <Grid item key={court.id} xs={12} md={6} lg={4} xl={3}>
              <Paper className={this.props.classes.courtCard} variant="elevation">
                <Typography variant="subtitle2" color="textSecondary">{court.shortName}</Typography>
                <Typography>{court.name}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
        <Fab className={this.props.classes.fab} onClick={this.createCourt} color="primary" aria-label="add">
          <AddIcon />
        </Fab>

      </>
    );
  }
}

export default styleDecorator(CourtPage);