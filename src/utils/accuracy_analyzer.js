// Make it globally available
window.calculateAccuracies = (data) => {
    const fields = [
        'CompanyID', 'BrandID', 'OutletID', 'VendorName', 
        'Currency', 'BankAccountNumber', 'InvoiceNumber',
        'InvoiceDate', 'Description', 'ServicePrice', 'GoodsPrice'
    ];

    const vendorAccuracies = {};

    // Process each transaction
    data.forEach(transaction => {
        const vendorName = transaction.Header.VendorName;
        
        if (!vendorAccuracies[vendorName]) {
            vendorAccuracies[vendorName] = {
                transactionCount: 0
            };
            fields.forEach(field => {
                vendorAccuracies[vendorName][field] = {
                    correct: 0,
                    total: 0,
                    accuracy: 0
                };
            });
        }

        vendorAccuracies[vendorName].transactionCount++;

        // Process header fields
        ['CompanyID', 'BrandID', 'OutletID', 'VendorName', 'Currency', 'BankAccountNumber'].forEach(field => {
            const fieldData = vendorAccuracies[vendorName][field];
            fieldData.total++;
            
            if (transaction.Header[field] === transaction.Header[`${field}Ground`]) {
                fieldData.correct++;
            }
            
            fieldData.accuracy = (fieldData.correct / fieldData.total) * 100;
        });

        // Process detail fields
        transaction.Detail.forEach(detail => {
            ['InvoiceNumber', 'InvoiceDate', 'Description', 'ServicePrice', 'GoodsPrice'].forEach(field => {
                const fieldData = vendorAccuracies[vendorName][field];
                fieldData.total++;
                
                if (detail[field] === detail[`${field}Ground`]) {
                    fieldData.correct++;
                }
                
                fieldData.accuracy = (fieldData.correct / fieldData.total) * 100;
            });
        });
    });

    return { vendorAccuracies, fields };
}; 