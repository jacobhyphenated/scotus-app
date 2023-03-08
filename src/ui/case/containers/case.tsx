import { useCallback, useEffect, useMemo, useState, useContext } from 'react';
import { Theme, Paper, Grid, Typography, IconButton, Button, Link } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import BackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router';
import { FullCase, CaseStatus, CaseStoreContext } from '../../../stores/caseStore';
import { observer } from 'mobx-react';
import { DateTimeFormatter, LocalDate } from '@js-joda/core';
import { Locale as JsJodaLocale } from '@js-joda/locale_en-us';
import { OpinionView } from '../components';
import { opinionSort } from '../../../stores/opinionStore';
import { UserStoreContext } from '../../../stores/userStore';
import LinkableText from '../components/linkableText';

const useStyles = makeStyles((theme: Theme) => ({
  paper: {
    marginTop: theme.spacing(1),
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    padding: theme.spacing(2),
    height: `calc(100vh - ${theme.spacing(8)})`,
    overflowY: 'scroll',
  },
  bold: {
    fontWeight: 'bold',
  },
  paragraph: {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(5),
    whiteSpace: 'pre-wrap',
  },
  flexEnd: {
    marginRight: theme.spacing(2),
  },
}));

const CasePage = () => {

  const [fullCase, setFullCase] = useState<FullCase>();

  const userStore = useContext(UserStoreContext);
  const caseStore = useContext(CaseStoreContext);
  const navigate = useNavigate();

  const dateFormatter = useMemo(() =>{
    return DateTimeFormatter.ofPattern('MM/dd/yyyy').withLocale(JsJodaLocale.US);
  }, []);

  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    const caseId = id;
    if (!caseId || isNaN(Number(caseId))) {
      console.warn('No case id in url params');
      navigate('/', { replace: true });
      return;
    }
    const loadCase = async () => {
      try {
        const fullCase = await caseStore.getCaseById(Number(caseId));
        if (!fullCase) {
          throw new Error(`No case found with id ${caseId}`);
        }
        document.title = `SCOTUS App | ${fullCase.case}`;
        setFullCase(fullCase);
      } catch (e) {
        console.warn(e);
        navigate('/', { replace: true });
      }
    };
    loadCase();
  }, [id, navigate, caseStore]);

  const classes = useStyles();

  const courtStatusText: (fullCase: FullCase) => JSX.Element = useCallback(fullCase => {
    let text: JSX.Element | null = null;
    switch(fullCase.status) {
      case CaseStatus.DISMISSED:
        text = <><span className={classes.bold}>Dismissed:</span> The court declined to review this case</>;
        break;
      case CaseStatus.DIG:
        text = <>
            <span className={classes.bold}>Dismissed as Improvidently Granted: </span>
            The court originally granted this case to hear arguments, but later decided that granting the case was a mistake. The case is dismissed.
          </>;
        break;
      case CaseStatus.GVR:
        text = <>
            <span className={classes.bold}>Grant, Vacate, and Remand: </span>
            The court granted this case and, without hearing arguments, vacates the ruling of the lower court and remands for further consideration.
            This happens when SCOTUS believes the lower court decided incorrectly and that arguments are not necessary for a ruling.
            GVRs can apply to petitions for certiorari, but are also used for petitions for a stay or preliminary injunction of a lower court ruling.
          </>;
        break;
    }
    return text ? 
      <Grid item>
        <Typography paragraph>{text}</Typography>
      </Grid>
    : <></>;
  }, [classes]);

  const back = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const editClick = useCallback(() => {
    navigate(`/admin/case/edit/${id}`);
  }, [id, navigate]);

  const isAdmin = userStore.isAdmin;
  const combinedWith = fullCase?.dockets.filter(d => d.title !== fullCase.case) ?? [];

  return (
    <Paper className={classes.paper}>
      {fullCase &&
        <Grid container direction="column" spacing={1}>
          <Grid item>
            <Grid container direction="row" alignItems="baseline" justifyContent="space-between">
              <Grid item>
                <Grid container direction="row" justifyContent="flex-start" alignItems="baseline" spacing={2}>
                  <Grid item>
                    <IconButton onClick={back} size="large">
                      <BackIcon color="action" />
                    </IconButton>
                  </Grid>
                  <Grid item>
                    <Typography color="textSecondary" variant="subtitle2">
                      {fullCase.status === CaseStatus.ARGUED && !!fullCase.sitting ? 
                        `${fullCase.status} (${fullCase.sitting})`
                      : fullCase.status}{fullCase.result && `: ${fullCase.result}` }
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item className={classes.flexEnd}>
                <Grid container direction="row" justifyContent="flex-start" alignItems="baseline" spacing={2}>
                  <Grid item>
                    <Typography color="textSecondary" variant="subtitle2">
                      Term: {fullCase.term.name}
                    </Typography>
                  </Grid>
                  {isAdmin && 
                    <Grid item>
                      <Button variant="text" color="secondary" onClick={editClick}>EDIT</Button>
                    </Grid>
                  }
                </Grid>
              </Grid>
            </Grid>
            
          </Grid>
          <Grid item>
            <Typography variant="h5">{fullCase.case}</Typography>
          </Grid>
          {combinedWith.length > 0 &&
            <Grid item>
              <Typography variant="subtitle1">Combined With:</Typography>
              {combinedWith.map(d => (
                <Typography key={d.docketId} color="textSecondary">
                  {d.title}
                </Typography> 
              ))}
            </Grid>
          }
          <Grid item>
            <Link href={`/case/${fullCase.id}/lowerCourt`}><Typography>lower court rulings</Typography></Link>
          </Grid>
          {courtStatusText(fullCase)}
          <Grid item>
            <Typography className={classes.paragraph} paragraph color="textPrimary">
              <span className={classes.bold}>At Issue: </span>
              <LinkableText text={fullCase.shortSummary} />
            </Typography>
          </Grid>
          {fullCase.decisionSummary ?
            <Grid item>
              <Typography className={classes.paragraph} paragraph color="textPrimary">
                <span className={classes.bold}>Ruling ({fullCase.result || 'opinion of the court'}): </span>
                <LinkableText text={fullCase.decisionSummary} />
              </Typography>
            </Grid>
          :
            <Grid item>
              {fullCase.argumentDate &&
                <Typography className={classes.paragraph} color="textPrimary">
                  {fullCase.argumentDate.isBefore(LocalDate.now()) ?
                    `This case was argued before the court on ${fullCase.argumentDate.format(dateFormatter)}. A ruling is expected before the end of the term.`
                  : 
                    `This case is currently scheduled to be argued before the court on ${fullCase.argumentDate.format(dateFormatter)}`
                  }
                </Typography>
              }
            </Grid>
          }
          <Grid container direction="row" justifyContent="flex-start">
            {fullCase.decisionLink && 
              <Grid item xs={12}>
                <Typography className={classes.paragraph}>
                  <Link color="secondary" href={fullCase.decisionLink} target="_blank" rel="noreferrer">View the full opinion</Link>
                </Typography>
              </Grid>
            }
            {fullCase.opinions.sort(opinionSort).map(opinion => (
              <Grid item key={opinion.id} xs={12} sm={6} md={4} lg={3}>
                <OpinionView opinion={opinion} />
              </Grid>
            ))}
          </Grid>
        </Grid>
      }
    </Paper>
  );
};

export default observer(CasePage);
