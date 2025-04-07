import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { UserUpdateRequest } from '../dto/user-update-request';
import { Gender } from '../enum/gender';
import { Exclude } from 'class-transformer';
import { Activity } from '../../activity/model/activity.entity';
import { ActivityDifficulty } from '../../activity/enum/activity-difficulty';

@Entity('application_user')
@Unique('UQ_user_email', ['email'])
export class User {
  @PrimaryGeneratedColumn({ primaryKeyConstraintName: 'PK_user' })
  id: number;

  @Column({ type: 'varchar', length: 30 })
  firstName: string;

  @Column({ type: 'varchar', length: 30 })
  lastName: string;

  @Column({ type: 'varchar', length: 40, nullable: false })
  email: string;

  @Column({ type: 'int', nullable: true })
  age: number;

  @Column({ type: 'enum', enum: Gender, nullable: false })
  gender: Gender;

  @OneToMany(() => Activity, (activity) => activity.id)
  activities: Activity[];

  @Column({ type: 'enum', enum: ActivityDifficulty, nullable: false })
  difficulty: ActivityDifficulty;

  @Exclude()
  @Column({ type: 'varchar', nullable: false })
  password: string;

  public updateUser(updateUserDto: UserUpdateRequest): void {
    this.firstName = updateUserDto.firstName ?? this.firstName;
    this.lastName = updateUserDto.lastName ?? this.lastName;
    this.age = updateUserDto.age ?? this.age;
    this.gender = updateUserDto.gender ?? this.gender;
  }
}
