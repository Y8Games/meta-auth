# MetaAuth
Helper functions for handling authentication with [MetaMask](https://metamask.io) in socket.io or another io module.

## Usage
```
$ npm install meta-auth --save
```
Client side will look something like
```
var socket = io(window.location.href);
socket.on('connect', () => {
  var from = Wallet.getAddress();

  if (from) {
    socket.emit('auth/challenge', from);
  } else {
    console.log('no metamask found :c')
  }
});
socket.on('auth/challenge', (challenge) => {
  var from = Wallet.getAddress();
  const params = [challenge, from];
  const method = 'eth_signTypedData';

  web3.currentProvider.sendAsync({
    method,
    params,
    from
  }, async (err, result) => {
    if (err) { return console.error(err); }
    if (result.error) { return console.error(result.error); }
    var signature = result.result;

    socket.emit('auth/response', signature);
  });
});
socket.on('auth/result', (data) => {
  var from = Wallet.getAddress();
    if (data === from) {
      loggedIn = true;
      console.log('logged in')
    } else {
      loggedIn = false;
      console.log('login failed')
    }
});
```
Serverside, something like the following.

```
 createChallenge(address) {
    this.challenge = metaAuth.createChallenge(address)
    this.socket.emit('auth/challenge', this.challenge);
  }

  verifyChallenge(sig) {
    var recovered = metaAuth.checkChallenge(this.challenge[1].value, sig);
    this.socket.emit('auth/result', recovered);
  }
```

Parameter names may be changed when passing in an optional config.
```
const metaAuth = require('meta-auth')({
  message: 'msg',
  signature: 'sig',
  address: 'address'
});
```

### :MetaAddress
If MetaAuth finds `req.params.MetaAddress` set it will assign a challenge to the address. The challenge is located at `req.metaAuth.challenge`

### :MetaMessage & :MetaSignature
`:MetaMessage` is the previously issued challenge and `:MetaSignature` is the user's signature for the provided message. If the recovery address matches the address stored for the given challenge MetaAuth returns the recovery address. In the case of an error or no match `false` is returned.


### Config
```
const metaAuth = new MetaAuth({
  signature: 'MetaSignature',
  message: 'MetaMessage',
  address: 'MetaAddress',
  banner: 'Example Site Banner'
});
```

## Authors

* **Alex Sherbuck** - [I Gave](https://igave.io)


