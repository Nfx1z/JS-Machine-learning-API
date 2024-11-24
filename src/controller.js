const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const tf = require('@tensorflow/tfjs-node');
const admin = require('firebase-admin');
require('dotenv').config();

// Variables from .env
const URL = process.env.FIREBASE_URL;

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(require('../key.json')),
    databaseURL: URL 
});

// connect to Firebase Firestore
const db = admin.firestore();

// function to load the TensorFlow.js model
let model;
async function loadModel() {
    if (!model) {
        model = await tf.loadLayersModel('../model/model.json');
    }
    return model;
}

// Function to predict image and save to Firestore
const predictImage = async (file) => {
    // to check if the file size is greater than 1 MB
    if (file.bytes > 1000000) {
        throw new Error('Payload content length greater than maximum allowed: 1000000');
    }

    // Load the TensorFlow.js model
    const model = await loadModel();

    // A temporary directory to store the uploaded file
    const filePath = path.join(__dirname, '..', 'uploads', file.hapi.filename);
    const fileStream = fs.createWriteStream(filePath);
    file.pipe(fileStream);
    
    // Wait for the file to be copied
    await new Promise((resolve, reject) => {
        fileStream.on('finish', resolve);
        fileStream.on('error', reject);
    });

    // Read the image file as a buffer and convert it to a TensorFlow.js tensor
    const imageBuffer = fs.readFileSync(filePath);
    const tensor = tf.node.decodeImage(imageBuffer)
        .resizeNearestNeighbor([224, 224])  // resize the image to 224x224 pixels
        .toFloat()
        .expandDims(0);

    // Normalize the image 
    const normalizedTensor = tensor.div(tf.scalar(255));

    // Predict the image using the TensorFlow.js model
    const predictions = await model.predict(normalizedTensor).data();
    const result = predictions[0] > 0.5 ? 'Cancer' : 'Non-cancer';

    // Create a unique ID for every prediction
    const predictionData = {
        id: uuidv4(),
        result: result,
        suggestion: result === 'Cancer' ? 'Segera periksa ke dokter!' : 'Penyakit kanker tidak terdeteksi.',
        createdAt: new Date().toISOString()
    };

    // Store the prediction data in Firestore
    const docRef = db.collection('predictions').doc(predictionData.id);
    await docRef.set(predictionData);

    return predictionData;
};

module.exports = {
    predictImage
};
