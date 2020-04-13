import React, { useState } from 'react';
import { Paper, makeStyles, Theme, Grid, Typography, IconButton, Button } from '@material-ui/core';
import ArrowRight from '@material-ui/icons/ArrowRight';
import ArrowDown from '@material-ui/icons/ArrowDropDown';
import { BareDocket, FullDocket } from '../../../stores/docketStore';
import { DateTimeFormatter } from '@js-joda/core';

const useStyles = makeStyles( (theme: Theme) => ({
  docketCard: {
    margin: `${theme.spacing(1)}px`,
    padding: `${theme.spacing(1)}px`,
    [theme.breakpoints.down('sm')]: {
      maxWidth: 300,
    },
    [theme.breakpoints.up('md')]: {
      maxWidth: 350,
    },
    [theme.breakpoints.up('xl')]: {
      maxWidth: 450,
    },
  },
}));

interface Props {
  docket: BareDocket;
  onEditClick?: (docket: BareDocket) => void;
  getFullDocket?: () => Promise<FullDocket>;
  onCaseClick?: (caseId: number) => void;
}

const DocketCard = (props: Props) => {

  const [expanded, setExpanded] = useState(false);
  const [fullDocket, setFullDocket] = useState<FullDocket | null>(null);
  const [loading, setLoading] = useState(false);

  const toggleExpanded = async () => {
    setExpanded(!expanded);
    if (!fullDocket && !loading && !!props.getFullDocket) {
      setLoading(true);
      setFullDocket(await props.getFullDocket());
      setLoading(false);
    }
  };

  const classes = useStyles();
  const formatter = DateTimeFormatter.ofPattern('MM/dd/yyyy');

  const editClick = props.onEditClick ? () => { props.onEditClick!(props.docket) } : null;
  const caseClick = (props.onCaseClick && !!props.docket.caseId) ? () => { props.onCaseClick!(props.docket.caseId!) } : null;

  return (
    <Paper className={classes.docketCard} variant="elevation">
      <Grid container direction="row" justify="space-between" alignItems="center">
        <Typography color="textSecondary" variant="subtitle2">
          {props.docket.docketNumber}
        </Typography>
        <IconButton onClick={toggleExpanded}>
          {expanded ? <ArrowDown /> : <ArrowRight />}
        </IconButton>
      </Grid>
      <Typography variant="h6">{props.docket.title}</Typography>
      {expanded &&
        <>
          <Grid container direction="row" justify="space-between">
            <Typography color="textSecondary">
              {fullDocket ? fullDocket.lowerCourt.shortName : ''}
            </Typography>
            <Typography color="textSecondary">
              {props.docket.status}
            </Typography>
          </Grid>
          <Typography paragraph>{props.docket.lowerCourtRuling}</Typography>
          {!!fullDocket?.case && 
            <Grid container direction="row">
              {!!fullDocket?.case?.decisionDate ?
                <Typography color="textSecondary">
                  Result: {fullDocket?.case?.result} ({fullDocket.case.decisionDate.format(formatter)})
                  - {fullDocket.lowerCourtOverruled ? 'Reversed' : 'Affirmed'}
                </Typography>
                : !!fullDocket?.case?.argumentDate ?
                <Typography color="textSecondary">Argument scheduled for {fullDocket.case.argumentDate.format(formatter)}</Typography>
                :
                <Typography color="textSecondary">{fullDocket.case.status}</Typography>
              }
            </Grid>
          }
          <Grid container direction="row" justify="flex-end" spacing={1}>
            {editClick &&
              <Button onClick={editClick} color="primary">Edit</Button>
            }
            {caseClick &&
              <Button onClick={caseClick} color="secondary">View Case</Button>
            }
          </Grid>
        </>
      }
    </Paper>
  );
};

export default DocketCard;