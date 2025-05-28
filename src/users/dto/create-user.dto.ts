import { IsEmail, IsNotEmpty } from 'class-validator';

// dto -> data transfer object
export class CreateUserDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    password: string;
    
    name: string;
    address: string;
}
