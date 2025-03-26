import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { UserUpdateRequest } from '../dto/user-update-request';
import { Gender } from './gender';
import { Exclude } from 'class-transformer';

@Entity('application_user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 30 })
  firstName: string;

  @Column({ type: 'varchar', length: 30 })
  lastName: string;

  @Column({ type: 'varchar', length: 40, nullable: false, unique: true })
  email: string;

  @Column({ type: 'int', nullable: true })
  age: number;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender: Gender;

  @Exclude()
  @Column({ type: 'varchar' })
  password: string;

  public updateUser(updateUserDto: UserUpdateRequest): void {
    this.firstName = updateUserDto.firstName ?? this.firstName;
    this.lastName = updateUserDto.lastName ?? this.lastName;
    this.age = updateUserDto.age ?? this.age;
    this.email = updateUserDto.email ?? this.email;
    this.gender = updateUserDto.gender ?? this.gender;
  }
}
