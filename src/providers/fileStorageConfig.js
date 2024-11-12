// Define global for browser environment
if (typeof global === 'undefined') {
    var global = window;
}

// Define process for browser environment
window.process = {
    env: {},
    version: '',
    versions: {},
    platform: ''
};

import { ethers } from 'ethers';
import Filestorage from '@skalenetwork/filestorage.js';

// Create a provider using ethers.providers.JsonRpcProvider
const provider = new ethers.JsonRpcProvider(import.meta.env.VITE_APP_RPC_URL);

console.log("Provider: ", import.meta.env.VITE_APP_RPC_URL);

// Initialize Filestorage with the provider
const filestorage = new Filestorage(provider);

const pk = '0x' + import.meta.env.VITE_APP_PRIVATE_KEY;
const account = import.meta.env.VITE_APP_PUBLIC_KEY;

export async function upload({ target }, specificDirectory = '') {
    // Get file from the target
    const file = target.files[0];
    if (!file) {
        throw new Error('No file selected');
    }

    // Provide your account & private key
    let privateKey = pk;

    // Define the file path in account tree (dirA/file.name)
    let filePath = specificDirectory === '' ? file.name : `${specificDirectory}/${file.name}`;

    // File storage method to upload file
    const reader = new FileReader();
    reader.onload = async function (e) {
        const arrayBuffer = reader.result;
        const bytes = new Uint8Array(arrayBuffer);
        let link = await filestorage.uploadFile(
            account,
            filePath,
            bytes,
            privateKey
        );
        console.log('File uploaded successfully:', link);
    };
    reader.readAsArrayBuffer(file);
}