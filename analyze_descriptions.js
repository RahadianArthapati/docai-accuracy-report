const fs = require('fs');
const path = require('path');

// Load response.json
const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'src', 'data', 'response.json'), 'utf8'));

// Extract all description fields and values
const descriptions = [];

// Function to calculate similarity (updated version from the HTML file)
const calculateSimilarity = (original, modified) => {
    if (!original || !modified) return 0;
    
    // Convert to lowercase and trim
    const orig = String(original).toLowerCase().trim();
    const mod = String(modified).toLowerCase().trim();
    
    // If exact match, return 100%
    if (orig === mod) return 100;
    
    // If modified is empty and original has value, consider it correct
    if (mod === '' && orig !== '') return 100;
    
    // Extract identifier (e.g., PLLB, YLPWB) from each string
    const origIdentifier = orig.match(/^([a-z0-9]+)/i);
    const modIdentifier = mod.match(/^([a-z0-9]+)/i);
    
    // If identifiers don't match, very low similarity
    if (origIdentifier && modIdentifier && 
        origIdentifier[0].toLowerCase() !== modIdentifier[0].toLowerCase()) {
        return 0; // Different identifiers means completely different entities
    }
    
    // Split into words for comparison
    const origWords = orig.split(/[\s-]+/).filter(w => w.length > 0);
    const modWords = mod.split(/[\s-]+/).filter(w => w.length > 0);
    
    // Count matching key terms
    const origSet = new Set(origWords);
    const modSet = new Set(modWords);
    
    // Find common words (excluding common words like "biaya", "dan", etc)
    const commonWords = new Set([
        'biaya', 'dan', 'untuk', 'dari', 'ke', 'di', 'a', 'the', 'and', 'or', 'of', 'in',
        'payment', 'term', 'pekerjaan', 'proyek', 'pembayaran'
    ]);
    
    let matchCount = 0;
    let totalKeyTerms = 0;
    
    // Count matches for key terms
    origSet.forEach(word => {
        if (word.length > 1 && !commonWords.has(word.toLowerCase())) {
            totalKeyTerms++;
            
            // Check for exact match first
            if (modSet.has(word)) {
                matchCount++;
            } else {
                // Check for partial matches (e.g., "equipment" and "equipment")
                for (const modWord of modSet) {
                    if (modWord.toLowerCase().includes(word.toLowerCase()) || 
                        word.toLowerCase().includes(modWord.toLowerCase())) {
                        if (modWord.length >= 4 && word.length >= 4) { // Only count meaningful partial matches
                            matchCount += 0.5; // Partial match
                            break;
                        }
                    }
                }
            }
        }
    });
    
    // Special words that are particularly important (e.g., percentages, specific terms)
    const origPercentage = orig.match(/(\d+)%/);
    const modPercentage = mod.match(/(\d+)%/);
    
    // Check for percentage match
    if (origPercentage && modPercentage && origPercentage[1] === modPercentage[1]) {
        matchCount += 1; // Bonus for matching percentages
        totalKeyTerms += 1;
    }
    
    // Check for special terms that indicate same type of work
    const keyTerms = ['kitchen', 'equipment', 'ducting', 'exhaust', 'cleaning', 'mep', 'retensi', 'instalasi', 'pelunasan'];
    
    keyTerms.forEach(term => {
        const origHasTerm = orig.includes(term);
        const modHasTerm = mod.includes(term);
        
        if (origHasTerm && modHasTerm) {
            matchCount += 0.5; // Bonus for matching key terms
            totalKeyTerms += 0.5;
        }
    });
    
    if (totalKeyTerms === 0) return 0;
    
    // Calculate base similarity percentage
    let similarity = (matchCount / totalKeyTerms) * 100;
    
    // Apply identifier matching bonus
    if (origIdentifier && modIdentifier && 
        origIdentifier[0].toLowerCase() === modIdentifier[0].toLowerCase()) {
        // Bonus for matching identifiers - more important than any other factor
        similarity = Math.min(similarity + 40, 100);
    }
    
    return similarity;
};

