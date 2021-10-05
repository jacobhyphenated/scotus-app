import { useCallback } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Paper, Grid, Typography } from '@material-ui/core';
import { Case, CaseStatus } from '../../../stores/caseStore';
import { stripLinks } from '../../../util/linkParse';

const useStyles = makeStyles( (theme: Theme) => ({
  paper: {
    margin: `${theme.spacing(1)}px`,
    padding: `${theme.spacing(1)}px`,
    cursor: 'pointer',
  },
}));

interface Props {
  case: Case
  onClick?: (scotusCase: Case) => void;
}

const CasePreviewCard = (props: Props) => {
  const classes = useStyles();

  const click = useCallback(() => {
    props.onClick?.(props.case);
  }, [props]);

  return (
    <Paper onClick={click} className={classes.paper}>
      <Grid container direction="column">
        <Grid container direction="row" justifyContent="space-between">
          <Typography color="textSecondary" variant="subtitle2">
            {props.case.status === CaseStatus.ARGUED && !!props.case.sitting ? 
              `${props.case.status} (${props.case.sitting})`
            : props.case.status}{props.case.result && `: ${props.case.result}` }
          </Typography>
          <Typography color="textSecondary" variant="subtitle1" title="term">
            {props.case.term.name}
          </Typography>
        </Grid>
        <Typography variant="h6">
          {props.case.case}
        </Typography>
        <Typography paragraph>
          {stripLinks(props.case.decisionSummary ? props.case.decisionSummary : props.case.shortSummary)}
        </Typography>
      </Grid>
    </Paper>
  );
};

export default CasePreviewCard;