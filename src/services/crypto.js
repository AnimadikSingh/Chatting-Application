// Utility to convert ArrayBuffer to Base64 string
export const arrayBufferToBase64 = (buffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
};

// Utility to convert Base64 string to ArrayBuffer
export const base64ToArrayBuffer = (base64) => {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
};

// Generate ECDH Key Pair (P-256)
export const generateKeyPair = async () => {
    return await window.crypto.subtle.generateKey(
        {
            name: "ECDH",
            namedCurve: "P-256",
        },
        true,
        ["deriveKey", "deriveBits"]
    );
};

// Export Public Key to JWK (for sending to server/peer)
export const exportPublicKey = async (key) => {
    return await window.crypto.subtle.exportKey("jwk", key);
};

// Import Public Key from JWK
export const importPublicKey = async (jwk) => {
    return await window.crypto.subtle.importKey(
        "jwk",
        jwk,
        {
            name: "ECDH",
            namedCurve: "P-256",
        },
        true,
        []
    );
};

// Derive Shared AES-GCM Key
export const deriveSecretKey = async (privateKey, publicKey) => {
    return await window.crypto.subtle.deriveKey(
        {
            name: "ECDH",
            public: publicKey,
        },
        privateKey,
        {
            name: "AES-GCM",
            length: 256,
        },
        true,
        ["encrypt", "decrypt"]
    );
};

// Encrypt Message
export const encryptMessage = async (text, secretKey) => {
    const enc = new TextEncoder();
    const encoded = enc.encode(text);

    // IV must be unique for every message
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    const cipherText = await window.crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv,
        },
        secretKey,
        encoded
    );

    return {
        cipherText: arrayBufferToBase64(cipherText),
        iv: arrayBufferToBase64(iv)
    };
};

// Decrypt Message
export const decryptMessage = async (cipherTextB64, ivB64, secretKey) => {
    const cipherText = base64ToArrayBuffer(cipherTextB64);
    const iv = base64ToArrayBuffer(ivB64);

    try {
        const decrypted = await window.crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: iv,
            },
            secretKey,
            cipherText
        );

        const dec = new TextDecoder();
        return dec.decode(decrypted);
    } catch (e) {
        console.error("Decryption failed", e);
        return "[Decryption Failed]";
    }
};

// Compute Public Key Fingerprint (SAS)
// Returns format: A1B2 · C3D4 · E5F6 · G7H8
export const computeFingerprint = async (publicKeyJwk) => {
    // We use the coordinates to ensure consistency
    const { x, y } = publicKeyJwk;
    const canonicalString = `${x}|${y}`;
    const enc = new TextEncoder();
    const data = enc.encode(canonicalString);

    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));

    // Take first 8 bytes for a short readable hash
    const shortHash = hashArray.slice(0, 8);

    // Convert to hex groups
    let fingerprint = '';
    for (let i = 0; i < shortHash.length; i += 2) {
        const byte1 = shortHash[i].toString(16).padStart(2, '0').toUpperCase();
        const byte2 = shortHash[i + 1].toString(16).padStart(2, '0').toUpperCase();
        if (fingerprint) fingerprint += ' · ';
        fingerprint += `${byte1}${byte2}`;
    }

    return fingerprint;
};
