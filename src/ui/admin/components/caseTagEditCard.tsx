import { Autocomplete, Button, Chip, Grid, Paper, TextField, Theme, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { useCallback, useEffect, useState } from "react";
import { Tag } from "../../../stores/tagStore";

interface Props {
  tags: Tag[];
  allTags: Tag[];
  disabled: boolean;
  save: (tags: number[]) => void;
}

const useStyles = makeStyles( (theme: Theme) => ({
  paper: {
    padding: theme.spacing(1),
  },
  chip: {
    marginRight: theme.spacing(1),
  },
}));

export const CaseTagEditCard = (props: Props) => {
  const [editing, setEditing] = useState(false);
  const [tagIds, setTagIds] = useState<number[]>([]);

  useEffect(() => {
    setTagIds(props.tags.map(t => t.id));
  }, [props.tags]);

  const editClick = useCallback(() => {
    setEditing(true);
  }, []);

  const tagOptionLabel = useCallback((id: number) => {
    return props.allTags.find(t => t.id === id)?.name ?? 'Unknown Tag';
  }, [props.allTags]);

  const onChange = useCallback((_: React.ChangeEvent<{}>, value: number[]) => {
    setTagIds(value);
  }, []);

  const save = useCallback(() => {
    props.save(tagIds);
    setEditing(false);
  }, [props, tagIds]);

  const classes = useStyles();

  return (
    <>
    {!editing ?
      <Paper variant="outlined" className={classes.paper}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid size={10}>
            <Typography color="textSecondary" variant="subtitle2">Tags</Typography>
            {props.tags.length === 0 ? 'None'
            :
            props.tags.map(tag => (
              <Chip key={tag.id} label={tag.name} variant="outlined" className={classes.chip} />
            ))}
          </Grid>
          <Grid size={2}>
            <Button
              color="primary"
              onClick={editClick}
              disabled={props.disabled}
            >
              Edit
            </Button>
          </Grid>
        </Grid>
      </Paper>
    :
      <Grid container alignItems="center" justifyContent="space-between">
        <Grid size={10}>
          <Autocomplete<number, true>
            multiple
            id="case-tags-autocomplete"
            options={props.allTags.map(t => t.id)}
            getOptionLabel={tagOptionLabel}
            onChange={onChange}
            value={tagIds}
            filterSelectedOptions
            // eslint-disable-next-line react/jsx-no-bind
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                label="Tags"
              />
            )}
          />
        </Grid>
        <Grid size={2}>
          <Button
            color="primary"
            disabled={props.disabled}
            onClick={save}
          >
            Save
          </Button>
        </Grid>
      </Grid>
    }
    </>
  );
};