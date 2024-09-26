import { IsNotEmpty } from 'class-validator';

export class TodoGroupDTO {
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  id: number;

  constructor(name: string, id: number) {
    this.name = name;
    this.id = id;
  }
}
