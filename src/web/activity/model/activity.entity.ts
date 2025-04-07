import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { User } from '../../user/model/user.entity';
import { ActivityType } from '../enum/activity-type';
import { ActivityDifficulty } from '../enum/activity-difficulty';

@Entity('activity')
@Unique('UQ_activity_user_date_type', ['user', 'date', 'type'])
export class Activity {
  @PrimaryGeneratedColumn({ primaryKeyConstraintName: 'PK_activity' })
  id: number;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id', foreignKeyConstraintName: 'FK_activity_user' })
  user: User;

  @Column({ type: 'timestamp' })
  date: Date;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'int' })
  goal: number;

  @Column({ type: 'enum', enum: ActivityType, nullable: false })
  type: ActivityType;

  @Column({ type: 'enum', enum: ActivityDifficulty, nullable: false })
  difficulty: ActivityDifficulty;

  get isGoalReached(): boolean {
    return this.quantity >= this.goal;
  }

  updateActivity(quantity: number): void {
    if (quantity <= 0) {
      return;
    }

    this.quantity += quantity;
  }
}
