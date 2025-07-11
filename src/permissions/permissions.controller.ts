import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { ResponseMessage, User } from 'src/decorator/customize';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('permissions')
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) { }

  @Post()
  @ResponseMessage('Create a new permission')
  create(@Body() createPermissionDto: CreatePermissionDto, @User() user) {
    return this.permissionsService.create(createPermissionDto, user);
  }

  @Get()
  @ResponseMessage('Fetch permissions with paginate')
  findAll(
    @Query("current") currentPage: string, // -> const currentPage: string = req.query.page
    @Query("pageSize") limit: string,       // -> const limit: string = req.query.limit
    @Query() qs: string
  ) {
    return this.permissionsService.findAll(+currentPage, +limit, qs);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.permissionsService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Update a permission')
  update(@Param('id') id: string, @Body() updatePermissionDto: UpdatePermissionDto, @User() user) {
    return this.permissionsService.update(id, updatePermissionDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @User() user) {
    return this.permissionsService.remove(id, user);
  }
}
