import {firestore} from "../index";
import {COLLECTION_LISTE, COLLECTION_LISTER} from "./konstanter";
import moment from "moment";

export const opprettNyRad = (listeId, nytekst, edit = false, aktiv = true) => {
    const tekst = nytekst.trim();
    firestore.collection(`${COLLECTION_LISTER}/${listeId}/${COLLECTION_LISTE}`)
        .add({tekst, utfoert: false, edit, aktiv, opprettet: moment.now()})
        .catch(err => {
            throw new Error('Klarte ikke legge til ny rad. ' + err);
        });
};
