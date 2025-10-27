import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { makeStyles } from '@mui/styles';
import { Theme, Grid, Typography, Paper, IconButton } from '@mui/material';
import { Case, CaseStore, FullCase } from '../../../stores/caseStore';
import { DateTimeFormatter } from '@js-joda/core';
import { OpinionType } from '../../../stores/opinionStore';
import EditIcon from '@mui/icons-material/Edit';
import StarRateRoundedIcon from '@mui/icons-material/StarRateRounded';
import { UserStoreContext } from '../../../stores/userStore';
import { observer } from 'mobx-react';

const useStyles = makeStyles( (theme: Theme) => ({
  row: {
    padding: theme.spacing(1),
    cursor: 'pointer',
    marginTop: '2px',
    marginRight: theme.spacing(1),
    maxHeight: theme.spacing(6),
    width: '100%', // without this, grid doesn't scale properly... don't know why
  },
  flex: {
    display: 'flex',
  },
  noWrap: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    paddingRight: theme.spacing(1),
  },
  starGrid: {
    flexGrow: 0,
    marginTop: 4,
    [theme.breakpoints.down('sm')]: {
      maxWidth: '6%',
      flexBasis: '6%',
    },
    [theme.breakpoints.up('sm')]: {
      maxWidth: '6%',
      flexBasis: '6%',
    },
    [theme.breakpoints.up('md')]: {
      maxWidth: '5%',
      flexBasis: '5%',
    },
    [theme.breakpoints.up('lg')]: {
      maxWidth: '4%',
      flexBasis: '4%',
    },
  },
  starGridText: {
    flexGrow: 0,
    [theme.breakpoints.down('sm')]: {
      maxWidth: '94%',
      flexBasis: '94%',
    },
    [theme.breakpoints.up('sm')]: {
      maxWidth: '94%',
      flexBasis: '94%',
    },
    [theme.breakpoints.up('md')]: {
      maxWidth: '95%',
      flexBasis: '95%',
    },
    [theme.breakpoints.up('lg')]: {
      maxWidth: '96%',
      flexBasis: '96%',
    },
  },
  editGrid: {
    flexGrow: 0,
    marginTop: -4,
    [theme.breakpoints.down('sm')]: {
      maxWidth: '40%',
      flexBasis: '40%',
    },
    [theme.breakpoints.up('sm')]: {
      maxWidth: '40%',
      flexBasis: '40%',
    },
    [theme.breakpoints.up('md')]: {
      maxWidth: '35%',
      flexBasis: '35%',
    },
    [theme.breakpoints.up('lg')]: {
      maxWidth: '30%',
      flexBasis: '30%',
    },
  },
  editGridText: {
    flexGrow: 0,
    marginTop: 4,
    [theme.breakpoints.down('sm')]: {
      maxWidth: '60%',
      flexBasis: '60%',
    },
    [theme.breakpoints.up('sm')]: {
      maxWidth: '60%',
      flexBasis: '60%',
    },
    [theme.breakpoints.up('md')]: {
      maxWidth: '65%',
      flexBasis: '65%',
    },
    [theme.breakpoints.up('lg')]: {
      maxWidth: '70%',
      flexBasis: '70%',
    },
  },
}));

interface Props {
  scotusCase: Case | FullCase;
  caseStore: CaseStore;
  onCaseClick: (scotusCase: Case) => void;
  onEditClick?: (scotusCase: Case) => void;
}

const CaseListItem = (props: Props) => {
  const classes = useStyles();
  const { scotusCase, caseStore } = props;
  const [author, setAuthor] = useState<string | undefined>();

  const userStore = useContext(UserStoreContext);

  useEffect(() => {
    const setFullCase = (fullCase: FullCase) => {
      const author = fullCase.opinions.find(o => o.opinionType === OpinionType.MAJORITY)
        ?.justices.find(j => j.isAuthor)
        ?.justiceName;
      setAuthor(author);
      if (!author && fullCase.opinions.some(o => o.opinionType === OpinionType.PER_CURIUM)) {
        setAuthor('Per Curium');
      } 
    };
    const loadFullCase = async () => {
      try{
        const fullCase = await caseStore.getCaseById(scotusCase.id);
        setFullCase(fullCase);
      } catch (e) {
        console.error(e);
      }
    };
    if ('opinions' in scotusCase) {
      setFullCase(scotusCase);
    } else {
      loadFullCase();
    }
  },[scotusCase, caseStore]);

  const formatter = useMemo(() => DateTimeFormatter.ofPattern('MM/dd/yyyy'), []);

  const onClick = useCallback(() => {
    props.onCaseClick(props.scotusCase);
  }, [props]);

  const onEditClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    props.onEditClick?.(props.scotusCase);
  }, [props]);

  const isAdmin = userStore.isAdmin;

  return (
    <Paper elevation={1} className={classes.row} onClick={onClick}>
      <Grid container alignItems='center'>
        <Grid size={{ xs: 10, sm: 10, md: 7 }}>
          <div className={classes.flex}>
            {scotusCase.important &&
              <div className={classes.starGrid}>
                <StarRateRoundedIcon color='primary' />
              </div>
            }
            <div className={classes.noWrap + ' ' + (scotusCase.important ? classes.starGridText : '')}>
              <Typography noWrap variant="h6" component="span" title={scotusCase.case}>{scotusCase.case}</Typography>
            </div>
          </div>
        </Grid>
        {/* sx={{ display }} replaces <Hidden mdDown>
            <Hidden> is now deprecated
         */}
        <Grid sx={{ display: { xs: 'none', md: 'block' } }} size={{ md: 2, lg: 1 }}>
          <Typography title="Date Argued">{scotusCase.argumentDate?.format(formatter)}</Typography>
        </Grid>
        <Grid sx={{ display: { xs: 'none', md: 'block' } }} size={{ md: 2, lg: 1 }} className={classes.noWrap}>
          <Typography noWrap title={scotusCase.status}>{scotusCase.status}</Typography>
        </Grid>
        <Grid sx={{ display: {xs: 'none', lg: 'block' } }}size={{ lg: 2 }}>
          <Typography title="Author">{author}</Typography>
        </Grid>
        <Grid size={{ xs: 2, sm: 2, md: 1 }}>
          <div className={classes.flex}>
            <div className={classes.noWrap + ' ' +  (isAdmin ? classes.editGridText : '')}>
              <Typography noWrap component="span">{scotusCase.result}</Typography>
            </div>
            {isAdmin && onEditClick && 
              <div className={classes.editGrid}>
                <IconButton onClick={onEditClick}>
                  <EditIcon />
                </IconButton>
              </div>
            }
          </div>
        </Grid>
      </Grid>
    </Paper>
  );

};

export default observer(CaseListItem);
