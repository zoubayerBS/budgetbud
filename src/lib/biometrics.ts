// Basic WebAuthn wrapper for client-side biometric gating
// Note: In a production app, challenge generation and verification MUST happen on the server.
// This implementation provides the UI flow and device authentication status.

export const isBiometricSupported = async (): Promise<boolean> => {
    if (!window.PublicKeyCredential) return false;
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
};

export const registerBiometric = async () => {
    if (!window.PublicKeyCredential) throw new Error("WebAuthn not supported");

    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    // Create credentials
    const credential = await navigator.credentials.create({
        publicKey: {
            challenge,
            rp: {
                name: "BudgetBud",
                id: window.location.hostname
            },
            user: {
                id: Uint8Array.from("USER_ID", c => c.charCodeAt(0)),
                name: "user@budgetbud.app",
                displayName: "BudgetBud User"
            },
            pubKeyCredParams: [{ alg: -7, type: "public-key" }],
            authenticatorSelection: {
                authenticatorAttachment: "platform",
                userVerification: "required"
            },
            timeout: 60000,
            attestation: "none"
        }
    });

    return credential;
};

export const verifyBiometric = async () => {
    if (!window.PublicKeyCredential) throw new Error("WebAuthn not supported");

    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const credential = await navigator.credentials.get({
        publicKey: {
            challenge,
            rpId: window.location.hostname,
            userVerification: "required",
            timeout: 60000
        }
    });

    return !!credential;
};
