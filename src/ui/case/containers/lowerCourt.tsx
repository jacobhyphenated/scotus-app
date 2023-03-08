import { Grid, IconButton, Paper, Theme, Typography } from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import BackIcon from '@mui/icons-material/ArrowBack';
import { useCallback, useContext, useEffect, useState } from "react";
import {  useNavigate, useParams } from "react-router";
import { CaseStatus, CaseStoreContext, FullCase } from "../../../stores/caseStore";
import { DocketStoreContext } from "../../../stores/docketStore";
import { forkJoin } from "rxjs";
import LinkableText from '../components/linkableText';
import { groupBy } from "../../../util/functional";

interface DocketIdentifiers {
  docketId: number;
  docketNumber: string;
  title: string;
}

interface GroupedDocket {
  docketIdentifiers: DocketIdentifiers[];
  lowerCourt: string;
  lowerCourtRuling: string;
}

const useStyles = makeStyles((theme: Theme) => ({
  paper: {
    marginTop: theme.spacing(1),
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    padding: theme.spacing(2),
    height: `calc(100vh - ${theme.spacing(8)})`,
    overflowY: 'scroll',
  },
  flexEnd: {
    marginRight: theme.spacing(2),
  },
  lowerCourt: {
    margin: theme.spacing(2),
    padding: theme.spacing(2),
  },
  paragraph: {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(5),
    marginTop: theme.spacing(1),
    whiteSpace: 'pre-wrap',
  },
  bottomPad: {
    marginBottom: theme.spacing(1),
  },
  bold: {
    fontWeight: 'bold',
  },
}));

const LowerCourtPage = () => {

  const styles = useStyles();

  const [fullCase, setFullCase] = useState<FullCase | null>(null);
  const [lowerCourtRulings, setLowerCourtRulings] = useState<GroupedDocket[] | null>(null);

  const docketStore = useContext(DocketStoreContext);
  const caseStore = useContext(CaseStoreContext);
  const navigate = useNavigate();

  const back = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const { id } = useParams<{ id: string }>();
  useEffect( () => {
    const loadFullCase = async () => {
      try {
        const c = await caseStore.getCaseById(Number(id));
        setFullCase(c);
      } catch (e) {
        console.warn(e);
        navigate('/', { replace: true });
      }
    };
    loadFullCase();
  }, [id, caseStore, navigate]);

  useEffect(() => {
    if (!fullCase) {
      return;
    }
    document.title = `SCOTUS App | ${fullCase.case} | Lower Court`;
    const subscription = forkJoin(fullCase.dockets.map(d => docketStore.getDocketById(d.docketId)))
      .subscribe({
        next: dockets => {
          const grouped = groupBy(dockets, 'lowerCourtRuling');
          const groupedDockets = Array.from(grouped.keys()).flatMap((key) => {
            const values = grouped.get(key)!;
            if (values.every( d => d.lowerCourt.id === values[0].lowerCourt.id)) {
              return [{
                lowerCourt: values[0].lowerCourt.name,
                lowerCourtRuling: values[0].lowerCourtRuling,
                docketIdentifiers: values.map( value => ({
                  docketId: value.id,
                  docketNumber: value.docketNumber,
                  title: value.title,
                })),
              }];
            } else {
              return values.map( value => ({
                lowerCourt: value.lowerCourt.name,
                lowerCourtRuling: value.lowerCourtRuling,
                docketIdentifiers: [{
                  docketId: value.id,
                  docketNumber: value.docketNumber,
                  title: value.title,
                }],
              }));
            }
          });
          
          setLowerCourtRulings(groupedDockets);
        },
        error: error => {
          console.warn(error);
          navigate('/', { replace: true });
        },
      });
    return () => { subscription.unsubscribe() };
  }, [fullCase, docketStore, navigate]);


  return (
    <Paper className={styles.paper}>
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
                  {fullCase &&
                    <Typography color="textSecondary" variant="subtitle2">
                      {fullCase.status === CaseStatus.ARGUED && !!fullCase.sitting ? 
                        `${fullCase.status} (${fullCase.sitting})`
                      : fullCase.status}{fullCase.result && `: ${fullCase.result}` }
                    </Typography>
                  }
                </Grid>
              </Grid>
            </Grid>
            <Grid item className={styles.flexEnd}>
              <Grid container direction="row" justifyContent="flex-start" alignItems="baseline" spacing={2}>
                <Grid item>
                  {fullCase &&
                    <Typography color="textSecondary" variant="subtitle2">
                      Term: {fullCase.term.name}
                    </Typography>
                  }
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          {fullCase &&
            <Typography variant="h5">
              {fullCase.case}
            </Typography>
          }
        </Grid>
        <Grid item>
          <Typography color="textPrimary" variant="subtitle1">
            Lower Court Rulings:
          </Typography>
        </Grid>
        <Grid item>
          { lowerCourtRulings &&
            <Grid container direction="row" justifyContent="flex-start" >
              {lowerCourtRulings.map( ruling => (
                <Grid item xs={12} md={6} key={ruling.docketIdentifiers[0].docketId}>
                  <Paper className={styles.lowerCourt}>
                    <Grid container direction="column">
                      <Grid item>
                        <Typography variant="subtitle2" color="textSecondary">
                          {ruling.lowerCourt}
                        </Typography>
                      </Grid>
                      { ruling.docketIdentifiers.map( docket => (
                        <Grid item key={docket.docketId}>
                          <Typography className={styles.bottomPad}>
                            <span className={styles.bold}>{docket.title}</span> ({docket.docketNumber})
                          </Typography>
                        </Grid>
                      ))}
                      <Grid item>
                        <Typography paragraph className={styles.paragraph}>
                          <LinkableText text={ruling.lowerCourtRuling} />
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          }
        </Grid>
      </Grid>
    </Paper>
  );
};

export default LowerCourtPage;
