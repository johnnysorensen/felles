import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import css from './FileImportDialog.module.scss';
import { IconButton } from '@material-ui/core';
import CancelIcon from '@material-ui/icons/Cancel';
import { uniq } from 'lodash';
import { opprettNyRad } from '../../utils/firestore';

const behandleImportertListe = (event, listeId, gjeldendeListe) => {
  const eksisterendeTekster = gjeldendeListe.docs.map((dok) => dok.data().tekst.toLowerCase());

  const lines = event.target.result.split(/\r\n|\n/);
  uniq(lines).forEach((line) => {
    if (!eksisterendeTekster.includes(line.trim().toLowerCase())) {
      opprettNyRad(listeId, line, false, false);
    }
  });
};

const importerListe = (file, listeId, gjeldendeListe) => {
  const reader = new FileReader();
  reader.onload = (event) => behandleImportertListe(event, listeId, gjeldendeListe);
  reader.readAsText(file);
};

const BrowseFile = ({ file, setFileFn }) => {
  return (
    <>
      <input
        color="primary"
        accept=".txt"
        type="file"
        onChange={(event) => {
          setFileFn(event.target.files[0]);
        }}
        id="icon-button-file"
        style={{ display: 'none' }}
      />
      <label htmlFor="icon-button-file" className={css.browseFileButton}>
        <Button color="primary" variant="contained" component="span">
          Velg fil
        </Button>
      </label>
      <span>{file ? file.name : ''}</span>
    </>
  );
};

const FileImportDialog = ({ open, listeId, gjeldendeListe, handleClose }) => {
  const [file, setFile] = useState({});

  return (
    <div>
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Importer tekstliste</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Importerer tekster fra tekstfil med en tekst per linje.
          </DialogContentText>
          <BrowseFile file={file} setFileFn={setFile} />
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            onClick={() => {
              importerListe(file, listeId, gjeldendeListe);
              handleClose();
              setFile({});
            }}
            disabled={!file.name}
          >
            Importer
          </Button>
          <IconButton color="secondary" aria-label="angre" onClick={handleClose}>
            <CancelIcon />
          </IconButton>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default FileImportDialog;
