import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

export default function DatasetChart({data}){
  if(!data || data.length===0) return <div>No chart data</div>;

  // data is array of {timestamp, pm25}
  const chartData = data.map((d,i)=>({name: d.timestamp || `#${i+1}`, pm25: Number(d.pm25)}));

  return (
    <div style={{width: '100%', height: 250}}>
      <ResponsiveContainer>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="pm25" stroke="#ff7300" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
