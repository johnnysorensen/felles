import React, { useState } from 'react';
import { useCollection } from 'react-firebase-hooks/firestore';
import { firestore } from '../../index';
import { COLLECTION_LISTE, COLLECTION_LISTER } from '../../utils/konstanter';
import { isEmpty } from 'lodash';
import IconButton from '@material-ui/core/IconButton';
import CircularProgress from '@material-ui/core/CircularProgress';
import TextField from '@material-ui/core/TextField';
import CheckCircle from '@material-ui/icons/CheckCircle';
import Cancel from '@material-ui/icons/Cancel';
import DeleteIcon from '@material-ui/icons/Delete';
import Edit from '@material-ui/icons/Edit';
import css from './Lister.module.scss';
import { isEscapePressed } from '../../utils/metoder';
import ListItem from '@material-ui/core/ListItem';
import List from '@material-ui/core/List';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import { Container, Draggable } from 'react-smooth-dnd';
import { applyDragMove, sortOrdervalue } from '../../utils/firestore';

const lagNyListe = (ordervalue) => {
  firestore
    .collection(COLLECTION_LISTER)
    .add({ edit: true, ordervalue, deleted: false })
    .then((reference) => {
      reference
        .collection(COLLECTION_LISTE)
        .doc('dummydokument')
        .set({ skal_flitreres_bort: true });
    });
};

const slettListe = (listeDok) => {
  listeDok.ref.set({ deleted: true }, { merge: true });

  /* * Kode for å slette en liste umiddelbart. * *
    liste.ref.delete().then(() => undefined, (err) => {
        throw new Error('klarte ikke slette listen: ' + err)
    });
  */
};

const lagreListe = (listeDok, { navn }) => {
  const navnet = isEmpty(navn) ? 'uten navn' : navn;
  listeDok.ref.set({ edit: false, navn: navnet }, { merge: true });
};

const rediger = (listeDok, edit = true) => {
  listeDok.ref.set({ edit }, { merge: true });
};

const RadIEditModus = ({ listeDok }) => {
  const [navn, setNavn] = useState(listeDok.data().navn || '');
  const [navnFoerEndring] = useState(navn);

  return (
    <>
      <TextField
        label="Listenavn"
        value={navn}
        className={css.itempart}
        onChange={(event) => setNavn(event.target.value)}
        onBlur={() => lagreListe(listeDok, { navn })}
        onKeyDown={(event) => {
          if (isEscapePressed(event || window.event)) {
            event.preventDefault();
            rediger(listeDok, false);
          } else if (event.key === 'Enter') {
            event.preventDefault();
            lagreListe(listeDok, { navn });
          }
        }}
        autoFocus={true}
      />
      <IconButton aria-label="utført" size="medium" color="primary">
        <CheckCircle />
      </IconButton>
      <IconButton
        aria-label="angre"
        size="medium"
        color="secondary"
        onMouseDown={() => {
          setNavn(navnFoerEndring);
        }}
      >
        <Cancel />
      </IconButton>
    </>
  );
};

const RadILenkeModus = ({ listeDok }) => {
  const data = listeDok.data();
  const url = `/liste/${listeDok.id}`;
  return (
    <>
      <a className={css.itempart} href={url}>
        {data.navn}
      </a>
      <IconButton
        aria-label="Endre navn"
        size="medium"
        color="primary"
        onClick={() => rediger(listeDok)}
      >
        <Edit />
      </IconButton>
      <IconButton
        aria-label="Slett liste"
        size="medium"
        color="primary"
        onClick={() => slettListe(listeDok)}
      >
        <DeleteIcon />
      </IconButton>
    </>
  );
};

const ListeRad = ({ dokument }) => {
  return (
    <ListItem dense>
      {dokument.data().edit ? (
        <RadIEditModus listeDok={dokument} />
      ) : (
        <RadILenkeModus listeDok={dokument} />
      )}
    </ListItem>
  );
};

const Lister = () => {
  const [lister, loading, error] = useCollection(
    firestore.collection(COLLECTION_LISTER).where('deleted', '==', false),
    {
      snapshotListenOptions: { includeMetadataChanges: true },
    },
  );

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h1" className={css.title}>
            Lister
          </Typography>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="Opprett liste"
            onClick={() => lagNyListe(lister.docs.length)}
            disabled={loading || !lister}
          >
            <AddCircleIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <List className={'css.root'}>
        <Container lockAxis="y" onDrop={(e) => applyDragMove(lister, e, sortOrdervalue)}>
          {error && <strong>Error: {JSON.stringify(error)}</strong>}
          {loading && <CircularProgress className={css.spinner} />}
          {lister &&
            lister.docs.sort(sortOrdervalue).map((listeDok) => {
              return (
                <Draggable key={listeDok.id}>
                  <ListeRad dokument={listeDok} />
                </Draggable>
              );
            })}
        </Container>
      </List>
      <div id="emptyfooter" />
    </div>
  );
};

export default Lister;
