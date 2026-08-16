/**
 * WebAuthn Biometric Authentication Service (Fingerprint / Face ID / Touch ID / Windows Hello)
 * Uses the Web Authentication API (navigator.credentials) to register and authenticate users securely.
 */

export const BiometricAuthService = {
  /**
   * Check if biometric / platform authentication is supported by the device & browser
   */
  async isBiometricAvailable(): Promise<boolean> {
    if (!window.PublicKeyCredential) {
      return false;
    }

    try {
      if (typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        return available;
      }
      return true;
    } catch (err) {
      console.warn('Biometrics check error:', err);
      return false;
    }
  },

  /**
   * Register a new biometric credential for the user
   */
  async registerBiometrics(userId: string, userName: string): Promise<{ success: boolean; credentialId?: string; error?: string }> {
    if (!window.PublicKeyCredential) {
      return { success: false, error: 'התחברות ביומטרית אינה נתמכת בדפדפן זה' };
    }

    try {
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const userIdBytes = new Uint8Array(Array.from(userId).map((c) => c.charCodeAt(0)));

      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge,
        rp: {
          name: 'NutriTrack Israel',
          id: window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname,
        },
        user: {
          id: userIdBytes,
          name: userName,
          displayName: userName,
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' }, // ES256
          { alg: -257, type: 'public-key' }, // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform', // Fingerprint, FaceID, TouchID, Windows Hello
          userVerification: 'preferred',
          requireResidentKey: false,
        },
        timeout: 60000,
        attestation: 'none',
      };

      const credential = (await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions,
      })) as PublicKeyCredential;

      if (credential && credential.id) {
        return { success: true, credentialId: credential.id };
      }

      return { success: false, error: 'לא התקבל מזהה ביומטרי' };
    } catch (err: any) {
      console.warn('Biometric registration error:', err);
      if (err.name === 'NotAllowedError') {
        return { success: false, error: 'הפעולה בוטלה על ידי המשתמש' };
      }
      return { success: false, error: err.message || 'שגיאה בהפעלת חיישן טביעת האצבע' };
    }
  },

  /**
   * Authenticate / Login using Biometrics (Fingerprint / Face ID)
   */
  async authenticateBiometrics(credentialId?: string): Promise<{ success: boolean; error?: string }> {
    if (!window.PublicKeyCredential) {
      return { success: false, error: 'התחברות ביומטרית אינה נתמכת בדפדפן זה' };
    }

    try {
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
        challenge,
        timeout: 60000,
        rpId: window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname,
        userVerification: 'preferred',
        allowCredentials: credentialId
          ? [
              {
                id: new Uint8Array(Array.from(credentialId).map((c) => c.charCodeAt(0))),
                type: 'public-key',
                transports: ['internal'],
              },
            ]
          : undefined,
      };

      const assertion = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions,
      });

      if (assertion) {
        return { success: true };
      }

      return { success: false, error: 'אימות ביומטרי לא הושלם' };
    } catch (err: any) {
      console.warn('Biometric auth error:', err);
      if (err.name === 'NotAllowedError') {
        return { success: false, error: 'הפעולה בוטלה על ידי המשתמש' };
      }
      return { success: false, error: err.message || 'אימות ביומטרי נכשל' };
    }
  },
};
