import React, { useState } from 'react';
import './App.css';
import "primereact/resources/primereact.min.css";
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { httpClient } from './HttpClient';

import Keycloak from 'keycloak-js';


let keycloak = new Keycloak({
  url: 'http://localhost:8080/',
  realm: 'Mission_Rent_Possible',
  clientId: 'reactlogin',
});

window.keycloak = keycloak;


keycloak.init({
  onLoad: ' ',
  checkLoginIframe: true,
  pkceMethod: 'S256',
}).then((auth) => {
  if (!auth) {
    window.location.reload();
  } else {
    console.info("Authenticated");
    console.log('auth', auth)
    console.log('Keycloak', keycloak)
    console.log('Access Token', keycloak.token)

    const { preferred_username, email } = keycloak.tokenParsed;
    console.log(preferred_username)
    console.log(email)

    httpClient.defaults.headers.common['Authorization'] = `Bearer ${keycloak.token}`;
    keycloak.onTokenExpired = () => {
      console.log('token expired')
    }
  }
}, () => {
  console.error("Authentication Failed");
});

function App() {

  const [infoMessage, setInfoMessage] = useState('');

  const callBackend = () => {
    httpClient.get('https://mockbin.com/request')

  };

  return (
      <div className="App">
        <div className='grid'>
          <div className='col-12'>
            <h1>My Secured React App</h1>
          </div>
        </div>
        <div className="grid">

        </div>

        <div className='grid'>
          <div className='col-1'></div>
          <div className='col-2'>
            <div className="col">
              <Button onClick={() => { setInfoMessage(keycloak.authenticated ? 'Authenticated: TRUE' : 'Authenticated: FALSE') }}
                      className="m-1 custom-btn-style"
                      label='Is Authenticated' />

              <Button onClick={() => { keycloak.login() }}
                      className='m-1 custom-btn-style'
                      label='Login'
                      severity="success" />

              <Button onClick={() => { setInfoMessage(keycloak.token) }}
                      className="m-1 custom-btn-style"
                      label='Show Access Token'
                      severity="info" />

              <Button onClick={() => { setInfoMessage(JSON.stringify(keycloak.tokenParsed)) }}
                      className="m-1 custom-btn-style"
                      label='Show Parsed Access token'
                      severity="warning" />

              <Button onClick={() => { setInfoMessage(keycloak.isTokenExpired(5).toString()) }}
                      className="m-1 custom-btn-style"
                      label='Check Token expired'
                      severity="info" />

              <Button onClick={() => { keycloak.updateToken(10).then((refreshed) => { setInfoMessage('Token Refreshed: ' + refreshed.toString()) }, (e) => { setInfoMessage('Refresh Error') }) }}
                      className="m-1 custom-btn-style"
                      label='Update Token (if about to expire)' />  {/** 10 seconds */}

              <Button onClick={callBackend}
                      className='m-1 custom-btn-style'
                      label='Send HTTP Request'
                      severity="success" />

              <Button onClick={() => { keycloak.logout({ redirectUri: 'http://localhost:3000/' }) }}
                      className="m-1 custom-btn-style"
                      label='Logout'
                      severity="danger" />

              <Button onClick={() => { setInfoMessage(keycloak.hasRealmRole('admin').toString()) }}
                      className="m-1 custom-btn-style"
                      label='has realm role "Admin"'
                      severity="info" />

              <Button onClick={() => { setInfoMessage(keycloak.hasResourceRole('test').toString()) }}
                      className="m-1 custom-btn-style"
                      label='has client role "test"'
                      severity="info" />

            </div>
          </div>
          <div className='col-6'>

            <Card>
              <p style={{ wordBreak: 'break-all' }} id='infoPanel'>
                {infoMessage}
              </p>
            </Card>
          </div>

          <div className='col-2'></div>
        </div>



      </div>
  );
}

export default App;