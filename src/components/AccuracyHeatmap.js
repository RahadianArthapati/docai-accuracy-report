window.AccuracyHeatmap = ({ data }) => {
    const { vendorAccuracies, fields } = calculateAccuracies(data);

    const getColorIntensity = (accuracy) => {
        return `rgba(0, 128, 0, ${accuracy / 100})`;
    };

    const getAccuracy = (fieldAccuracies, field) => {
        if (!fieldAccuracies || !fieldAccuracies[field] || !fieldAccuracies[field].accuracy) {
            return 0;
        }
        return fieldAccuracies[field].accuracy;
    };

    const tableStyle = {
        borderCollapse: 'collapse',
        width: '100%',
        marginTop: '20px'
    };

    const cellStyle = {
        border: '1px solid #ddd',
        padding: '8px',
        textAlign: 'center'
    };

    const headerStyle = Object.assign({}, cellStyle, {
        backgroundColor: '#f4f4f4',
        fontWeight: 'bold'
    });

    return (
        <table style={tableStyle}>
            <thead>
                <tr>
                    <th style={headerStyle}>Vendor</th>
                    {fields.map(field => (
                        <th key={field} style={headerStyle}>{field}</th>
                    ))}
                    <th style={headerStyle}>Transaction</th>
                </tr>
            </thead>
            <tbody>
                {Object.entries(vendorAccuracies).map(([vendor, fieldAccuracies]) => (
                    <tr key={vendor}>
                        <td style={cellStyle}>{vendor}</td>
                        {fields.map(field => {
                            const accuracy = getAccuracy(fieldAccuracies, field);
                            return (
                                <td 
                                    key={`${vendor}-${field}`} 
                                    style={Object.assign({}, cellStyle, {
                                        backgroundColor: getColorIntensity(accuracy)
                                    })}
                                >
                                    {accuracy.toFixed(1)}%
                                </td>
                            );
                        })}
                        <td style={cellStyle}>{fieldAccuracies.transactionCount}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}; 