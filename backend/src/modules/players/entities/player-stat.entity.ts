import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Player } from './player.entity';

@Entity('player_stats')
export class PlayerStat {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Player, (player) => player.stats)
  @JoinColumn({ name: 'player_id' })
  player: Player;

  @Column()
  player_id: number;

  @Column({ type: 'int', nullable: true })
  passing: number; // 1-10

  @Column({ type: 'int', nullable: true })
  dribbling: number; // 1-10

  @Column({ type: 'int', nullable: true })
  speed: number; // 1-10

  @Column({ type: 'int', nullable: true })
  strength: number; // 1-10

  @Column({ type: 'int', nullable: true })
  vision: number; // 1-10

  @Column({ type: 'int', nullable: true })
  defending: number; // 1-10

  @Column({ type: 'int', nullable: true })
  shooting: number; // 1-10

  @Column({ type: 'int', nullable: true })
  potential: number; // 1-10

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
