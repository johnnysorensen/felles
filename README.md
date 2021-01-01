This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Finne riktig konigurasjon for applikajsonen

* Gå til https://console.firebase.google.com/u/0/project/felles/overview
-> project settings
-> Your apps / web apps / Firebase SDK snippet / config
  
  Lim inn riktig verdier i fila .env.

## Deploy
### Installer Firbase CLI
`npm install -g firebase-tools`

### Login 
`firebase login` (og klikk på lenken som vises)

### Gjør deploy
`firebase deploy --only hosting`

