import { Button, Grid2, Paper, TextField, Theme, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { Stack } from "@mui/system";
import { useCallback, useState } from "react";
import { Tag } from "../../../stores/tagStore";

interface Props {
  tag: Tag,
  onEdit: (id: number, name: string, description: string) => void,
  onDelete: (id: number) => void,
}

const useStyles = makeStyles((theme: Theme) => ({
  tagItem: {
    margin: theme.spacing(0.5),
    padding: theme.spacing(0.5),
  },
  pointer: {
    cursor: 'pointer',
  },
  grid: {
    [theme.breakpoints.up('sm')]: {
      display: 'flex',
      gap: theme.spacing(1),
    },
  },
  nameItem: {
    [theme.breakpoints.down('sm')]: {
      marginTop: theme.spacing(1),
    },
    flex: 2,
  },
  descItem: {
    [theme.breakpoints.down('sm')]: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(1),
    },
    flex: 5,
  },
  buttons: {
    flexBasis: '50px',
  },
}));

export const TagCard = (props: Props) => {
  const [editing, setEditing] = useState<boolean>(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const editTagClick = useCallback(() => {
    setEditing(true);
    setName(props.tag.name);
    setDescription(props.tag.description);
  }, [props.tag]);

  const changeName = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  }, []);

  const changeDescription = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(event.target.value);
  }, []);
  
  const saveTagClick = useCallback(() => {
    setEditing(false);
    props.onEdit(props.tag.id, name, description);
  }, [description, name, props]);

  const deleteTagClick = useCallback(() => {
    props.onDelete(props.tag.id);
  }, [props]);

  const classes = useStyles();

  return (
    <>
    { editing ?
      <Paper className={classes.tagItem}>
        <div className={classes.grid}>
          <div className={classes.nameItem}>
            <TextField
              id="edit-tag-name"
              name="tag-name"
              size="small"
              color="primary"
              variant="outlined"
              fullWidth
              required
              label="Name"
              onChange={changeName}
              value={name}
            />
          </div>
          <div className={classes.descItem}>
            <TextField
              id="edit-tag-description"
              name="tag-description"
              size="small"
              color="primary"
              variant="outlined"
              fullWidth
              required
              label="Name"
              onChange={changeDescription}
              value={description}
            />
          </div>
          <div className={classes.buttons}>
            <Stack direction='row' spacing={1}>
              <Button
                color="primary"
                variant="contained"
                disabled={!name || !description}
                onClick={saveTagClick}
              >
                Save
              </Button>
              <Button
                color="error"
                variant="contained"
                onClick={deleteTagClick}
              >
                Delete
              </Button>
            </Stack>
          </div>
        </div>
      </Paper>
      :
      <Paper className={`${classes.tagItem} ${classes.pointer}`} onClick={editTagClick}>
        <Grid2 container spacing={1}>
          <Grid2 size={{ xs: 12, sm: 3, lg: 2 }}>
            <Typography><strong>{props.tag.name}</strong></Typography>
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 9, lg: 10 }}>
            <Typography component='p'>{props.tag.description}</Typography>
          </Grid2>
        </Grid2>
      </Paper>
    }
    </>
  );
};