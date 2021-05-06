import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
const { Storage } = require('@google-cloud/storage');

@Injectable()
export class FileUploadService {
  private storage;

  constructor(private configService: ConfigService) {
    const project = this.configService.get<string>('gcloud.projectId');
    this.storage = new Storage({ projectId: project });
  }

  public async uploadInvoice(file: Express.Multer.File): Promise<string> {
    const bucketName = this.configService.get<string>('gcloud.bucket');
    const bucket = this.storage.bucket(bucketName);
    const fileBlob = bucket.file(file.originalname);
    try {
      await new Promise<void>((resolve, reject) => {
        fileBlob
          .createWriteStream({})
          .on('error', (error: any) => {
            reject(error);
          })
          .on('finish', () => {
            resolve();
          })
          .end(file.buffer);
      });
      return `https://storage.cloud.google.com/${bucketName}/${fileBlob.name}`;
    } catch (error) {
      throw error;
    }
  }
}
