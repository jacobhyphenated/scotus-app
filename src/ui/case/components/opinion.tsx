import React, { useCallback, useState } from 'react';
import { Opinion, OpinionType, displayType } from '../../../stores/opinionStore';
import { makeStyles } from '@material-ui/styles';
import { Theme, Paper, Grid, Typography } from '@material-ui/core';

const useStyles = makeStyles( (theme: Theme) => ({
  paper: {
    margin: theme.spacing(1),
    padding: theme.spacing(2),
    cursor: 'pointer',
  },
  collapsedSummary: {
    maxHeight: 200,
    overflowY: 'hidden',
  },
  allowBreak: {
    whiteSpace: 'pre-wrap',
  },
}));

interface Props {
  opinion: Opinion;
}

const OpinionView = (props: Props) => {
  const { opinion } = props;
  const classes = useStyles();

  const [collapsed, setCollapsed] = useState(true);

  const onClick: () => void = useCallback(() => {
    setCollapsed(!collapsed);
  }, [collapsed]);

  const author = opinion.justices.find(j => j.isAuthor);
  const joinedBy = opinion.justices.filter(j => !j.isAuthor);

  return (
    <Paper className={classes.paper} onClick={onClick}>
      <Grid container direction="column" spacing={1}>
        
        <Typography variant="subtitle2" color="textSecondary">
        {opinion.opinionType !== OpinionType.PER_CURIUM ?
          author?.justiceName
        :
          'Opinion of the Court'
        }
        </Typography>
        <Typography variant="h6">
          {displayType(opinion.opinionType)}
        </Typography>
        <Typography paragraph className={`${classes.allowBreak} ${collapsed && classes.collapsedSummary}`}>
          {opinion.summary}
        </Typography>
        {joinedBy.length > 0 && opinion.opinionType !== OpinionType.PER_CURIUM &&
          <Typography color="textSecondary">
            Joined By: {joinedBy.map(j => j.justiceName).join(", ")}
          </Typography>
        } 
      </Grid>

    </Paper>
  );
};

export default OpinionView;
