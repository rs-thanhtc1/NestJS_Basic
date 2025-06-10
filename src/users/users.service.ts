import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto, RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
// import * as bcrypt from 'bcryptjs'
import { genSaltSync, hashSync, compareSync } from "bcryptjs";
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from './users.interface';
import aqp from 'api-query-params';

@Injectable()
export class UsersService {

  constructor(@InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>) { }

  getHashPassword = (password: string) => {
    const salt = genSaltSync(10);
    const hash = hashSync(password, salt);
    return hash;
  }

  async create(createUserDto: CreateUserDto, userCreate: IUser) {

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await this.userModel.findOne({ email: createUserDto.email });
    if (existingUser) {
      throw new BadRequestException('Email đã được sử dụng');
    }

    const hashPassword = this.getHashPassword(createUserDto.password);

    let user = await this.userModel.create({
      ...createUserDto,
      password: hashPassword,
      createdBy: {
        _id: userCreate._id,
        email: userCreate.email,
      },
    });
    return {
      _id: user?._id,
      createdAt: user?.createdAt
    };
  }

  async register(registerUserDto: RegisterUserDto) {

    const existingUser = await this.userModel.findOne({ email: registerUserDto.email });
    if (existingUser) {
      throw new BadRequestException(`Email: ${registerUserDto.email} đã được sử dụng để đăng ký`);
    }

    const hashPassword = this.getHashPassword(registerUserDto.password);

    let user = await this.userModel.create({
      email: registerUserDto.email,
      password: hashPassword,
      name: registerUserDto.name,
      age: registerUserDto.age,
      gender: registerUserDto.gender,
      address: registerUserDto.address,
      role: 'USER'
    })
    return user;
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs);
    delete filter.page
    delete filter.limit

    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.userModel.find(filter).select('-password')
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
      throw new NotFoundException('User không tồn tại');
    }

    const existingUser = this.userModel.findById(id);
    if (!existingUser) {
      throw new NotFoundException('User không tồn tại');
    }

    return this.userModel.findOne({
      _id: id
    }).select('-password');
  }

  findOneByUsername(username: string) {
    return this.userModel.findOne({
      email: username
    });
  }

  isValidPassword(password: string, hash: string) {
    return compareSync(password, hash)
  }

  async update(updateUserDto: UpdateUserDto, user: IUser) {
    return await this.userModel.updateOne(
      { _id: updateUserDto._id },
      {
        ...updateUserDto,
        updatedBy: {
          _id: user._id,
          email: user.email
        }
      })
  }

  async remove(id: string, user: IUser) {

    const existingUser = await this.userModel.findById(id);
    if (!existingUser) {
      throw new NotFoundException('User không tồn tại');
    }

    // Cập nhật deletedBy
    await this.userModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        }
      }
    );

    return this.userModel.softDelete({
      _id: id
    });
  }
}
