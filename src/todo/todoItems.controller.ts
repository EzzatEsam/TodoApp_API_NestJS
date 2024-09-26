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
import { and, eq } from 'drizzle-orm';
import { GetUserPayload } from 'src/auth/auth.decorators';
import { AuthGuard } from 'src/auth/auth.guard';
import { DatabaseService } from 'src/db/db';
import { todoGroups, todoItems } from 'src/db/schema';
import { TodoItemDTO } from 'src/DTOs/todoItemDTO';
import { TokenPayload } from 'src/types/tokenPayload';

@Controller('api/TodoItems')
@UseGuards(AuthGuard)
export class TodoItemsController {
  private readonly logger = new Logger(TodoItemsController.name);

  constructor(private databaseService: DatabaseService) {}

  @Get('ParentGroup/:id')
  async getAll(
    @GetUserPayload() user: TokenPayload,
    @Param('id') groupId: number,
  ): Promise<TodoItemDTO[]> {
    this.logger.log(`Fetching all todo items for group ${groupId}`);
    const db = this.databaseService.getDb();

    const group = await db
      .select()
      .from(todoGroups)
      .where(eq(todoGroups.id, groupId));
    if (group.length == 0) {
      this.logger.warn(`Group ${groupId} not found for user ${user.uid}`);
      throw new HttpException('Group not found', 404);
    }
    if (group[0].userId != user.uid) {
      this.logger.warn(
        `Unauthorized access attempt by user ${user.uid} on group ${groupId}`,
      );
      throw new HttpException('Unauthorized', 401);
    }

    const result = await db
      .select()
      .from(todoItems)
      .where(eq(todoItems.groupId, groupId));

    let results: TodoItemDTO[] = [];

    result.forEach((element) => {
      const itemDto: TodoItemDTO = {
        createdDate: element.createdAt,
        ...element,
      };
      results.push(itemDto);
    });

    this.logger.log(
      `Fetched ${results.length} todo items for group ${groupId}`,
    );
    return results;
  }

  @Get(':id')
  async getOne(
    @GetUserPayload() user: TokenPayload,
    @Param('id') id: number,
  ): Promise<TodoItemDTO> {
    this.logger.log(`Fetching todo item with id ${id} for user ${user.uid}`);
    const db = this.databaseService.getDb();

    const result = await db
      .select()
      .from(todoItems)
      .innerJoin(todoGroups, eq(todoItems.groupId, todoGroups.id))
      .where(and(eq(todoItems.id, id), eq(todoGroups.userId, user.uid)));

    if (result.length > 0) {
      const item = result[0].todo_items;
      const returnVal: TodoItemDTO = {
        createdDate: item.createdAt,
        ...item,
      };
      this.logger.log(`Found todo item with id ${id} for user ${user.uid}`);
      return returnVal;
    }

    this.logger.error(`Todo item with id ${id} not found for user ${user.uid}`);
    throw new HttpException('TodoItem not found', 404);
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@GetUserPayload() user: TokenPayload, @Param('id') id: number) {
    this.logger.log(`Deleting todo item with id ${id} for user ${user.uid}`);
    const db = this.databaseService.getDb();

    const group = await db
      .select()
      .from(todoGroups)
      .where(eq(todoGroups.id, id));
    if (group.length == 0) {
      this.logger.warn(`Group ${id} not found for user ${user.uid}`);
      throw new HttpException('Group not found', 404);
    }
    if (group[0].userId != user.uid) {
      this.logger.warn(
        `Unauthorized delete attempt by user ${user.uid} on group ${id}`,
      );
      throw new HttpException('Unauthorized', 401);
    }

    const result = await db
      .delete(todoItems)
      .where(and(eq(todoItems.id, id), eq(todoItems.groupId, id)));
    if (result.rowCount == 0) {
      this.logger.error(`Todo item with id ${id} not found for deletion`);
      throw new HttpException('TodoItem not found', 404);
    }

    this.logger.log(`Deleted todo item with id ${id}`);
  }

  @Post()
  @HttpCode(201)
  async createNew(
    @GetUserPayload() user: TokenPayload,
    @Body() item: TodoItemDTO,
  ): Promise<TodoItemDTO> {
    this.logger.log(
      `Creating new todo item for group ${item.groupId} by user ${user.uid}`,
    );
    const db = this.databaseService.getDb();

    const groups = await db
      .select()
      .from(todoGroups)
      .where(eq(todoGroups.id, item.groupId));

    if (groups.length == 0) {
      this.logger.warn(`Group ${item.groupId} not found for user ${user.uid}`);
      throw new HttpException('Group not found', 404);
    }
    if (groups[0].userId != user.uid) {
      this.logger.warn(
        `Unauthorized create attempt by user ${user.uid} on group ${item.groupId}`,
      );
      throw new HttpException('Unauthorized', 401);
    }

    item.dueDate = new Date(item.dueDate);
    item.createdDate = new Date(item.createdDate);
    const result = await db
      .insert(todoItems)
      .values({
        description: item.description,
        groupId: item.groupId,
        name: item.name,
        dueDate: item.dueDate,
        updatedAt: new Date(),
        isDone: item.isDone,
      })
      .returning();
    if (result) {
      const item = result[0];
      const returnVal: TodoItemDTO = {
        createdDate: item.createdAt,
        ...item,
      };
      this.logger.log(`Created new todo item for group ${item.groupId}`);
      return returnVal;
    }

    this.logger.error('Failed to create new todo item');
    throw new HttpException('Cannot create', 400);
  }

  @Put(':id')
  @HttpCode(204)
  async update(
    @Body() item: TodoItemDTO,
    @GetUserPayload() user: TokenPayload,
    @Param('id') id: number,
  ) {
    this.logger.log(
      `Updating todo item with id ${item.id} for user ${user.uid}`,
    );
    const db = this.databaseService.getDb();

    const group = await db
      .select()
      .from(todoGroups)
      .where(eq(todoGroups.id, item.groupId));

    if (group.length == 0) {
      this.logger.warn(`Group ${item.groupId} not found for user ${user.uid}`);
      throw new HttpException('Group not found', 404);
    }
    if (group[0].userId != user.uid) {
      this.logger.warn(
        `Unauthorized update attempt by user ${user.uid} on group ${item.groupId}`,
      );
      throw new HttpException('Unauthorized', 401);
    }

    item.dueDate = new Date(item.dueDate);
    item.createdDate = new Date(item.createdDate);

    const result = await db
      .update(todoItems)
      .set({
        description: item.description,
        name: item.name,
        isDone: item.isDone,

        dueDate: item.dueDate,
        updatedAt: new Date(),
      })
      .where(and(eq(todoItems.id, id), eq(todoItems.groupId, item.groupId)));

    if (result.rowCount == 0) {
      this.logger.error(`Todo item with id ${item.id} not found for update`);
      throw new HttpException('TodoItem not found', 404);
    }

    this.logger.log(`Updated todo item with id ${item.id}`);
  }
}
