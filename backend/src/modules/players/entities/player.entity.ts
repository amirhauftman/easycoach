import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { Match } from '../../matches/entities/match.entity';

@Entity('players')
export class Player {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  player_id: string;

  @Column()
  team_id: string;

  @Column()
  fname: string;

  @Column()
  lname: string;

  @Column({ nullable: true })
  shirt_number: number;

  @Column({ nullable: true })
  position: string;

  @Column({ default: true })
  is_starter: boolean;

  @ManyToMany(() => Match, (match) => match.players)
  @JoinTable({
    name: 'match_players',
    joinColumn: { name: 'player_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'match_id', referencedColumnName: 'id' },
  })
  matches: Match[];

  @OneToOne('PlayerStat', (stat: any) => stat.player)
  stats: any;

  @OneToMany('MatchEvent', (event: any) => event.player)
  events: any[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
