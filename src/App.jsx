import React from 'react';
import AccuracyHeatmap from './AccuracyHeatmap';

// Import your JSON data
const jsonData = require('./response.json');

const App = () => {
    return (
        <div>
            <AccuracyHeatmap data={jsonData} />
        </div>
    );
};

export default App; 