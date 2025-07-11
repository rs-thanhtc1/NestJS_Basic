import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, ParseFilePipeBuilder, HttpStatus } from '@nestjs/common';
import { FilesService } from './files.service';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public, ResponseMessage } from 'src/decorator/customize';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('files')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) { }

  @Public()
  @Post('upload')
  @ResponseMessage('Upload file success')
  @UseInterceptors(FileInterceptor('fileUpload')) //tên field sử dụng trong form-data
  uploadFile(@UploadedFile(
    new ParseFilePipeBuilder()
      .addFileTypeValidator({
        fileType: /\.(jpg|jpeg|png|gif)$/i,
      })
      .addMaxSizeValidator({
        maxSize: 1024 * 1024
      })
      .build({
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
      }),

  ) file: Express.Multer.File) {
    console.log('Original file name:', file.originalname);
    return {
      fileName: file.filename
    }
  }


  @Get()
  findAll() {
    return this.filesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.filesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFileDto: UpdateFileDto) {
    return this.filesService.update(+id, updateFileDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.filesService.remove(+id);
  }
}
