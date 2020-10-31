import React, {useEffect, useReducer, useRef, useState} from 'react';
import Autocomplete from "@material-ui/lab/Autocomplete";
import {IconButton, TextField} from "@material-ui/core";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import CancelIcon from '@material-ui/icons/Cancel';
import {isEscapePressed} from "../../utils/metoder";
import css from './NyRadForm.module.scss';
import {isEmpty} from 'lodash';

const NyRadForm = ({liste, onSubmit, handleClose}) => {
    const reducer = (state, action) => {
        if (action.type === 'SET_FORMVERDIER') {
            return {...state, [action.feltnavn]: action.verdi};
        }
    }
    const [formverdier, dispatch] = useReducer(reducer, {}, undefined);

    const setFormverdi = (feltnavn, verdi, debug = undefined) => {
        dispatch({type: 'SET_FORMVERDIER', feltnavn, verdi, debug});
    };

    const [skalSubmittes, setSkalSubmittes] = useState(false);
    const [erSubmittet, setErSubmettet] = useState(false);

    const inputRef = useRef(null);

    useEffect(() => {
        if (!skalSubmittes) {
            inputRef.current.firstChild.children[1].firstChild.focus();
        } else if (!erSubmittet && skalSubmittes && !isEmpty(formverdier)) {
            onSubmit(formverdier);
            setErSubmettet(true);
        }
    }, [erSubmittet, formverdier, onSubmit, skalSubmittes]);

    return (
        <div className={css.container}>
            <Autocomplete
                className={css.autocomplete}
                ref={inputRef}
                freeSolo
                fullWidth={true}
                options={((liste && liste.docs) || [])
                    .filter(dokument => dokument.id !== 'dummydokument')
                    .map((dokument) => dokument.data().tekst)
                    .sort((t1, t2) => t1.toLowerCase().localeCompare(t2.toLowerCase()))}
                renderInput={(params) => (
                    <TextField {...params} label="Skriv / velg" margin="normal" variant="outlined"/>
                )}
                onBlur={event => {
                    setFormverdi('radtekst', event.target.value);
                }}
                onChange={(event, tekst) => {
                    setFormverdi('radtekst', tekst);
                    setSkalSubmittes(true);
                    handleClose();
                }}
                onKeyDown={(event) => {
                    if (isEscapePressed(event || window.event)) {
                        event.preventDefault();
                        handleClose();
                    } else if (event.key === 'Enter') {
                        event.preventDefault();
                        setSkalSubmittes(true);
                        handleClose();
                    }
                }}
            />
            <IconButton
                color="primary"
                aria-label="Legg til rad"
                onClick={() => {
                    setSkalSubmittes(true);
                    handleClose();
                }}
            >
                <CheckCircleIcon/>
            </IconButton>
            <IconButton
                color="secondary"
                aria-label="angre"
                onClick={handleClose}
            >
                <CancelIcon/>
            </IconButton>
        </div>
    );
}

export default NyRadForm;
