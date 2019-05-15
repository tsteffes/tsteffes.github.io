const https = require('https');
const chalk = require('chalk');

const options = {
  diffThreshold: 0.25,
  url: 'https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=BTC,USD',
  checkPeriod: 5000
};
let oldPrice = 0;
let onError = (err) => {};
let logResult = (oldPrice, result) => {
  let diff = (result.USD - oldPrice).toFixed(2);
  if (Math.abs(diff) >= options.diffThreshold)
  {
    let diffString = (diff >= 0 ? chalk.green('+' + diff) : chalk.red(diff));
    let ethString = 'ETH $' + result.USD.toFixed(2) + ' (' + diffString + ')';
    let btcString = 'BTC $' + (result.USD / result.BTC).toFixed(2);
    let ratioString = 'Ratio ' + result.BTC.toFixed(5);
    let time = chalk.yellow((new Date()).toLocaleTimeString('en-US'));
    console.log(time + ' ' + ethString + ' / ' + btcString + ' / ' + ratioString);
    return true;
  }
  
  return false;
};
let parseResult = (data) => {
  try {
    return JSON.parse(data);
  }
  catch (e) {
    return null;
  }
};

let onResponse = (resp) => {
  let data = ''; 
  resp.on('data', (chunk) => {
    data += chunk;
  });
  resp.on('end', () => {
    let result = parseResult(data);
    if (result)
    {
      oldPrice = oldPrice == 0 ? result.USD : oldPrice;
      if (logResult(oldPrice, result))
      {
        oldPrice = result.USD;
      }
    }
  });
};

let check = () => https.get(options.url, onResponse).on('error', onError);
setInterval(check, options.checkPeriod);