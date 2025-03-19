import React from 'react';
import { analyzeAccuracyByVendor } from './accuracy_analyzer';

const AccuracyHeatmap = ({ data }) => {
    const results = analyzeAccuracyByVendor(data);
    
    // Sort vendors by name for consistent display
    results.sort((a, b) => a.vendorName.localeCompare(b.vendorName));
    
    // Define fields for X-axis
    const fields = [
        'CompanyID', 'BrandID', 'OutletID', 'VendorName', 
        'Currency', 'BankAccountNumber', 'InvoiceNumber',
        'InvoiceDate', 'Description', 'ServicePrice', 'GoodsPrice'
    ];
    
    const getColorForAccuracy = (accuracy) => {
        // Convert accuracy to a green shade
        const intensity = Math.floor((accuracy / 100) * 255);
        return `rgb(${255-intensity}, ${255}, ${255-intensity})`;
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Accuracy Heatmap by Vendor and Field</h2>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                    <thead>
                        <tr>
                            <th style={{ padding: '8px', border: '1px solid #ddd', background: '#f5f5f5' }}>
                                Vendor (Transactions)
                            </th>
                            {fields.map(field => (
                                <th key={field} style={{ 
                                    padding: '8px', 
                                    border: '1px solid #ddd',
                                    background: '#f5f5f5',
                                    minWidth: '100px'
                                }}>
                                    {field}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {results.map(vendor => (
                            <tr key={vendor.vendorName}>
                                <td style={{ 
                                    padding: '8px', 
                                    border: '1px solid #ddd',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {vendor.vendorName} ({vendor.transactionCount})
                                </td>
                                {fields.map(field => (
                                    <td key={field} style={{
                                        padding: '8px',
                                        border: '1px solid #ddd',
                                        background: getColorForAccuracy(vendor.accuracies[field]),
                                        textAlign: 'center'
                                    }}>
                                        {vendor.accuracies[field].toFixed(1)}%
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AccuracyHeatmap; 