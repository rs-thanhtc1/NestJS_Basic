import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { IUser } from 'src/users/users.interface';
import { Permission, PermissionDocument } from './schemas/permission.schema';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';

@Injectable()
export class PermissionsService {

  constructor(@InjectModel(Permission.name) private permissionModel: SoftDeleteModel<PermissionDocument>) { }

  async create(createPermissionDto: CreatePermissionDto, user: IUser) {

    const { apiPath, method } = createPermissionDto

    const existed = await this.permissionModel.findOne({ apiPath, method })

    if (existed) {
      throw new BadRequestException(`Permission với apiPath "${apiPath}" và method "${method}" đã tồn tại.`);
    }

    const permission = await this.permissionModel.create(
      {
        ...createPermissionDto,
        createdBy: {
          _id: user._id,
          email: user.email,
        }
      })
    return {
      _id: permission?._id,
      createdAt: permission?.createdAt
    };
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs);
    delete filter.current
    delete filter.pageSize

    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.permissionModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.permissionModel.find(filter)
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

    const existing = this.permissionModel.findById(id);
    if (!existing) {
      throw new NotFoundException('permission không tồn tại');
    }

    return await this.permissionModel.findById(id);
  }

  async update(id: string, updatePermissionDto: UpdatePermissionDto, user: IUser) {
    return await this.permissionModel.updateOne({ _id: id }, { ...updatePermissionDto });
  }

  async remove(id: string, user: IUser) {
    const existing = this.permissionModel.findById(id);
    if (!existing) {
      throw new NotFoundException('permission không tồn tại');
    }

    await this.permissionModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        }
      }
    );

    return await this.permissionModel.softDelete({ _id: id });
  }
}
