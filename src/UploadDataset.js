import React, { useState } from 'react';
import Papa from 'papaparse';
import DatasetChart from './DatasetChart';

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
  const [rows, setRows] = useState([]);

  const analyze = rows => {
    // Collect common pollutant columns if available
    const pollutants = ['pm25','pm10','o3','no2','so2','co'];
    const found = {};
    pollutants.forEach(p => found[p] = []);

    rows.forEach(r => {
      pollutants.forEach(p => {
        let val;
        if (r[p] !== undefined && r[p] !== '') {
          val = r[p];
        } else if (r[p.toUpperCase()] !== undefined) {
          val = r[p.toUpperCase()];
        } else if (p === 'pm25' && r['PM2.5'] !== undefined) {
          val = r['PM2.5'];
        } else {
          val = r[p];
        }

        const n = Number(val);
        if (!isNaN(n)) found[p].push(n);
      });
    });

    // Prepare summary
    const counts = Object.fromEntries(pollutants.map(p=>[p, found[p].length]));
    if (counts.pm25 === 0) {
      setError('No PM2.5 values found in dataset. Include a `pm25` column.');
      setSummary(null);
      return;
    }

    const stats = {};
    pollutants.forEach(p => {
      if (found[p].length > 0) {
        const avg = found[p].reduce((a,b)=>a+b,0)/found[p].length;
        stats[p] = {count: found[p].length, avg: Number(avg.toFixed(2)), max: Math.max(...found[p])};
      }
    });

    const categories = found.pm25.reduce((acc,v)=>{
      const c = pm25Category(v);
      acc[c] = (acc[c]||0)+1;
      return acc;
    },{});

    setSummary({stats, categories});
    setRows(rows);
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
          <h3>Pollutant summary</h3>
          <ul>
            {Object.entries(summary.stats).map(([p,s])=> (
              <li key={p}><b>{p}</b>: rows {s.count}, avg {s.avg} {p==='o3'||p==='no2'||p==='so2'||p==='co'? 'ppm':'µg/m³'}, max {s.max}</li>
            ))}
          </ul>
          <h4>PM2.5 category counts</h4>
          <ul>
            {Object.entries(summary.categories).map(([k,v])=> (
              <li key={k}>{k}: {v}</li>
            ))}
          </ul>
          <p>Example CSV: <a href="/site/example-aqi.csv" target="_blank" rel="noreferrer">Download</a></p>
        </div>
      )}
      {rows && rows.length>0 && (
        <div style={{marginTop: 12}}>
          <h4>PM2.5 Time Series</h4>
          <DatasetChart data={rows.map(r=>({timestamp: r.timestamp || r.time || '', pm25: r.pm25 ?? r['PM2.5'] ?? r.pm2_5 }))} />
        </div>
      )}
    </div>
  );
}
