import { useCallback, useState } from 'react';
import { Paper, Theme, Grid, Typography, IconButton, Button, Stack } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import ArrowRight from '@mui/icons-material/ArrowRight';
import ArrowDown from '@mui/icons-material/ArrowDropDown';
import { DateTimeFormatter } from '@js-joda/core';
import { Case } from '../../../stores/caseStore';

const useStyles = makeStyles( (theme: Theme) => ({
  caseCard: {
    margin: theme.spacing(1),
    padding: theme.spacing(1),
  },
}));

interface Props {
  case: Case
  onEditCase?: (scotusCase: Case) => void;
}

const CaseCard = (props: Props) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = useCallback(() => setExpanded(!expanded), [expanded]);

  const editButton = useCallback(() => {
    props.onEditCase!(props.case);
  }, [props.onEditCase, props.case]);

  const classes = useStyles();
  const formatter = DateTimeFormatter.ofPattern('MM/dd/yyyy');

  return (
    <Paper className={classes.caseCard}>
      <Grid container justifyContent="space-between" alignItems="center">
        <Grid>
          <Typography color="textSecondary" variant="subtitle2">
            {props.case.status}{props.case.result && `: ${props.case.result}`}
          </Typography>
        </Grid>
        <Grid>
          <IconButton onClick={toggleExpanded} size="large">
            {expanded ? <ArrowDown /> : <ArrowRight />}
          </IconButton>
        </Grid>
      </Grid>
      <Typography variant="h6">{props.case.case}</Typography>
      {expanded &&
        <Stack>
          <Typography color="textSecondary">
            {props.case.decisionDate ? `Decision date: ${props.case.decisionDate.format(formatter)}`
            :
              props.case.argumentDate && `Scheduled: ${props.case.argumentDate.format(formatter)}`
            }
          </Typography>
          <Typography paragraph>
            {props.case.decisionSummary ? props.case.decisionSummary : props.case.shortSummary}
          </Typography>
          {props.onEditCase &&
            <Grid container justifyContent="flex-end">
              <Button color="primary" onClick={editButton}>Edit</Button>
            </Grid>
          }
        </Stack>
      }
    </Paper>
  );

};

export default CaseCard;