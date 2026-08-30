import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('chat_messages')
export class ChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  sessionId: string;

  @Column()
  role: 'user' | 'assistant';

  @Column({ type: 'text' })
  content: string;

  /** RAG 引用来源（JSON 数组） */
  @Column({ type: 'text', nullable: true })
  sources: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
