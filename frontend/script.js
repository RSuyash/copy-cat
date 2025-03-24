const API_URL = 'http://localhost:8000';

async function analyzeText() {
    const text = document.getElementById('inputText').value;
    const style = document.getElementById('styleSelect').value;
    
    try {
        const response = await fetch(`${API_URL}/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content: text, style: style })
        });
        
        const data = await response.json();
        displayResults(data);
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while analyzing the text.');
    }
}

async function generateText() {
    const text = document.getElementById('inputText').value;
    const style = document.getElementById('styleSelect').value;
    
    try {
        const response = await fetch(`${API_URL}/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content: text, style: style })
        });
        
        const data = await response.json();
        displayResults(data);
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while generating text.');
    }
}

function displayResults(data) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `
        <h2>Results</h2>
        <pre>${JSON.stringify(data, null, 2)}</pre>
    `;
}
