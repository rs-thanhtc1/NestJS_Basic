import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateResumeDto, CreateUserCvDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { IUser } from 'src/users/users.interface';
import { Resume, ResumeDocument } from './schemas/resume.schema';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import mongoose from 'mongoose';
import aqp from 'api-query-params';
import { IsEmail } from 'class-validator';

@Injectable()
export class ResumesService {

  constructor(@InjectModel(Resume.name) private resumeModel: SoftDeleteModel<ResumeDocument>) { }

  async create(createResumeDto: CreateUserCvDto, user: IUser) {

    const resume = await this.resumeModel.create(
      {
        email: user.email,
        userId: user._id,
        ...createResumeDto,
        status: 'PENDING',
        history: [{
          status: "PENDING",
          updatedAt: new Date,
          updatedBy: {
            _id: user._id,
            email: user.email
          }
        }],
        createdBy: {
          _id: user._id,
          email: user.email,
        }
      })
    return {
      _id: resume?._id,
      createdAt: resume?.createdAt
    };
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs);
    delete filter.current
    delete filter.pageSize

    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.resumeModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.resumeModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      // @ts-ignore: Unreachable code error
      .sort(sort)
      .populate(population)
      .select(projection as any)
      .exec();

    return {
      meta: {
        current: currentPage, //trang hiện tại
        pageSize: limit, //số lượng bản ghi đã lấy
        pages: totalPages,  //tổng số trang với điều kiện query
        total: totalItems // tổng số phần tử (số bản ghi)
      },
      result //kết quả query
    }
  }

  async findOne(id: string) {
    return await this.resumeModel.findById(id);
  }

  async update(id: string, updateResumeDto: UpdateResumeDto, user: IUser) {

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Job không tồn tại');
    }

    const existingResume = this.resumeModel.findById(id);
    if (!existingResume) {
      throw new NotFoundException('Resume không tồn tại');
    }

    return await this.resumeModel.updateOne({ _id: id }, {
      ...updateResumeDto,
      $push: {
        history: {
          status: updateResumeDto.status,
          updatedAt: new Date,
          updatedBy: {
            _id: user._id,
            email: user.email
          }
        }
      }
      ,
      updatedBy: {
        _id: user._id,
        email: user.email
      }
    });
  }

  async findByUser(user: IUser) {
    return await this.resumeModel.find({ userId: user._id })
  }


  async remove(id: string, user: IUser) {

    const existingResume = this.resumeModel.findById(id);
    if (!existingResume) {
      throw new NotFoundException('Resume không tồn tại');
    }

    await this.resumeModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        }
      }
    );

    return await this.resumeModel.softDelete({ _id: id });
  }
}
