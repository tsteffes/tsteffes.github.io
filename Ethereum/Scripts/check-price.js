    const https = require('https');
    const chalk = require('chalk');
    let ethPrice = 0;
    setInterval(() =>
    {		
      https.get('https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=BTC,USD', (resp) => {
        let data = ''; 
        resp.on('data', (chunk) => {
          data += chunk;
        });
        resp.on('end', () => {
          let result = JSON.parse(data);
          if (ethPrice == 0) ethPrice = result.USD;
          let diff = (result.USD - ethPrice).toFixed(2);
          ethPrice = result.USD;
          
          let diffString = (diff >= 0 ? chalk.green('+' + diff) : chalk.red(diff));
          let ethString = 'ETH $' + result.USD.toFixed(2) + ' (' + diffString + ')';
          let btcString = 'BTC $' + (result.USD / result.BTC).toFixed(2);
          let ratioString = 'Ratio ' + result.BTC.toFixed(5);
          
          console.log(ethString + ' / ' + btcString + ' / ' + ratioString);
        });
      }).on('error', (err) => {
      });
    }, 30000);
