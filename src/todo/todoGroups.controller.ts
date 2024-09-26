import { eq } from 'drizzle-orm';

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  Param,
  Post,
  Put,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { GetUserPayload } from 'src/auth/auth.decorators';
import { AuthGuard } from 'src/auth/auth.guard';
import { DatabaseService } from 'src/db/db';
import { todoGroups } from 'src/db/schema';
import { TodoGroupDTO } from 'src/DTOs/todoGroupDTO';
import { TokenPayload } from 'src/types/tokenPayload';

@Controller('api/TodoGroups')
@UseGuards(AuthGuard)
export class TodoGroupsController {
  private readonly logger = new Logger(TodoGroupsController.name); // NestJS logger

  constructor(private databaseService: DatabaseService) {}

  @Get()
  async getAll(@GetUserPayload() user: TokenPayload): Promise<TodoGroupDTO[]> {
    this.logger.log(`User ${user.uid} requested all todo groups`);

    const db = this.databaseService.getDb();

    const result = await db
      .select()
      .from(todoGroups)
      .where(eq(todoGroups.userId, user.uid));

    this.logger.log(`User ${user.uid} retrieved ${result.length} todo groups`);
    return result.map((x) => new TodoGroupDTO(x.name, x.id));
  }

  @Get(':id')
  async getOne(
    @GetUserPayload() user: TokenPayload,
    @Param('id') id: number,
  ): Promise<TodoGroupDTO> {
    this.logger.log(`User ${user.uid} requested todo group with ID ${id}`);

    const db = this.databaseService.getDb();
    const result = await db
      .select()
      .from(todoGroups)
      .where(eq(todoGroups.id, id));

    if (result.length == 0) {
      this.logger.error(
        `Todo group with ID ${id} not found for user ${user.uid}`,
      );
      throw new HttpException('TodoGroup not found', 404);
    }

    const group = result[0];
    if (group.userId != user.uid) {
      this.logger.warn(
        `User ${user.uid} unauthorized to access todo group ${id}`,
      );
      throw new HttpException('Unauthorized', 401);
    }

    this.logger.log(`User ${user.uid} retrieved todo group ${id}`);
    return new TodoGroupDTO(result[0].name, result[0].id);
  }

  @Post()
  async create(
    @GetUserPayload() user: TokenPayload,
    @Body() group: TodoGroupDTO,
  ): Promise<TodoGroupDTO> {
    this.logger.log(`User ${user.uid} is creating a new todo group`);

    const db = this.databaseService.getDb();
    const result = await db
      .insert(todoGroups)
      .values({ name: group.name, userId: user.uid })
      .returning({ insertedId: todoGroups.id });

    this.logger.log(
      `User ${user.uid} created a new todo group with ID ${result[0].insertedId}`,
    );
    return new TodoGroupDTO(group.name, result[0].insertedId);
  }

  @Put(':id')
  @HttpCode(204)
  async update(@Body() group: TodoGroupDTO, @Param('id') id: number) {
    this.logger.log(`Updating todo group with ID ${id}`);

    const db = this.databaseService.getDb();
    const result = await db
      .update(todoGroups)
      .set({ name: group.name, updatedAt: new Date() })
      .where(eq(todoGroups.id, id));

    if (result.rowCount == 0) {
      this.logger.error(`Todo group with ID ${group.id} not found`);
      return new HttpException('TodoGroup not found', 404);
    }

    this.logger.log(`Todo group with ID ${group.id} updated`);
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@GetUserPayload() user: TokenPayload, @Param('id') id: number) {
    this.logger.log(`User ${user.uid} is deleting todo group with ID ${id}`);

    const db = this.databaseService.getDb();
    const result = await db.delete(todoGroups).where(eq(todoGroups.id, id));

    if (result.rowCount == 0) {
      this.logger.error(`Todo group with ID ${id} not found`);
      throw new HttpException('TodoGroup not found', 404);
    }

    this.logger.log(`Todo group with ID ${id} deleted by user ${user.uid}`);
  }
}
