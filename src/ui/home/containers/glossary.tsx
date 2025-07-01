import { Paper, Stack, Theme, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import makeStyles from '@mui/styles/makeStyles';
import { GlossaryItem, GlossaryService } from "../service/glossaryService";

type DisplayType = 'alpha' | 'group'

const useStyles = makeStyles((theme: Theme) => ({
    paper: {
      marginTop: theme.spacing(1),
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
      paddingLeft: theme.spacing(1),
      paddingTop: theme.spacing(1),
      height: `calc(100vh - ${theme.spacing(8)})`,
      overflowY: 'scroll',
    },
    body: {
      marginRight: theme.spacing(1),
      marginTop: theme.spacing(1),
      paddingRight: theme.spacing(2),
      paddingLeft: theme.spacing(2),
      paddingTop: theme.spacing(1),
      paddingBottom: theme.spacing(1),
    },
    item: {
      paddingBottom: theme.spacing(1),
    },
  }));

const GlossaryPage = () => {

  useEffect(() => {
    document.title = 'SCOTUS App | Glossary';
  }, []);

  const [displayType, setDisplayType] = useState<DisplayType>('group');

  const glossaryService = useMemo(() => {
    return new GlossaryService();
  }, []);

  const glossaryByAlphabetical = glossaryService.glossaryByAlphabetical;
  const glossaryByGroup = glossaryService.glossaryByGroup;

  const changeDisplayType = useCallback((_: React.MouseEvent<HTMLElement>, newDisplayType: DisplayType ) => {
    setDisplayType(newDisplayType);
  }, []);

  const classes = useStyles();

  return (
    <Paper className={classes.paper}>
      <Stack>
        <ToggleButtonGroup
          color="primary"
          value={displayType}
          exclusive
          onChange={changeDisplayType}
          aria-label="Platform"
        >
          <ToggleButton value="group">Grouped</ToggleButton>
          <ToggleButton value="alpha">Alphabetical</ToggleButton>
        </ToggleButtonGroup>

        {(displayType === 'group') ? 
          Array.from(glossaryByGroup.keys()).sort().map((groupName) => (
            <Paper key={groupName} elevation={2} className={classes.body}>
              <Stack>
                <div className={classes.item}>
                  <Typography variant="h5">{groupName}</Typography>
                </div>
                {glossaryByGroup.get(groupName)?.map((item) => (
                  <GlossaryLine key={item.name} glossaryItem={item}></GlossaryLine>
                ))}
              </Stack>
            </Paper>
          ))
        : 
          <Paper className={classes.body}>
            {glossaryByAlphabetical.map((item) => (
              <GlossaryLine key={item.name} glossaryItem={item}></GlossaryLine>
            ))}
          </Paper>
        }
      </Stack>
    </Paper>
  );
};

export default GlossaryPage;

interface Props {
  glossaryItem: GlossaryItem;
}

const GlossaryLine = (props: Props) => {

  const classes = useStyles();

  return (
    <div id={props.glossaryItem.name} className={classes.item}>
      <strong>{props.glossaryItem.name}</strong> {"\u2014"} <Typography display="inline" variant="body1">{props.glossaryItem.definition}</Typography>
    </div>
  );
};
