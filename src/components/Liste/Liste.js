import React, { useEffect, useState } from 'react';
import { useCollection, useDocumentData } from 'react-firebase-hooks/firestore';
import { firestore } from '../../index';
import { COLLECTION_LISTE, COLLECTION_LISTER } from '../../utils/konstanter';
import Checkbox from '@material-ui/core/Checkbox';
import { withRouter } from 'react-router';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import Typography from '@material-ui/core/Typography';
import css from './Liste.module.scss';
import CircularProgress from '@material-ui/core/CircularProgress';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import TextField from '@material-ui/core/TextField';
import Done from '@material-ui/icons/Done';
import CheckCircle from '@material-ui/icons/CheckCircle';
import CancelIcon from '@material-ui/icons/Cancel';
import DeleteIcon from '@material-ui/icons/Delete';
import Edit from '@material-ui/icons/Edit';
import DragIndicator from '@material-ui/icons/DragIndicator';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import LeggTilRad from './LeggTilRad';
import { isEscapePressed } from '../../utils/metoder';
import FileImportDialog from '../import/FileImportDialog';
import Divider from '@material-ui/core/Divider';
import {
  opprettNyRad,
  applyDragMove,
  sortOrdervalue,
  sorterAlfabetisk,
} from '../../utils/firestore';
import { Container, Draggable } from 'react-smooth-dnd';
import classnames from 'classnames';

const lagEllerAktiverRad = (listeId, liste, tekst = '', edit = false) => {
  const ordervalue = liste
    ? liste.docs.map((doc) => doc.data().ordervalue || 0).reduce((a, b) => Math.max(a, b), 0) + 1
    : 0;

  const dokFraEksisterendeListe = liste.docs.find((dok) => {
    return (dok.data().tekst || '').toLowerCase() === tekst.toLocaleLowerCase();
  });
  if (dokFraEksisterendeListe) {
    dokFraEksisterendeListe.ref.set({ aktiv: true, utfoert: false, ordervalue }, { merge: true });
  } else {
    opprettNyRad(listeId, tekst, ordervalue, edit);
  }
};

const lagreRad = (dokument, { tekst }) => {
  dokument.ref.set({ edit: false, tekst: tekst || '' }, { merge: true });
};

const slettRad = (dokument) => {
  dokument.ref.delete().catch((err) => {
    throw new Error('klarte ikke slette readen: ' + err);
  });
};

const rediger = (dokument, edit = true) => {
  dokument.ref.set({ edit }, { merge: true });
};

const visDokumenter = (dokument, adminmodus) => {
  if (adminmodus) {
    return true;
  }

  return dokument.data().aktiv;
};

const skjulUtfoerte = (liste) => {
  liste.docs.forEach((dokument) => {
    if (dokument.data().utfoert) {
      dokument.ref.set({ aktiv: false }, { merge: true });
    }
  });
};

