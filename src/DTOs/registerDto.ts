import { IsEmail, IsNotEmpty } from 'class-validator';

export class RegisterDTO {
  @IsNotEmpty()
  userName: string;
  @IsNotEmpty()
  @IsEmail()
  email: string;
  @IsNotEmpty()
  password: string;
  @IsNotEmpty()
  firstName: string;
  @IsNotEmpty()
  lastName: string;

  constructor(
    userName: string,
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ) {
    this.userName = userName;
    this.email = email;
    this.password = password;
    this.firstName = firstName;
    this.lastName = lastName;
  }
}
