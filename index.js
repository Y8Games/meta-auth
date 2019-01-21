const NodeCache = require('node-cache');
const ethUtil = require('ethereumjs-util');
const sigUtil = require('eth-sig-util');
const uuidv4 = require('uuid/v4');
const crypto = require('crypto');

const secret = uuidv4();
let cache = new NodeCache({
  stdTTL: 600
});

class MetaAuth {
  constructor(options) {
    const DEFAULT_OPTIONS = {
      signature: 'MetaSignature',
      message: 'MetaMessage',
      address: 'MetaAddress',
      banner: '*** WARNING *** Ask the site to change the default banner *** WARNING ***'
    }

    this.options = Object.assign(
      DEFAULT_OPTIONS,
      options
    )

    this.createChallenge = this.createChallenge.bind(this);
    this.checkChallenge = this.checkChallenge.bind(this);
  }

  createChallenge(address) {
    const hash = crypto.createHmac('sha256', secret)
      .update(address + uuidv4())
      .digest('hex');

    cache.set(address.toLowerCase(), hash);

    const challenge = [{
      type: 'string',
      name: 'banner',
      value: this.options.banner
    }, {
      type: 'string',
      name: 'challenge',
      value: hash
    }];

    return challenge;
  }

  checkChallenge(challenge, sig) {
    const data = [{
      type: 'string',
      name: 'banner',
      value: this.options.banner
    }, {
      type: 'string',
      name: 'challenge',
      value: challenge
    }];
    const recovered = sigUtil.recoverTypedSignature({
      data,
      sig
    });

    const storedChallenge = cache.get(recovered.toLowerCase());

    if (storedChallenge === challenge) {
      cache.del(recovered);
      return recovered;
    }

    return false;
  }
}


module.exports = MetaAuth;
