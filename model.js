import * as tf from '@tensorflow/tfjs-node';


/*
// Load the model from the TensorFlow Hub.
const modelUrl = 'https://www.kaggle.com/models/google/yamnet/TfJs/tfjs/1';
const model = await tf.loadGraphModel(modePath, { fromTFHub: true });
*/

// Load the model from the local file system.
const modePath = 'file://.models/yamnet/model.json';
const model = await tf.loadGraphModel(modePath, { fromTFHub: false });

// Create a waveform tensor filled with zeros (3 seconds of audio at 16kHz).
const waveform = tf.zeros([16000 * 3]);

// Perform prediction using the loaded model.
const [scores, embeddings, spectrogram] = model.predict(waveform);

// Print the results (remove verbose argument).
scores.print();         // shape [N, 521]
embeddings.print();     // shape [N, 1024]
spectrogram.print();    // shape [M, 64]

// Find the class with the highest mean score across all frames.
scores.mean(0).argMax().print(); // Should print 494 (Silence).
