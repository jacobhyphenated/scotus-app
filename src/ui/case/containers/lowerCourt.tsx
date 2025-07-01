import { Grid2 as Grid, IconButton, Paper, Stack, Theme, Typography } from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import BackIcon from '@mui/icons-material/ArrowBack';
import { useCallback, useContext, useEffect, useState } from "react";
import {  useNavigate, useParams } from "react-router";
import { CaseStatus, CaseStoreContext, FullCase } from "../../../stores/caseStore";
import { DocketStoreContext } from "../../../stores/docketStore";
import { forkJoin } from "rxjs";
import LinkableText from '../components/linkableText';
import { groupDocketsByDecision } from "../service/lowerCourtService";

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
          const groupedDockets = groupDocketsByDecision(dockets);
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
      <Stack spacing={1}>
        <Grid container alignItems="baseline" justifyContent="space-between">
          <Grid>
            <Grid container justifyContent="flex-start" alignItems="baseline" spacing={2}>
              <Grid>
                <IconButton onClick={back} size="large">
                  <BackIcon color="action" />
                </IconButton>
              </Grid>
              <Grid>
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
          <Grid className={styles.flexEnd}>
            {fullCase &&
              <Typography color="textSecondary" variant="subtitle2">
                Term: {fullCase.term.name}
              </Typography>
            }
          </Grid>
        </Grid>
        {fullCase &&
          <Typography variant="h5">
            {fullCase.case}
          </Typography>
        }
        <Typography color="textPrimary" variant="subtitle1">
          Lower Court Rulings:
        </Typography>
        { lowerCourtRulings &&
          <Grid container justifyContent="flex-start" >
            {lowerCourtRulings.map( ruling => (
              <Grid size={{ xs: 12, md: 6 }} key={ruling.docketIdentifiers[0].docketId}>
                <Paper className={styles.lowerCourt}>
                  <Stack>
                    <Typography variant="subtitle2" color="textSecondary">
                      {ruling.lowerCourt}
                    </Typography>
                    { ruling.docketIdentifiers.map( docket => (
                      <Typography className={styles.bottomPad} key={docket.docketId}>
                        <span className={styles.bold}>{docket.title}</span> ({docket.docketNumber})
                      </Typography>
                    ))}
                    <Typography paragraph className={styles.paragraph}>
                      <LinkableText text={ruling.lowerCourtRuling} />
                    </Typography>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        }
      </Stack>
    </Paper>
  );
};

export default LowerCourtPage;