const RadIEditModus = ({ dokument }) => {
  const [tekst, setTekst] = useState(dokument.data().tekst || '');
  const [navnFoerEndring] = useState(tekst);

  return (
    <>
      <TextField
        label="Tekst"
        value={tekst}
        className={css.itempart}
        onChange={(event) => setTekst(event.target.value)}
        onBlur={() => lagreRad(dokument, { tekst })}
        onKeyDown={(event) => {
          if (isEscapePressed(event || window.event)) {
            event.preventDefault();
            rediger(dokument, false);
          } else if (event.key === 'Enter') {
            event.preventDefault();
            lagreRad(dokument, { tekst });
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
          setTekst(navnFoerEndring);
        }}
      >
        <CancelIcon />
      </IconButton>
    </>
  );
};

const Listeelement = ({ dokument, adminmodus }) => {
  const data = dokument.data();

  const endreUtfoertVerdi = (data) => {
    dokument.ref.set({ ...data, utfoert: !data.utfoert });
  };

  return (
    <ListItem dense>
      {data.edit ? (
        <RadIEditModus dokument={dokument} />
      ) : (
        <>
          {!adminmodus && (
            <DragIndicator className={classnames('column-drag-handle', css.draggidentikator)} />
          )}
          <Checkbox
            edge="start"
            checked={data.utfoert}
            onChange={() => endreUtfoertVerdi(data)}
            disableRipple
            inputProps={{ 'aria-labelledby': dokument.id }}
            disabled={adminmodus}
          />
          <ListItemText id={dokument.id} primary={data.tekst} />
          <IconButton
            aria-label="Endre tekst"
            size="medium"
            color="primary"
            onClick={() => rediger(dokument)}
          >
            <Edit />
          </IconButton>
          {adminmodus && (
            <IconButton
              aria-label="Slett rad"
              size="medium"
              color="primary"
              onClick={() => slettRad(dokument)}
            >
              <DeleteIcon />
            </IconButton>
          )}
        </>
      )}
    </ListItem>
  );
};

const Menyknapp = ({ listeId, liste, history, adminmodus, setAdminmodus }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  const handleImportClose = () => {
    setImportDialogOpen(false);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        edge="start"
        className={css.menuButton}
        color="inherit"
        aria-label="menu"
        onClick={(event) => setAnchorEl(event.currentTarget)}
      >
        <MenuIcon />
      </IconButton>
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem
          onClick={() => {
            skjulUtfoerte(liste);
            handleClose();
          }}
        >
          <ListItemText primary="Skjul utførte" />
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            setAdminmodus(!adminmodus);
            handleClose();
          }}
        >
          {adminmodus && (
            <ListItemIcon>
              <Done />
            </ListItemIcon>
          )}
          <ListItemText primary="Administrer liste" />
        </MenuItem>
        <MenuItem
          onClick={() => {
            setImportDialogOpen(true);
            handleClose();
          }}
        >
          <ListItemText primary="Importer tekster" />
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            history.push('/lister');
          }}
        >
          <ListItemText primary="Lukk liste" />
        </MenuItem>
      </Menu>
      <FileImportDialog
        open={importDialogOpen}
        listeId={listeId}
        gjeldendeListe={liste}
        handleClose={handleImportClose}
      />
    </>
  );
};

const slettEventueltDummydokument = (liste) => {
  const dummydokument = liste.docs.find((dok) => dok.id === 'dummydokument');
  if (dummydokument) {
    slettRad(dummydokument);
  }
};

const Liste = ({ match, history }) => {
  const listeid = match.params.liste;
  const [liste, loading, error] = useCollection(
    firestore.collection(`${COLLECTION_LISTER}/${listeid}/${COLLECTION_LISTE}`),
    {
      snapshotListenOptions: { includeMetadataChanges: true },
    },
  );

  const [listedokument, loadingListeDokument, errorListeDokument] = useDocumentData(
    firestore.doc(`${COLLECTION_LISTER}/${listeid}`),
    {
      snapshotListenOptions: { includeMetadataChanges: true },
    },
  );

  const [adminmodus, setAdminmodus] = useState(false);

  useEffect(() => {
    if (!loading) {
      slettEventueltDummydokument(liste);
    }
  }, [loading, liste]);

  const filterFn = (dokument) => {
    return dokument.id !== 'dummydokument' && visDokumenter(dokument, adminmodus);
  };

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Menyknapp
            listeId={listeid}
            liste={liste}
            history={history}
            adminmodus={adminmodus}
            setAdminmodus={setAdminmodus}
          />
          <Typography variant="h1" className={css.title}>
            {errorListeDokument && <strong>Error: {JSON.stringify(error)}</strong>}
            {loadingListeDokument && <CircularProgress className={css.spinner} />}
            {listedokument && listedokument.navn}
            {adminmodus && ' (admin)'}
          </Typography>
          <LeggTilRad
            listeId={listeid}
            liste={liste}
            lagNyRadFn={lagEllerAktiverRad}
            disabled={adminmodus}
          />
        </Toolbar>
      </AppBar>
      <List className={css.listekontainer}>
        <Container
          lockAxis="y"
          dragHandleSelector=".column-drag-handle"
          onDrop={(e) => applyDragMove(loading ? [] : liste, e, sortOrdervalue, filterFn)}
        >
          {error && <strong>Error: {JSON.stringify(error)}</strong>}
          {loading && <CircularProgress className={css.spinner} />}
          {loading
            ? []
            : liste.docs
                .filter(filterFn)
                .sort(adminmodus ? sorterAlfabetisk : sortOrdervalue)
                .map((dokument) => (
                  <Draggable key={dokument.id}>
                    <Listeelement dokument={dokument} adminmodus={adminmodus} />
                  </Draggable>
                ))}
        </Container>
      </List>
      <div id="emptyfooter" />
    </div>
  );
};

export default withRouter(Liste);
