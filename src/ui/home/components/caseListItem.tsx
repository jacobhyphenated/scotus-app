import React, { useCallback, useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Grid, Typography, Paper, Hidden } from '@material-ui/core';
import { Case, CaseStore } from '../../../stores/caseStore';
import { DateTimeFormatter } from '@js-joda/core';
import { OpinionType } from '../../../stores/opinionStore';
import StarRateRoundedIcon from '@material-ui/icons/StarRateRounded';

const useStyles = makeStyles( (theme: Theme) => ({
  row: {
    padding: theme.spacing(1),
    cursor: 'pointer',
    marginTop: '2px',
    marginRight: theme.spacing(1),
    maxHeight: theme.spacing(6),
    width: '100%', // without this, grid doesn't scale properly... don't know why
  },
  noWrap: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    paddingRight: theme.spacing(1),
  },
  starGrid: {
    flexGrow: 0,
    marginTop: 4,
    [theme.breakpoints.down('xs')]: {
      maxWidth: '7%',
      flexBasis: '7%',
    },
    [theme.breakpoints.up('sm')]: {
      maxWidth: '5%',
      flexBasis: '5%',
    },
    [theme.breakpoints.up('md')]: {
      maxWidth: '4%',
      flexBasis: '4%',
    },
    [theme.breakpoints.up('lg')]: {
      maxWidth: '3%',
      flexBasis: '3%',
    },
  },
  starGridText: {
    flexGrow: 0,
    [theme.breakpoints.down('xs')]: {
      maxWidth: '93%',
      flexBasis: '93%',
    },
    [theme.breakpoints.up('sm')]: {
      maxWidth: '95%',
      flexBasis: '95%',
    },
    [theme.breakpoints.up('md')]: {
      maxWidth: '96%',
      flexBasis: '96%',
    },
    [theme.breakpoints.up('lg')]: {
      maxWidth: '97%',
      flexBasis: '97%',
    },
  },
}));

interface Props {
  scotusCase: Case;
  caseStore: CaseStore;
  onCaseClick: (scotusCase: Case) => void;
}

const CaseListItem = (props: Props) => {
  const classes = useStyles();
  const { scotusCase, caseStore } = props;
  const [author, setAuthor] = useState<string | undefined>();

  useEffect(() => {
    const loadFullCase = async () => {
      try{
        const fullCase = await caseStore.getCaseById(scotusCase.id);
        const author = fullCase.opinions.find(o => o.opinionType === OpinionType.MAJORITY)
          ?.justices.find(j => j.isAuthor)
          ?.justiceName;
        setAuthor(author);
      } catch (e) {
        console.error(e);
      }
    };
    loadFullCase();
  },[scotusCase, caseStore]);

  const formatter = DateTimeFormatter.ofPattern('MM/dd/yyyy');

  const onClick = useCallback(() => {
    props.onCaseClick(props.scotusCase);
  }, [props]);

  return (
    <Paper elevation={1} className={classes.row} onClick={onClick}>
      <Grid container direction="row" alignItems='center'>
        <Grid item xs={10} sm={9} md={7}>
          <div className="MuiGrid-container">
            {scotusCase.important &&
              <div className={classes.starGrid + ' MuiGrid-item'}>
                <StarRateRoundedIcon color='primary' />
              </div>
            }
            <div className={'MuiGrid-item ' + classes.noWrap + ' ' + (scotusCase.important ? classes.starGridText : '')}>
              <Typography noWrap variant="h6" component="span" title={scotusCase.case}>{scotusCase.case}</Typography>
            </div>
          </div>
        </Grid>
        <Hidden smDown><Grid item md={2} lg={1}>
          <Typography title="Date Argued">{scotusCase.argumentDate?.format(formatter)}</Typography>
        </Grid></Hidden>
        <Hidden xsDown><Grid item sm={2} md={2} lg={1} className={classes.noWrap}>
          <Typography noWrap title={scotusCase.status}>{scotusCase.status}</Typography>
        </Grid></Hidden>
        <Hidden mdDown><Grid item lg={2}>
          <Typography title="Author">{author}</Typography>
        </Grid></Hidden>
        <Grid item xs={2} sm={1}>
          <Typography>{scotusCase.result}</Typography>
        </Grid>
      </Grid>
    </Paper>
  );

};

export default CaseListItem;
