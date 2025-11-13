const Base62 = (function() {
    const DEFAULT_B62_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    const base62 = {};
    let alphabet = DEFAULT_B62_ALPHABET;

    base62.encode = function(num) {
        const n = Number(num);
        if (!Number.isFinite(n)) throw new TypeError("b62num must be a finite number");
        if (!Number.isSafeInteger(n) || n < 0) throw new TypeError("b62num must be a non-negative safe integer");
        if (n === 0) return alphabet[0];
        
        let result = "";
        let v = n;
        while (v > 0) {
            result = alphabet[v % 62] + result;
            v = Math.floor(v / 62);
        }
        return result;
    };

    base62.decode = function(str) {
        if (!(typeof str === "string" || str instanceof String)) {
            throw new TypeError("b62str must be a string");
        }
        const chars = String(str);
        let acc = 0n;
        for (let i = 0; i < chars.length; i++) {
            const pos = alphabet.indexOf(chars[i]);
            if (pos === -1) throw new Error("Invalid base62 character");
            acc = acc * 62n + BigInt(pos);
        }
        if (acc > BigInt(Number.MAX_SAFE_INTEGER)) {
            throw new Error("Decoded value exceeds Number.MAX_SAFE_INTEGER");
        }
        return Number(acc);
    };

    base62.setAlphabet = function(newAlphabet) {
        if (!(typeof newAlphabet === "string" || newAlphabet instanceof String)) {
            throw new TypeError("Alphabet must be a string");
        }
        const chars = newAlphabet.split("");
        if (chars.length !== 62) throw new Error("Alphabet must be 62 characters long");
        const uniq = new Set(chars);
        if (uniq.size !== 62) throw new Error("You must use unique characters");
        alphabet = newAlphabet;
    };

    return base62;
})();
