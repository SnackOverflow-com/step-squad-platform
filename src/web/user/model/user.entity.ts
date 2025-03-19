import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { UserUpdateDto } from '../dto/user-update.dto';
import { Gender } from './gender';

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

  @Column({ type: 'int' })
  age: number;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'enum', enum: Gender })
  gender: Gender;

  public updateUser(updateUserDto: UserUpdateDto): void {
    this.firstName = updateUserDto.firstName ?? this.firstName;
    this.lastName = updateUserDto.lastName ?? this.lastName;
    this.age = updateUserDto.age ?? this.age;
    this.email = updateUserDto.email ?? this.email;
  }
}
