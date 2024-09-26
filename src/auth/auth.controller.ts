import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  Post,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { DatabaseService } from 'src/db/db';
import { NewUser, users } from 'src/db/schema';
import { RegisterDTO } from 'src/DTOs/registerDto';
import { UserDTO } from 'src/DTOs/UserDTO';
import { EncryptionService } from './encryption.service';
import { eq } from 'drizzle-orm';
import { LoginDTO } from 'src/DTOs/LoginDTO';
import { JwtService } from '@nestjs/jwt';
import { TokenResult } from 'src/types/TokenResult';
import { TokenPayload } from 'src/types/tokenPayload';
import { AuthGuard } from './auth.guard';
import { GetUserPayload } from './auth.decorators';
import { console } from 'inspector';

@Controller('api/UserAccount')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private dbService: DatabaseService,
    private encryptionService: EncryptionService,
    private jwtService: JwtService,
  ) {}

  @Post('register')
  @HttpCode(204)
  async register(@Body() register: RegisterDTO) {
    this.logger.log(`Registering user: ${register.userName}`);

    let result = await this.dbService
      .getDb()
      .select()
      .from(users)
      .where(eq(users.userName, register.userName));

    if (result.length > 0) {
      this.logger.warn(
        `User with username ${register.userName} already exists`,
      );
      throw new HttpException('UserName already exists', 400);
    }

    result = await this.dbService
      .getDb()
      .select()
      .from(users)
      .where(eq(users.email, register.email));

    if (result.length > 0) {
      this.logger.warn(`User with email ${register.email} already exists`);
      throw new HttpException('Email already exists', 400);
    }

    const hashedPass = await this.encryptionService.hashPassword(
      register.password,
    );
    const user: NewUser = {
      email: register.email,
      userName: register.userName,
      firstName: register.firstName,
      lastName: register.lastName,
      passwordHash: hashedPass,
    };

    this.logger.debug(`Creating user: ${JSON.stringify(user)}`);

    try {
      const res = await this.dbService.getDb().insert(users).values(user);
      this.logger.log(`User registered successfully: ${register.userName}`);
      return;
    } catch (err: any) {
      this.logger.error(`Error registering user: ${err.message}`, err.stack);
      throw new HttpException('Something went wrong', 400);
    }
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() loginData: LoginDTO) {
    this.logger.log(`Attempting login for email: ${loginData.email}`);
    const result = await this.dbService
      .getDb()
      .select()
      .from(users)
      .where(eq(users.email, loginData.email));

    if (result.length == 0) {
      this.logger.warn(
        `Login failed: User with email ${loginData.email} not found`,
      );
      throw new HttpException('User not found', 400);
    }

    const user = result[0];

    if (
      await this.encryptionService.comparePassword(
        loginData.password,
        user.passwordHash,
      )
    ) {
      const payload: TokenPayload = {
        uid: user.id,
        email: user.email,
      };

      const token = await this.jwtService.sign(payload);
      this.logger.log(`User logged in: ${loginData.email}`);

      return new TokenResult(token);
    } else {
      this.logger.warn(
        `Login failed: Incorrect password for email ${loginData.email}`,
      );
      throw new HttpException('Wrong password', 400);
    }
  }

  @UseGuards(AuthGuard)
  @Get('me')
  async getUser(@GetUserPayload() user: TokenPayload) {
    this.logger.log(`Fetching details for user ID: ${user.uid}`);

    const users_db = await this.dbService
      .getDb()
      .select()
      .from(users)
      .where(eq(users.id, user.uid));

    if (users_db.length == 0) {
      this.logger.warn(`User not found with ID: ${user.uid}`);
      throw new HttpException('User not found', 400);
    }

    const user_db = users_db[0];
    this.logger.log(`Returning details for user ID: ${user.uid}`);
    return new UserDTO(
      user_db.userName,
      user_db.email,
      user_db.firstName,
      user_db.lastName,
    );
  }

  @UseGuards(AuthGuard)
  @Get('all')
  async getAll(@GetUserPayload() user: TokenPayload): Promise<UserDTO[]> {
    this.logger.log(`Fetching all users, requested by user ID: ${user.uid}`);

    const allUsers = await this.dbService.getDb().select().from(users);
    this.logger.log(`Returning ${allUsers.length} users`);

    return allUsers.map((user) => {
      return {
        userName: user.userName,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      };
    });
  }
}
