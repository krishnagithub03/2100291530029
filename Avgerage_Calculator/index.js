const express = require('express');
const axios = require('axios');

const app = express();
const port = 8000;

const WINDOW_SIZE = 10;
const TEST_SERVER_URL = 'http://20.244.56.144/test/primes';

let numbersWindow = [];


app.use(express.json());

const fetchNumbers = async (numberId) => {
    try {
        const response = await axios.get(`${TEST_SERVER_URL}/${numberId}`, { timeout: 500 });
        return response.data.numbers || [];
    } catch (error) {
        return [];
    }
};

const updateWindow = (newNumbers) => {
    for (const number of newNumbers) {
        if (!numbersWindow.includes(number)) {
            if (numbersWindow.length >= WINDOW_SIZE) {
                numbersWindow.shift();
            }
            numbersWindow.push(number);
        }
    }
};

const calculateAverage = (numbers) => {
    if (numbers.length === 0) return 0;
    const sum = numbers.reduce((acc, val) => acc + val, 0);
    return sum / numbers.length;
};

app.get('/numbers/:numberid', async (req, res) => {
    const numberId = req.params.numberid;
    if (!['p', 'f', 'e', 'r'].includes(numberId)) {
        return res.status(400).json({ error: 'Invalid id' });
    }

    const newNumbers = await fetchNumbers(numberId);
    const previousWindow = [...numbersWindow];

    updateWindow(newNumbers);
    const currentWindow = [...numbersWindow];
    const average = calculateAverage(currentWindow);

    res.json({
        numbers: newNumbers,
        windowPrevState : previousWindow,
        windowCurrState : currentWindow,
        avg : average
    });
});

app.listen(port, () => {
    console.log(`app running at http://localhost:${port}`);
});
