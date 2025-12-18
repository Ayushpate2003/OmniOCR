
const sdk = require('node-appwrite');
const axios = require('axios');

module.exports = async function (req, res) {
  const client = new sdk.Client();
  const databases = new sdk.Databases(client);

  // Payload from Appwrite Storage event
  const payload = JSON.parse(req.variables['APPWRITE_FUNCTION_EVENT_DATA']);
  const fileId = payload.$id;

  client
    .setEndpoint(req.variables['APPWRITE_FUNCTION_ENDPOINT'])
    .setProject(req.variables['APPWRITE_FUNCTION_PROJECT_ID'])
    .setKey(req.variables['APPWRITE_FUNCTION_API_KEY']);

  try {
    // 1. Get the DB entry to find the selected engine
    const fileEntry = await databases.listDocuments('main_db', 'files', [
      sdk.Query.equal('fileId', fileId)
    ]);

    if (fileEntry.total === 0) throw new Error('File entry not found in DB');
    const engine = fileEntry.documents[0].ocrEngine;
    const userId = fileEntry.documents[0].userId;

    // 2. Trigger the FastAPI Microservice
    await axios.post('http://ocr-service:8000/ocr/process', {
      fileId: fileId,
      userId: userId,
      bucket: 'ocr-inputs',
      engine: engine
    });

    res.json({
      success: true,
      message: 'OCR Job Triggered'
    });
  } catch (err) {
    res.json({
      success: false,
      error: err.message
    });
  }
};
