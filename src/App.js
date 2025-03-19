import React from 'react';
import AccuracyHeatmap from './components/AccuracyHeatmap';
import responseData from './data/response.json';

window.App = ({ data }) => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>DocAI Accuracy Report</h1>
      <AccuracyHeatmap data={data} />
    </div>
  );
}; 