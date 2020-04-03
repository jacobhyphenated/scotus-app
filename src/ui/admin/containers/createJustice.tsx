import React, { Component } from 'react';
import { Grid, Typography, IconButton } from '@material-ui/core';
import BackIcon from '@material-ui/icons/ArrowBack'
import { inject } from 'mobx-react';
import { History } from 'history';
import { JusticeStore } from '../../../stores/justiceStore';

interface Props {
  routing: History;
  justiceStore: JusticeStore
}

interface State {

}

@inject('routing', 'justiceStore')
class CreateJusticePage extends Component<Props, State> {

  back = () => {
    this.props.routing.goBack();
  }

  render() {
    return(
      <Grid container direction="column">
        <Grid item>
          <IconButton onClick={this.back}>
            <BackIcon color="action" />
          </IconButton>
        </Grid>
        <Grid item>
          <Typography variant="h4" component="h2">Create Justice</Typography>
        </Grid>
      </Grid>
    )
  }
}

export default CreateJusticePage;