'use strict';
import bigInt from "big-integer";

/**
 * RSA hash function reference implementation.
 * Uses BigInteger.js https://github.com/peterolson/BigInteger.js
 * Code originally based on https://github.com/kubrickology/Bitcoin-explained/blob/master/RSA.js
 *
 * @namespace
 */
let RSA = {};

/**
 * Generates a k-bit RSA public/private key pair
 * https://en.wikipedia.org/wiki/RSA_(cryptosystem)#Code
 *
 * @param   {keysize} int, bitlength of desired RSA modulus n (should be even)
 * @returns {array} Result of RSA generation (object with three bigInt members: n, e, d)
 */
RSA.generate = function (keysize) {
    /**
     * Generates a random k-bit prime greater than √2 × 2^(k-1)
     *
     * @param   {bits} int, bitlength of desired prime
     * @returns {bigInt} a random generated prime
     */
    function random_prime(bits) {
        let min = bigInt(6074001000).shiftLeft(bits-33); // min ≈ √2 × 2^(bits - 1)
        let max = bigInt.one.shiftLeft(bits).minus(1);   // max = 2^(bits) - 1
        while (true) {
            let p = bigInt.randBetween(min, max);  // WARNING: not a cryptographically secure RNG!
            if (p.isProbablePrime(256)) return p;
        } 
    }

    // set up letiables for key generation
    let e = bigInt(65537),         // use fixed public exponent
        p, q, lambda;

    // generate p and q such that λ(n) = lcm(p − 1, q − 1) is coprime with e and |p-q| >= 2^(keysize/2 - 100)
    do {
        p = random_prime(keysize / 2);
        q = random_prime(keysize / 2);
        lambda = bigInt.lcm(p.minus(1), q.minus(1));
    } while (bigInt.gcd(e, lambda).notEquals(1) || p.minus(q).abs().shiftRight(keysize/2-100).isZero());

    return {
    	n: p.multiply(q),   // public key (part I)
        e: e,               // public key (part II)
        d: e.modInv(lambda), // private key d = e^(-1) mod λ(n)
        p: p, 
        q: q
    };
};

RSA.generateED = function (p, q) {
 

  let e;

  let lambda = bigInt.lcm(p.minus(1), q.minus(1));
  do {
      e = bigInt.randBetween(3, lambda);
  } while (bigInt.gcd(e, lambda).notEquals(1) || bigInt%2 === 0);

  return {
    n: p.multiply(q),   // public key (part I)
      e: e,               // public key (part II)
      d: e.modInv(lambda), // private key d = e^(-1) mod λ(n)
      p: p, 
      q: q
  };
};

/**
 * Encrypt
 *
 * @param   {m} int / bigInt: the 'message' to be encoded
 * @param   {n} int / bigInt: n value returned from RSA.generate() aka public key (part I)
 * @param   {e} int / bigInt: e value returned from RSA.generate() aka public key (part II)
 * @returns {bigInt} encrypted message
 */
RSA.encrypt = function(m, n, e){
	return bigInt(m).modPow(e, n);   
};

/**
 * Decrypt
 *
 * @param   {c} int / bigInt: the 'message' to be decoded (encoded with RSA.encrypt())
 * @param   {d} int / bigInt: d value returned from RSA.generate() aka private key
 * @param   {n} int / bigInt: n value returned from RSA.generate() aka public key (part I)
 * @returns {bigInt} decrypted message
 */
RSA.decrypt = function(c, d, n){
	return bigInt(c).modPow(d, n);   
};

let    = RSA.generate(256);
let keys = []
for(var i=0; i<10; i++){
  keys.push(RSA.generateED(keys1.p, keys1.q));
}
let data = 69;
let enc = data;
for (var i=0; i< keys.length; i++){
  enc = RSA.encrypt(enc, keys[i].n, keys[i].e);
}

function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}
keys = shuffle(keys);

let out = enc;
console.log(out);
for (var i=keys.length-1; i>=0; i--){
  out = RSA.decrypt(out, keys[i].d, keys[i].n);
}
console.log(out);