export const ikkeImplementert = (funksjon) => {
  alert(`${funksjon} er ikke implementert ennå.`);
};

export const isEscapePressed = (evt) => {
  var isEscape;
  if ('key' in evt) {
    isEscape = evt.key === 'Escape' || evt.key === 'Esc';
  } else {
    isEscape = evt.keyCode === 27;
  }
  return isEscape;
};
