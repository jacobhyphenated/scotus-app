import { makeStyles } from '@mui/styles';
import { Theme, Grid, Typography, Button } from '@mui/material';
import { Case } from '../../../stores/caseStore';
import { CasePreviewCard } from './';
import { Link } from 'react-router-dom';

const useStyles = makeStyles( (theme: Theme) => ({
  row: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(3),
  },
}));

interface Props {
  cases: Case[];
  onCaseClick?: (scotusCase: Case) => void;
  title: string;
  link?: {
    text: string,
    to: string;
  };
}

const CaseGridRow = (props: Props) => {
  const { cases, title, onCaseClick } = props;
  const classes = useStyles();
  return <>
    {cases.length > 0 &&
      <>
        <Grid container direction="row" justifyContent="flex-start" spacing={1} >
          <Grid item><Typography variant="h5" color="textSecondary">{title}</Typography></Grid>
          {props.link && 
            <Grid item><Button component={Link} to={props.link.to} color="secondary" variant="text">{props.link.text}</Button></Grid>
          }
        </Grid>
        <Grid container direction="row" justifyContent="flex-start" spacing={2} className={classes.row}>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <CasePreviewCard case={cases[0]} onClick={onCaseClick} />
          </Grid>
          { cases.length > 1 && 
            <Grid item sx={{ display: { xs: 'none', sm: 'block' } }} xs={12} sm={6} md={4} lg={3}>
              <CasePreviewCard case={cases[1]} onClick={onCaseClick} />
            </Grid>
          }
          { cases.length > 2 && 
            <Grid item sx={{ display: { xs: 'none', md: 'block' } }} xs={12} sm={6} md={4} lg={3}>
              <CasePreviewCard case={cases[2]} onClick={onCaseClick} />
            </Grid>
          }
          { cases.length > 3 && 
            <Grid item sx={{ display: { xs: 'none', lg: 'block' } }} xs={12} sm={6} md={4} lg={3}>
              <CasePreviewCard case={cases[3]} onClick={onCaseClick} />
            </Grid>
          }
        </Grid>
      </>
    }
  </>;
};

export default CaseGridRow;
