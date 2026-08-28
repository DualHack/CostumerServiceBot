import mongoose from 'mongoose';
import env from './env.js';

export function connectDatabase() {
  return mongoose.connect(env.mongodbUri).then(function () {
    console.log('MongoDB conectado.');
  });
}

