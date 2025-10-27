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
        <Grid container justifyContent="flex-start" spacing={1} >
          <Grid><Typography variant="h5" color="textSecondary">{title}</Typography></Grid>
          {props.link && 
            <Grid><Button component={Link} to={props.link.to} color="secondary" variant="text">{props.link.text}</Button></Grid>
          }
        </Grid>
        <Grid container justifyContent="flex-start" spacing={2} className={classes.row}>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <CasePreviewCard case={cases[0]} onClick={onCaseClick} />
          </Grid>
          { cases.length > 1 && 
            <Grid sx={{ display: { xs: 'none', sm: 'block' } }} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <CasePreviewCard case={cases[1]} onClick={onCaseClick} />
            </Grid>
          }
          { cases.length > 2 && 
            <Grid sx={{ display: { xs: 'none', md: 'block' } }} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <CasePreviewCard case={cases[2]} onClick={onCaseClick} />
            </Grid>
          }
          { cases.length > 3 && 
            <Grid sx={{ display: { xs: 'none', lg: 'block' } }} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <CasePreviewCard case={cases[3]} onClick={onCaseClick} />
            </Grid>
          }
        </Grid>
      </>
    }
  </>;
};

export default CaseGridRow;
