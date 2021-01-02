import React, { useState } from 'react';
import { useCollection } from 'react-firebase-hooks/firestore';
import { firestore } from '../../index';
import { COLLECTION_LISTE, COLLECTION_LISTER } from '../../utils/konstanter';
import IconButton from '@material-ui/core/IconButton';
import CircularProgress from '@material-ui/core/CircularProgress';
import TextField from '@material-ui/core/TextField';
import Add from '@material-ui/icons/Add';
import CheckCircle from '@material-ui/icons/CheckCircle';
import Cancel from '@material-ui/icons/Cancel';
import DeleteIcon from '@material-ui/icons/Delete';
import Edit from '@material-ui/icons/Edit';
import css from './Lister.module.scss';
import { isEscapePressed } from '../../utils/metoder';

const lagNyListe = () => {
  firestore
    .collection(COLLECTION_LISTER)
    .add({ edit: true, deleted: false })
    .then((reference) => {
      reference
        .collection(COLLECTION_LISTE)
        .doc('dummydokument')
        .set({ skal_flitreres_bort: true });
    });
};

const slettListe = (liste) => {
  liste.ref.set({ deleted: true }, { merge: true });
  // liste.ref.delete().then(() => undefined, (err) => {
  //     throw new Error('klarte ikke slette listen: ' + err)
  // });
};

const lagreListe = (liste, { navn }) => {
  liste.ref.set({ edit: false, navn: navn || '' }, { merge: true });
};

const rediger = (liste, edit = true) => {
  liste.ref.set({ edit }, { merge: true });
};

const RadIEditModus = ({ listeDok }) => {
  const [navn, setNavn] = useState(listeDok.data().navn || '');
  const [navnFoerEndring] = useState(navn);

  return (
    <>
      <TextField
        label="Listenavn"
        value={navn}
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
      <a href={url}>{data.navn}</a>
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

const ListeLenke = ({ dokument }) => {
  return (
    <li>
      {dokument.data().edit ? (
        <RadIEditModus listeDok={dokument} />
      ) : (
        <RadILenkeModus listeDok={dokument} />
      )}
    </li>
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
      <header className={css.headerContainer}>
        <h1 className={css.title}>Lister</h1>
        <IconButton
          color="primary"
          aria-label="Opprett liste"
          component="span"
          className={css.headerElement}
          onClick={() => lagNyListe()}
          disabled={loading || !lister}
        >
          <Add />
        </IconButton>
      </header>
      <ul className={css.content}>
        {error && <strong>Error: {JSON.stringify(error)}</strong>}
        {loading && <CircularProgress className={css.spinner} />}
        {lister &&
          lister.docs.map((listeDok) => <ListeLenke key={listeDok.id} dokument={listeDok} />)}
      </ul>
    </div>
  );
};

export default Lister;
