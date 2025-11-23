import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  OneToMany,
} from 'typeorm';
import { Player } from '../../players/entities/player.entity';
import { MatchEvent } from './match-event.entity';

@Entity('matches')
export class Match {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  match_id: string;

  @Column()
  home_team: string;

  @Column()
  away_team: string;

  @Column({ nullable: true })
  home_team_id: string;

  @Column({ nullable: true })
  away_team_id: string;

  @Column({ type: 'int', nullable: true })
  home_score: number;

  @Column({ type: 'int', nullable: true })
  away_score: number;

  @Column({ type: 'timestamp', nullable: true })
  match_date: Date;

  @Column({ nullable: true })
  competition: string;

  @Column({ nullable: true })
  league: string;

  @Column({ nullable: true })
  status: string;

  @Column({ nullable: true })
  venue: string;

  @Column({ nullable: true })
  pxlt_game_id: string;

  @Column({ nullable: true })
  season_name: string;

  @Column({ nullable: true })
  video_url: string;

  @ManyToMany(() => Player, (player) => player.matches)
  players: Player[];

  @OneToMany(() => MatchEvent, (event) => event.match)
  events: MatchEvent[];

  @Column({ type: 'json', nullable: true })
  home_formation: any;

  @Column({ type: 'json', nullable: true })
  away_formation: any;

  @Column({ type: 'json', nullable: true })
  match_events: any;

  @Column({ type: 'json', nullable: true })
  statistics: any;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
