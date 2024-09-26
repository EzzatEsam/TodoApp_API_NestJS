import { Module } from '@nestjs/common';
import { DatabaseService } from 'src/db/db';
import { TodoGroupsController } from './todoGroups.controller';
import { TodoItemsController } from './todoItems.controller';

@Module({
  providers: [DatabaseService],
  controllers: [TodoGroupsController, TodoItemsController],
})
export class TodoModule {}
