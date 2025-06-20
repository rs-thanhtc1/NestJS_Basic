import { IsArray, IsBoolean, IsMongoId, IsNotEmpty } from "class-validator";
import mongoose from "mongoose";

export class CreateRoleDto {
    @IsNotEmpty({ message: 'name không được để trống' })
    name: string;

    @IsNotEmpty({ message: 'description không được để trống' })
    description: string;

    @IsNotEmpty({ message: 'isActive không được để trống' })
    @IsBoolean({ message: 'isActive có kiểu boolean' })
    isActive: boolean;

    @IsNotEmpty({ message: 'module không được để trống' })
    @IsMongoId({ each: true, message: 'each permisson là mongo object id' })
    @IsArray({ message: 'permissions là array' })
    permissions: mongoose.Schema.Types.ObjectId[];
}
