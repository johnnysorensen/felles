import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import Popover from '@material-ui/core/Popover';
import NyRadForm from './NyRadFrom';

const LeggTilRad = ({ listeId, liste, lagNyRadFn, ordervalue = 999, disabled = false }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <IconButton
        edge="start"
        color="inherit"
        aria-label="Legg til rad"
        onClick={(event) => setAnchorEl(event.currentTarget)}
        disabled={disabled}
      >
        <AddCircleIcon />
      </IconButton>
      <Popover
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'center',
          horizontal: 'right',
        }}
      >
        <NyRadForm
          liste={liste}
          onSubmit={(formverdier) => {
            lagNyRadFn(listeId, liste, formverdier.radtekst, ordervalue);
          }}
          handleClose={handleClose}
        />
      </Popover>
    </div>
  );
};

export default LeggTilRad;
