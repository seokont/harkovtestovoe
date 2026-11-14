import { DataTypes } from 'sequelize';
import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
} from 'sequelize-typescript';

@Table
export class Entry extends Model {
  @Column({
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  })
  declare id: string;
  @Column({
    type: DataTypes.STRING,
    defaultValue: '',
  })
  declare homePage: string;

  @Column({
    type: DataTypes.UUID,
    defaultValue: '',
  })
  declare referenceId: string;

  @Column({
    type: DataTypes.UUID,
    defaultValue: '',
  })
  declare userId: string;

  @Column({
    type: DataType.TEXT,
    defaultValue: '',
  })
  declare text: string;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @DeletedAt
  declare deletedAt: Date | null;
}
