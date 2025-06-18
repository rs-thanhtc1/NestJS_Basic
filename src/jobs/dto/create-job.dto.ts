import { Type } from 'class-transformer';
import { IsDate, IsEmail, IsNotEmpty, IsNotEmptyObject, IsObject, ValidateNested } from 'class-validator';
import mongoose from 'mongoose';

class Company {
    @IsNotEmpty()
    _id: mongoose.Schema.Types.ObjectId

    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    logo: string;
}

// dto -> data transfer object
export class CreateJobDto {

    @IsNotEmpty({ message: 'Name không được để trống' })
    name: string;

    @IsNotEmpty({ message: 'Skill không được để trống' })
    skills: string;

    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => Company)
    company: Company;

    @IsNotEmpty({ message: 'Salary không được để trống' })
    salary: number;

    @IsNotEmpty({ message: 'Quantity không được để trống' })
    quantity: number;

    @IsNotEmpty({ message: 'Level không được để trống' })
    level: string;

    @IsNotEmpty({ message: 'Description không được để trống' })
    description: string;

    @IsNotEmpty({ message: 'Location không được để trống' })
    location: string;

    @IsNotEmpty({ message: 'startDate không được để trống' })
    @IsDate({ message: 'startDate phải là ngày hợp lệ' })
    @Type(() => Date)
    startDate: Date;

    @IsNotEmpty({ message: 'endDate không được để trống' })
    @IsDate({ message: 'endDate phải là ngày hợp lệ' })
    @Type(() => Date)
    endDate: Date;
}
