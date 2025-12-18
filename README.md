
# OmniOCR SaaS - Production OCR System

A professional-grade Document Extraction system using a modern distributed architecture.

## 🚀 Deployment Strategy

### 1. Backend: Appwrite Setup
1. Deploy Appwrite via Docker: `docker run -it --rm ... appwrite/appwrite`
2. Create Project: `omni-ocr-prod`
3. Create Storage Buckets: `ocr-inputs`, `ocr-outputs`
4. Create Database `main_db` and Collections:
   - `files`: `fileId(string)`, `userId(string)`, `fileName(string)`, `fileSize(integer)`, `fileType(string)`, `ocrEngine(string)`, `status(string)`, `createdAt(datetime)`
   - `logs`: `fileId(string)`, `level(string)`, `message(string)`, `createdAt(datetime)`
   - `api_keys`: `userId(string)`, `provider(string)`, `encryptedKey(string)`, `createdAt(datetime)`
5. Set permissions to `Role:all` for Create (on files) and `Role:member` for others.

### 2. OCR Service (FastAPI)
The OCR service runs as a separate container. It leverages `python-doctr` which requires heavy ML dependencies. 
- **Dependencies**: `opencv-python`, `torch`, `torchvision`, `tensorflow` (depending on doctr backend), `tesseract-ocr`.
- **Resources**: Recommended 4GB RAM + 2 CPUs minimum.

### 3. Appwrite Function
Deploy the `ocr_trigger` function and set its event to `storage.files.create`.

### 4. Frontend (Next.js)
The frontend uses the Appwrite Web SDK for real-time status tracking and secure authentication.

## 🔒 Security
- **API Keys**: Stored in Appwrite Database with AES encryption.
- **Access Control**: Users can only see files where `userId` matches their session.
- **Networking**: OCR Service is isolated in the Docker network and only accessible by Appwrite Functions.

## 🛠 Tech Stack
- **UI**: Next.js 14, Tailwind, Lucide Icons
- **Backend API**: FastAPI (Python)
- **Engines**: docTR (PyTorch/TF), Tesseract, Mistral AI
- **Infrastructure**: Appwrite (BaaS), Docker
