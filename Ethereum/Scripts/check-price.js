const https = require('https');

setInterval(() =>
{		
  https.get('https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=BTC,USD', (resp) => {
    let data = ''; 
    resp.on('data', (chunk) => {
    data += chunk;
    });
    resp.on('end', () => {
      let result = JSON.parse(data);
      console.log('Eth price: $' + result.USD + ' / ' + result.BTC + ' BTC');
    });
  }).on('error', (err) => {
    console.log('Error: ' + err.message);
  });
}, 2000);