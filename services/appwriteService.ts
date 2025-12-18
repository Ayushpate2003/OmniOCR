
import { Client, Account, Databases, Storage, ID, Query } from 'appwrite';
import { OCRFile, OCREngine, OCRStatus, OCRLog } from '../types';

const APPWRITE_ENDPOINT = 'http://localhost/v1';
const APPWRITE_PROJECT_ID = 'omni-ocr-prod';
const DB_ID = 'main_db';
const FILES_COLLECTION = 'files';
const LOGS_COLLECTION = 'logs';
const KEYS_COLLECTION = 'api_keys';
const INPUT_BUCKET = 'ocr-inputs';
const OUTPUT_BUCKET = 'ocr-outputs';

const client = new Client();
let isAppwriteAvailable = false;

try {
    client.setEndpoint(APPWRITE_ENDPOINT).setProject(APPWRITE_PROJECT_ID);
    isAppwriteAvailable = true;
} catch (e) {
    console.warn("Appwrite endpoint not configured. Falling back to Local Storage mode.");
}

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

const getLocalFiles = (): OCRFile[] => JSON.parse(localStorage.getItem('ocr_files') || '[]');
const saveLocalFiles = (files: OCRFile[]) => localStorage.setItem('ocr_files', JSON.stringify(files));
const getLocalLogs = (fileId: string): OCRLog[] => JSON.parse(localStorage.getItem(`logs_${fileId}`) || '[]');
const saveLocalLog = (fileId: string, log: OCRLog) => {
    const logs = getLocalLogs(fileId);
    logs.push(log);
    localStorage.setItem(`logs_${fileId}`, JSON.stringify(logs));
};

const getUserId = async () => {
    try {
        const user = await account.get();
        return user.$id;
    } catch {
        return 'public-guest-id';
    }
};

export const uploadFile = async (file: File, engine: OCREngine) => {
    const userId = await getUserId();
    const fileId = ID.unique();
    const createdAt = new Date().toISOString();

    const newFile: OCRFile = {
        $id: fileId,
        userId: userId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        ocrEngine: engine,
        status: OCRStatus.QUEUED,
        createdAt: createdAt
    };

    const files = getLocalFiles();
    files.unshift(newFile);
    saveLocalFiles(files);

    saveLocalLog(fileId, {
        $id: ID.unique(),
        fileId: fileId,
        level: 'info',
        message: `Job queued for processing with engine: ${engine}`,
        createdAt: new Date().toISOString()
    });

    if (isAppwriteAvailable) {
        try {
            await storage.createFile(INPUT_BUCKET, fileId, file);
            await databases.createDocument(DB_ID, FILES_COLLECTION, ID.unique(), {
                fileId, userId, fileName: file.name, fileSize: file.size, 
                fileType: file.type, ocrEngine: engine, status: OCRStatus.QUEUED, createdAt
            });
        } catch (e) {
            console.error("Appwrite upload failed", e);
        }
    }

    return newFile;
};

export const updateFileStatus = async (id: string, status: OCRStatus, result?: string) => {
    const files = getLocalFiles();
    const fileIndex = files.findIndex(f => f.$id === id);
    if (fileIndex > -1) {
        files[fileIndex].status = status;
        saveLocalFiles(files);
        
        if (result) {
            localStorage.setItem(`result_${id}`, result);
        }
        
        let message = `Status updated to ${status}`;
        if (status === OCRStatus.COMPLETED) message = `Status updated to completed (Text extracted)`;
        if (status === OCRStatus.FAILED) message = `Status updated to failed`;
        if (status === OCRStatus.CANCELLED) message = `Status updated to cancelled by user`;

        saveLocalLog(id, {
            $id: ID.unique(),
            fileId: id,
            level: status === OCRStatus.FAILED || status === OCRStatus.CANCELLED ? 'error' : 'info',
            message: message,
            createdAt: new Date().toISOString()
        });
    }
};

export const cancelJob = async (fileId: string) => {
    await updateFileStatus(fileId, OCRStatus.CANCELLED);
};

export const getFiles = async (): Promise<OCRFile[]> => {
    return getLocalFiles();
};

export const getLogs = async (fileId: string): Promise<OCRLog[]> => {
    return getLocalLogs(fileId);
};

export const getDownloadUrl = (fileId: string) => {
    const localResult = localStorage.getItem(`result_${fileId}`);
    if (localResult) {
        const blob = new Blob([localResult], { type: 'text/plain' });
        return URL.createObjectURL(blob);
    }
    return '';
};

export const saveApiKey = async (provider: string, key: string) => {
    const userId = await getUserId();
    const entry = { userId, provider, encryptedKey: key, createdAt: new Date().toISOString() };
    localStorage.setItem(`key_${provider}`, key);
    return entry;
};
