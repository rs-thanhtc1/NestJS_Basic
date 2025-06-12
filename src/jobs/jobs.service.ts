import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { Job, JobDocument } from './schemas/job.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { IUser } from 'src/users/users.interface';
import mongoose from 'mongoose';
import aqp from 'api-query-params';

@Injectable()
export class JobsService {

  constructor(@InjectModel(Job.name) private jobModel: SoftDeleteModel<JobDocument>) { }

  async create(createJobDto: CreateJobDto, user: IUser) {
    const job = await this.jobModel.create(
      {
        ...createJobDto,
        isActive: true,
        createdBy: {
          _id: user._id,
          email: user.email,
        }
      })
    return {
      _id: job?._id,
      createdAt: job?.createdAt
    };
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs);
    delete filter.current
    delete filter.pageSize

    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.jobModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.jobModel.find(filter).select('-password')
      .skip(offset)
      .limit(defaultLimit)
      // @ts-ignore: Unreachable code error
      .sort(sort)
      .populate(population)
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

  findOne(id: string) {

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Job không tồn tại');
    }

    const existingJob = this.jobModel.findById(id);
    if (!existingJob) {
      throw new NotFoundException('Job không tồn tại');
    }

    return this.jobModel.findOne({ _id: id });
  }

  async update(id: string, updateJobDto: UpdateJobDto, user: IUser) {

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Job không tồn tại');
    }

    const existingJob = this.jobModel.findById(id);
    if (!existingJob) {
      throw new NotFoundException('Job không tồn tại');
    }

    return await this.jobModel.updateOne(
      { _id: id },
      {
        ...updateJobDto,
        updatedBy: {
          _id: user._id,
          email: user.email
        }
      }
    );
  }

  async remove(id: string, user: IUser) {

    const existingJob = this.jobModel.findById(id);
    if (!existingJob) {
      throw new NotFoundException('Job không tồn tại');
    }

    // Cập nhật deletedBy
    await this.jobModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        }
      }
    );

    return await this.jobModel.softDelete({ _id: id });
  }
}
