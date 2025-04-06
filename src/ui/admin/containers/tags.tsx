import { Button, Paper, Stack, TextField, Theme, Typography } from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import { FormEvent, useCallback, useContext, useEffect, useState } from "react";
import { TagStoreContext } from "../../../stores/tagStore";
import { observer } from "mobx-react";
import { TagCard } from "../components/tagCard";

const useStyles = makeStyles((theme: Theme) => ({
  tagList: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  tagItem: {
    margin: theme.spacing(0.5),
    padding: theme.spacing(0.5),
  },
  createForm: {
    [theme.breakpoints.down('md')]: {
      width: 280,
    },
    [theme.breakpoints.up('md')]: {
      width: 400,
    },
    padding: theme.spacing(1),
  },
}));

const TagAdminPage = () => {

  const tagStore = useContext(TagStoreContext);
  const allTags = tagStore.allTags;

  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [createError, setCreateError] = useState('');
  const [genericError, setGenericError] = useState('');

  useEffect(() => {
    document.title = 'SCOTUS App | Admin | Tags';
  }, []);

  const onNewTagClick = useCallback(() => {
    setGenericError('');
    setCreating(true);
  }, []);

  const changeName = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setNewName(event.target.value);
  }, []);

  const changeDescription = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setNewDesc(event.target.value);
  }, []);

  const onEdit = useCallback(async (id: number, name: string, description: string) => {
    try{
      setGenericError('');
      await tagStore.editTag(id, name, description);
    } catch(e: any) {
      console.error(e);
      setGenericError(e?.message || 'An error occurred trying to edit the tag');
    }
  }, [tagStore]);

  const onDelete = useCallback(async (id: number) => {
    try {
      setGenericError('');
      await tagStore.deleteTag(id);
    } catch (e: any) {
      console.error(e);
      setGenericError(e?.message || 'An error occurred trying to delete the tag');
    }
  }, [tagStore]);

  const create = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setGenericError('');
    if (!newName) {
      setCreateError('Name is required');
    } else if (!newDesc) {
      setCreateError('Description is required');
    } else {
      setCreateError('');
      try {
        await tagStore.createTag(newName, newDesc);
        setCreating(false);
        setNewName('');
        setNewDesc('');
      } catch (e: any) {
        console.error(e);
        setCreateError(e?.errorMessage ?? 'An error occurred while creating the new tag');
      }
    }
  }, [newDesc, newName, tagStore]);

  const classes = useStyles();

  return (
    <>
      <Typography variant="h5">Tags:</Typography>
      { !!genericError && <Typography color="error">{genericError}</Typography> }
      <Stack className={classes.tagList}>
        {allTags.map((tag) => (
          <TagCard tag={tag} key={tag.id} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </Stack>
      {!creating ?
        <Button 
          variant="contained" 
          color="primary"
          onClick={onNewTagClick}
        >
          New Tag
        </Button>
      :
        <Paper elevation={1} className={classes.createForm}>
          {!!createError &&
            <Typography color="error">{createError}</Typography>
          } 
          <form onSubmit={create}>
            <Stack spacing={1}>
              <TextField
                id="create-tag-name"
                name="name"
                size="small"
                color="primary"
                variant="outlined"
                fullWidth
                required
                label="Name"
                onChange={changeName}
                value={newName}
              />
              <TextField
                id="create-tag-desc"
                name="description"
                size="small"
                color="primary"
                variant="outlined"
                fullWidth
                required
                label="Description"
                onChange={changeDescription}
                value={newDesc}
              />
              <Button
                type="submit"
                color="primary"
                variant="contained"
              >
                Create Tag
              </Button>
            </Stack>
          </form>
        </Paper>
      }
    </>
  );

};

export default observer(TagAdminPage);
