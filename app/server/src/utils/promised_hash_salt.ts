import * as HashSalt from "password-hash-and-salt";

// Wrap methods in Promise

export function hash_password (password: string): Promise<string> {

    return new Promise<string>((resolve, reject) => {
        HashSalt(password).hash((error, hashed_password) => {
            if (error) {
                reject(error);
            }
            else {
                resolve(hashed_password);
            }
        });
    });
}

export function verify_against (password: string, hash: string): Promise<boolean> {

    return new Promise<boolean>((resolve, reject) => {
        HashSalt(password).verifyAgainst(hash, (error, verified) => {
            if (error) {
                reject(error);
            }
            else {
                resolve(verified);
            }
        });
    });
}
