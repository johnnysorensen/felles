import React from 'react';
import Liste from "./components/Liste/Liste";
import {Redirect, Route, Switch} from "react-router";
import Login from "./components/Login";
import Lister from "./components/Lister/Lister";
import {BrowserRouter} from "react-router-dom";

function App() {
    return (
        <div className="app-content">
            <BrowserRouter>
                <Switch>
                    <Route exact path="/" render={() => <Redirect to="/lister"/>}/>
                    <Route path="/login" component={Login}/>
                    <Route path="/lister" component={Lister}/>
                    <Route path="/liste/:liste" component={Liste}/>
                </Switch>
            </BrowserRouter>
        </div>
    );
}

export default App;
