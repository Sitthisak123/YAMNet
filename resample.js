import path from 'path';
import ffmpeg from 'fluent-ffmpeg';

const getAudioSampleRate = (inputFile) => {
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

const compressAudio = (inputFile, outputFile) => {
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

const main = async () => {
    try {
        const inputFile = "_assets/sampleAudio/Meow-noise.mp3";
        const inputFile2 = "_assets/sampleAudio/Meow-noise-02.mp3";
        const dir_name = path.dirname(inputFile);
        const file_name = path.parse(inputFile).name;
        const outputFile = `${dir_name}\\${file_name}-02.mp3`;

        // Check sample rate of input file
        const sampleRate = await getAudioSampleRate(inputFile2);
        console.log(`Input file sample rate: ${sampleRate} Hz`);

        // Compress the audio
        await compressAudio(inputFile, outputFile);
    } catch (err) {
        console.error("An error occurred:", err);
    }
};

main();
