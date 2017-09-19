    const https = require('https');
    const chalk = require('chalk');
    let curPrice = 0;
    setInterval(() =>
    {		
      https.get('https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=BTC,USD', (resp) => {
        let data = ''; 
        resp.on('data', (chunk) => {
          data += chunk;
        });
        resp.on('end', () => {
          let result = JSON.parse(data);
          if (curPrice == 0) curPrice = result.USD;
          let diff = (result.USD - curPrice).toFixed(2);
          if (diff != 0)
          {
            curPrice = result.USD;
            console.log('Eth price: $' + result.USD.toFixed(2) + ' / ' + result.BTC.toFixed(5) + ' BTC ' + (diff > 0 ? chalk.green('+' + diff) : diff < 0 ? chalk.red(diff) : ''));
          }
        });
      });
    }, 30000);
