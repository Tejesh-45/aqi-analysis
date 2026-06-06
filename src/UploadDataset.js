import React, { useState } from 'react';
import Papa from 'papaparse';

// Simple PM2.5 AQI category based on US EPA breakpoints
function pm25Category(value) {
  const v = Number(value);
  if (isNaN(v)) return 'unknown';
  if (v <= 12) return 'Good';
  if (v <= 35.4) return 'Moderate';
  if (v <= 55.4) return 'Unhealthy for Sensitive Groups';
  if (v <= 150.4) return 'Unhealthy';
  if (v <= 250.4) return 'Very Unhealthy';
  return 'Hazardous';
}

export default function UploadDataset() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  const analyze = rows => {
    // Expect rows with fields: pm25 or PM2.5 or pm2_5
    const values = rows.map(r => {
      return r.pm25 ?? r['PM2.5'] ?? r.pm2_5 ?? r.pm2dot5 ?? '';
    }).map(v => Number(v)).filter(n => !isNaN(n));

    if (values.length === 0) {
      setError('No PM2.5 values found in dataset. Include a `pm25` column.');
      setSummary(null);
      return;
    }

    const avg = values.reduce((a,b)=>a+b,0)/values.length;
    const max = Math.max(...values);
    const categories = values.reduce((acc,v)=>{
      const c = pm25Category(v);
      acc[c] = (acc[c]||0)+1;
      return acc;
    },{});

    setSummary({count: values.length, avg: avg.toFixed(2), max, categories});
    setError('');
  }

  const handleFile = e => {
    const file = e.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: results => {
        analyze(results.data);
      },
      error: err => setError(String(err))
    });
  }

  return (
    <div className="upload-dataset">
      <h2>Upload AQI Dataset (CSV)</h2>
      <input type="file" accept=".csv,application/vnd.ms-excel" onChange={handleFile} />
      {error && <div className="error">{error}</div>}
      {summary && (
        <div className="summary">
          <p><b>Rows:</b> {summary.count}</p>
          <p><b>Average PM2.5:</b> {summary.avg} µg/m³</p>
          <p><b>Max PM2.5:</b> {summary.max} µg/m³</p>
          <p><b>Category counts:</b></p>
          <ul>
            {Object.entries(summary.categories).map(([k,v])=> (
              <li key={k}>{k}: {v}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
