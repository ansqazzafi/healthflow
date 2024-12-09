
import { IsString, IsEmail, IsNotEmpty, IsEnum} from 'class-validator';
import { roles } from 'enums/role.enum';
export class LoginInDTO {

    @IsEnum(roles)
    @IsNotEmpty()
    role: roles; 

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;

}
