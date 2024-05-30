const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const port = 9876;
const windowSize = 10;
let numberWindow = [];

const apiEndpoints = {
  p: 'http : / / 20.244.56.144/ test/primes',
  f: 'http : / / 20.244.56.144/ test/fibo',
  e: 'http : / / 20.244.56.144/ test/even',
  r: 'http : / / 20.244.56.144/ test/ rand',
};

async function fetchNumbers(type) {
  try {
    const response = await axios.get(apiEndpoints[type], { timeout: 500 });
    return response.data.numbers;
  } catch (error) {
    return [];
  }
}

function calculateAverage(numbers) {
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  return sum / numbers.length;
}

app.use(express.static(path.join(__dirname, '../public')));

app.get('/numbers/:numberId', async (req, res) => {
  const numberId = req.params.numberId;

  if (!['p', 'f', 'e', 'r'].includes(numberId)) {
    return res.status(400).json({ error: 'Invalid number ID' });
  }

  const newNumbers = await fetchNumbers(numberId);

  const uniqueNewNumbers = newNumbers.filter((num) => !numberWindow.includes(num));
  const previousState = [...numberWindow];

  numberWindow = [...numberWindow, ...uniqueNewNumbers].slice(-windowSize);

  const average = calculateAverage(numberWindow);

  res.json({
    windowPrevState: previousState,
    windowCurrState: numberWindow,
    numbers: newNumbers,
    avg: average.toFixed(2),
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});