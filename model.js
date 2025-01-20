import * as tf from '@tensorflow/tfjs-node';
import fetch from 'node-fetch';
import { readFile } from 'fs/promises';
import audioDecode from 'audio-decode';
import path from 'path';
import wavefile from 'wavefile';
import ffmpeg from 'fluent-ffmpeg';


async function runModel() {

    /* // Load the model from the TensorFlow Hub.
    const modelUrl = 'https://www.kaggle.com/models/google/yamnet/TfJs/tfjs/1';
    const model = await tf.loadGraphModel(modePath, { fromTFHub: true });
    */

    // Load the model from the local file system.
    const modePath = 'file://_models/yamnet/model.json';
    const model = await tf.loadGraphModel(modePath, { fromTFHub: false });

    // Load and decode the audio file.

    const audioName = 'Meow-noise.mp3';
    const audioPath = '_assets/sampleAudio/' + audioName;
    const audioOutputPath = '_assets/resampled/' + audioName;


    // Check sample rate of input file
    /*
    const sampleRate = await getAudioSampleRate(inputFile2);
    console.log(`Input file sample rate: ${sampleRate} Hz`);
    */
    await compressAudio(audioPath);

    const audioBuffer = await readFile(audioOutputPath);

    const audioData = await audioDecode(audioBuffer);

    // Convert the audio data to a tensor.
    // const waveform = tf.tensor(audioData._channelData[0]);
    const waveform = tf.tensor(audioData._channelData[0]);
    // const waveform = tf.zeros([16000 * 3]);

    // Perform prediction using the loaded model.
    const [scores, embeddings, spectrogram] = model.predict(waveform);

    // Print the results (remove verbose argument).
    scores.print();
    embeddings.print();
    spectrogram.print();
    scores.mean(0).print(); // Prints average scores for all 521 classes

    // Find the class with the highest mean score across all frames.
    const classIndex = scores.mean(0).argMax().dataSync()[0];

    // Read JSON file
    const classMapPath = '_models/YAMNet/yamnet_class_map.json';
    const classMap = JSON.parse(await readFile(classMapPath, 'utf8'));

    // Get the class name from the class map
    const className = classMap[classIndex].display_name;

    console.log(`Predicted class: ${className}`);
}

runModel();

function compressAudio(inputFile) {
    const file_name = path.parse(inputFile).name;
    const file_ext = path.parse(inputFile).ext;
    const outputFile = `_assets/resampled/${file_name}${file_ext}`;

    return new Promise((resolve, reject) => {
        ffmpeg(inputFile)
            .audioFrequency(16000)
            .on('end', () => {
                console.log("Audio compressed successfully");
                resolve();
            })
            .on('error', (err) => {
                reject(err);
            })
            .save(outputFile);
    });
};


function getAudioSampleRate(inputFile) {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(inputFile, (err, metadata) => {
            if (err) {
                reject(err);
            } else {
                // Retrieve sample rate from metadata
                const sampleRate = metadata.streams[0]?.sample_rate;
                resolve(sampleRate);
            }
        });
    });
};