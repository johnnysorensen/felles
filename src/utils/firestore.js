import { firestore } from '../index';
import { COLLECTION_LISTE, COLLECTION_LISTER } from './konstanter';

export const opprettNyRad = (listeId, nytekst, ordervalue, edit = false, aktiv = true) => {
  const tekst = nytekst.trim();
  firestore
    .collection(`${COLLECTION_LISTER}/${listeId}/${COLLECTION_LISTE}`)
    .add({ tekst, utfoert: false, edit, aktiv, ordervalue })
    .catch((err) => {
      throw new Error('Klarte ikke legge til ny rad. ' + err);
    });
};

export const applyDragMove = (liste, dragResult, listsortFn, filterFn = () => true) => {
  const { removedIndex, addedIndex } = dragResult;
  if (removedIndex === null || addedIndex === null) {
    return;
  }

  const tmpListe = [...liste.docs.filter(filterFn).sort(listsortFn)];
  const itemToAdd = tmpListe.splice(removedIndex, 1)[0];
  tmpListe.splice(addedIndex, 0, itemToAdd);

  const sortert = tmpListe.map((dokument, index) => {
    return dokument.id;
  });

  const antall = tmpListe.length;

  liste.docs.filter(filterFn).forEach((listeDok, index) => {
    const ordervalue = antall - sortert.indexOf(listeDok.id);
    listeDok.ref.set({ ordervalue }, { merge: true });
  });
};

export const sortOrdervalue = (dok1, dok2) => {
  const verdi1 = dok1.data().ordervalue || 0;
  const verdi2 = dok2.data().ordervalue || 0;
  return verdi2 - verdi1;
};

export const sorterAlfabetisk = (d1, d2) => {
  const d1Navn = d1.data().tekst || '';
  const d2Navn = d2.data().tekst || '';
  return d1Navn.localeCompare(d2Navn);
};
