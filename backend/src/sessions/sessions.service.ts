import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class SessionsService {
  handleAudioUpload(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No audio file provided. Expect field name "audio" with multipart/form-data.');
    }

    return {
      originalFilename: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path,
      status: 'received',
    };
  }
}
