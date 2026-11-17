import { DataTypes } from 'sequelize';
import {
  Table,
  Column,
  Model,
  HasMany,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
} from 'sequelize-typescript';
import { Entry } from '../entry/entry.model.js';

@Table({ tableName: 'users' })
export class User extends Model {
  @Column({
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({ type: DataTypes.STRING, allowNull: false })
  declare userName: string;

  @Column({ type: DataTypes.STRING, allowNull: false, unique: true })
  declare email: string;

  @Column({ type: DataTypes.STRING, defaultValue: '' })
  declare homePage: string;

  @HasMany(() => Entry)
  declare entries: Entry[];

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @DeletedAt
  declare deletedAt: Date | null;
}
