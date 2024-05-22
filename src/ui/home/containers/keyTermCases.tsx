import { Grid, IconButton, Paper, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { autorun } from "mobx";
import { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import BackIcon from '@mui/icons-material/ArrowBack';
import { Case, CaseStoreContext, Term } from "../../../stores/caseStore";
import { CasePreviewCard } from "../components";
import { observer } from "mobx-react";

const useStyles = makeStyles((theme: Theme) => ({
  paper: {
    marginTop: theme.spacing(1),
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    padding: theme.spacing(2),
    height: `calc(100vh - ${theme.spacing(8)})`,
    overflowY: 'scroll',
  },
  row: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(3),
  },
}));

const KeyTermCases = () => {

  const [keyTermCases, setKeyTermCases] = useState<Case[]>([]);
  const [term, setTerm] = useState<Term>();

  const caseStore = useContext(CaseStoreContext);
  const navigate = useNavigate();

  const { termId } = useParams<{ termId: string }>();
  const allTerms = caseStore.allTerms;

  useEffect(() => {
    autorun((reaction) => {
      if (allTerms.length > 0 && !term) {
        const selectedTerm = allTerms.find(t => t.id === Number(termId));
        if (!selectedTerm) {
          console.warn(`${termId} is not a valid term id`);
          navigate('/', { replace: true });
          return;
        }
        setTerm(selectedTerm);
        document.title = `SCOTUS App | Term ${selectedTerm.name} | Key Cases`;
        reaction.dispose();
      }
    });
  }, [allTerms, termId, navigate, term]);

  useEffect(() => {
    if(!!term) {
      const loadCases = async () => {
        const cases = await caseStore.getCaseByTerm(term.id);
        const keyCases = cases.filter(c => c.important);
        setKeyTermCases(keyCases);
      };
      loadCases();
    }
  }, [term, caseStore]);

  const back = useCallback(() => {
    navigate('..');
  }, [navigate]);

  const onCaseClick = useCallback((c: Case) => {
    navigate(`/case/${c.id}`);
  }, [navigate]);

  const classes = useStyles();

  return (
    <Paper className={classes.paper}>
      <Grid container direction="row" justifyContent="flex-start" alignItems="center" spacing={1}>
        <Grid item>
          <IconButton onClick={back} size="large">
            <BackIcon color="action" />
          </IconButton>
        </Grid>
        <Grid item>
          <Typography variant="h4">
            Key Cases for the {term?.name} term 
          </Typography>
        </Grid>
      </Grid>
      <Grid container direction="row" justifyContent="flex-start" spacing={2} className={classes.row}>
        {keyTermCases.map(r => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={r.id}>
            <CasePreviewCard case={r} onClick={onCaseClick} />
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default observer(KeyTermCases);