// Process each transaction
data.forEach((transaction, index) => {
    // Find Description in Header array
    const descriptionField = transaction.Header.find(field => field.name === 'Description');
    
    if (descriptionField && descriptionField.value) {
        const original = descriptionField.value.original;
        const modified = descriptionField.value.modified;
        
        if (original !== undefined || modified !== undefined) {
            const similarity = calculateSimilarity(original, modified);
            const isMatch = similarity >= 40; // Using our new threshold
            
            descriptions.push({
                original,
                modified,
                similarity,
                isMatch
            });
        }
    }
    
    // Check in Detail.Data
    transaction.Detail.forEach(detail => {
        detail.Data.forEach(field => {
            if (field.name === 'Description' && field.value) {
                const original = field.value.original;
                const modified = field.value.modified;
                
                if (original !== undefined || modified !== undefined) {
                    const similarity = calculateSimilarity(original, modified);
                    const isMatch = similarity >= 40; // Using our new threshold
                    
                    descriptions.push({
                        original,
                        modified,
                        similarity,
                        isMatch
                    });
                }
            }
        });
    });
});

// Analyze results
const totalDescriptions = descriptions.length;
const matchingDescriptions = descriptions.filter(d => d.isMatch).length;
const accuracy = (matchingDescriptions / totalDescriptions) * 100;

console.log(`Found ${totalDescriptions} description fields`);
console.log(`Matching descriptions: ${matchingDescriptions} (${accuracy.toFixed(1)}%)`);

// Group by similarity ranges
const ranges = {
    '0-20%': 0,
    '21-39%': 0, // Just below our threshold
    '40-59%': 0, // Just above our threshold
    '60-79%': 0,
    '80-100%': 0
};

descriptions.forEach(d => {
    if (d.similarity < 20) ranges['0-20%']++;
    else if (d.similarity < 40) ranges['21-39%']++;
    else if (d.similarity < 60) ranges['40-59%']++;
    else if (d.similarity < 80) ranges['60-79%']++;
    else ranges['80-100%']++;
});

console.log('\nSimilarity Distribution:');
Object.entries(ranges).forEach(([range, count]) => {
    const percentage = (count / totalDescriptions) * 100;
    console.log(`${range}: ${count} (${percentage.toFixed(1)}%)`);
});

// Print some examples from each range
console.log('\nExamples:');

// Helper to get examples from each range
const getExamplesInRange = (min, max, count = 3) => {
    return descriptions
        .filter(d => d.similarity >= min && d.similarity < max)
        .slice(0, count);
};

console.log('\n--- Low Similarity (0-40%) ---');
[...getExamplesInRange(0, 20), ...getExamplesInRange(20, 40)].forEach(d => {
    console.log(`Original: "${d.original}"`);
    console.log(`Modified: "${d.modified}"`);
    console.log(`Similarity: ${d.similarity.toFixed(1)}%\n`);
});

console.log('\n--- Medium Similarity (40-59%) ---');
getExamplesInRange(40, 60).forEach(d => {
    console.log(`Original: "${d.original}"`);
    console.log(`Modified: "${d.modified}"`);
    console.log(`Similarity: ${d.similarity.toFixed(1)}%\n`);
});

console.log('\n--- High Similarity (60%+) ---');
[...getExamplesInRange(60, 80), ...getExamplesInRange(80, 101)].forEach(d => {
    console.log(`Original: "${d.original}"`);
    console.log(`Modified: "${d.modified}"`);
    console.log(`Similarity: ${d.similarity.toFixed(1)}%\n`);
});

// Special check for YLPWB and PLLB examples
const testExamples = [
    {
        original: "YLPWB - Pengadaan kitchen equipment YLPWB - Biaya instalasi",
        modified: "YLPWB Biaya Pelunasan Kitchen Equipment 50%"
    },
    {
        original: "PLLB - Pengadaan kitchen equipment PLLB - Biaya instalasi",
        modified: "PLLB Biaya Pelunasan Kitchen Equipment 50%"
    }
];

console.log('\n--- Test Examples ---');
testExamples.forEach(example => {
    const similarity = calculateSimilarity(example.original, example.modified);
    const isMatch = similarity >= 40;
    
    console.log(`Original: "${example.original}"`);
    console.log(`Modified: "${example.modified}"`);
    console.log(`Similarity: ${similarity.toFixed(1)}% (${isMatch ? 'MATCH' : 'NO MATCH'})\n`);
}); 