import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Player } from '../../players/entities/player.entity';
import { Match } from './match.entity';

@Entity('match_events')
export class MatchEvent {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Match)
    @JoinColumn({ name: 'match_id' })
    match: Match;

    @Column()
    match_id: number;

    @ManyToOne(() => Player, player => player.events)
    @JoinColumn({ name: 'player_id' })
    player: Player;

    @Column()
    player_id: number;

    @Column()
    event_type: string; // 'goal', 'yellow_card'

    @Column({ type: 'int' })
    minute: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}