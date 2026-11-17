import { DataTypes } from 'sequelize';
import {
  Table,
  Column,
  Model,
  ForeignKey,
  BelongsTo,
  HasMany,
  DataType,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
} from 'sequelize-typescript';
import { User } from '../user/user.model.js';

@Table({ tableName: 'entries' })
export class Entry extends Model {
  @Column({
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => User)
  @Column({ type: DataTypes.UUID, allowNull: false })
  declare userId: string;

  @BelongsTo(() => User)
  declare user: User;

  @ForeignKey(() => Entry)
  @Column({ type: DataTypes.UUID, allowNull: true })
  declare parentId: string | null;

  @BelongsTo(() => Entry, { foreignKey: 'parentId', as: 'parent' })
  declare parent: Entry | null;

  @HasMany(() => Entry, { foreignKey: 'parentId', as: 'children' })
  declare children: Entry[];

  @Column({ type: DataType.TEXT, allowNull: false })
  declare text: string;

  @Column({ type: DataTypes.STRING, allowNull: true })
  declare imagePath: string | null;

  @Column({ type: DataTypes.STRING, allowNull: true })
  declare textFilePath: string | null;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @DeletedAt
  declare deletedAt: Date | null;
}
