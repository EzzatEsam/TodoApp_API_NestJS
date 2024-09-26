import { IsNotEmpty } from 'class-validator';

export class TodoItemDTO {
  @IsNotEmpty()
  public id: number;
  @IsNotEmpty()
  public name: string;
  @IsNotEmpty()
  public isDone: boolean = false;
  @IsNotEmpty()
  public createdDate: Date;
  @IsNotEmpty()
  public dueDate: Date;
  @IsNotEmpty()
  public description: string = '';
  @IsNotEmpty()
  public groupId: number;

  // constructor
  constructor(
    name: string,
    groupId: number,
    isDone: boolean,
    description: string,
    id: number,
    dueDate: Date,
    createdDate: Date,
  ) {
    this.name = name;
    this.groupId = groupId;
    this.isDone = isDone;
    this.description = description;
    this.id = id;
    this.dueDate = dueDate;
    this.createdDate = createdDate;
  }
}
