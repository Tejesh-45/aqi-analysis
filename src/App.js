import React from 'react';

import SearchCities from './SearchCities';
import UploadDataset from './UploadDataset';
import './App.css';

function App() {
  return (
    <div className="App">
      <h1>Know Air Quality Index(AQI)</h1>
      <div style={{display: 'flex', gap: 40, alignItems: 'flex-start'}}>
        <div style={{flex: 1}}>
          <SearchCities />
        </div>
        <div style={{width: 380}}>
          <UploadDataset />
        </div>
      </div>
    </div>
  );
}

export default App;
