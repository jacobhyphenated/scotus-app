import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Grid, Typography, Hidden } from '@material-ui/core';
import { Case } from '../../../stores/caseStore';
import { CasePreviewCard } from './';

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
}

const CaseGridRow = (props: Props) => {
  const { cases, title, onCaseClick } = props;
  const classes = useStyles();
  return (
    <>
      {cases.length > 0 &&
        <>
          <Typography variant="h5" color="textSecondary">{title}</Typography>
          <Grid container direction="row" justifyContent="flex-start" spacing={2} className={classes.row}>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <CasePreviewCard case={cases[0]} onClick={onCaseClick} />
            </Grid>
            { cases.length > 1 && 
              <Hidden xsDown>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <CasePreviewCard case={cases[1]} onClick={onCaseClick} />
                </Grid>
              </Hidden>
            }
            { cases.length > 2 && 
              <Hidden smDown>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <CasePreviewCard case={cases[2]} onClick={onCaseClick} />
                </Grid>
              </Hidden>
            }
            { cases.length > 3 && 
              <Hidden mdDown>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <CasePreviewCard case={cases[3]} onClick={onCaseClick} />
                </Grid>
              </Hidden>
            }
          </Grid>
        </>
      }
    </>
  );
};

export default CaseGridRow;
