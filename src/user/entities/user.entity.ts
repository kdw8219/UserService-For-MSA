import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity({name: 'users'})
export class User {
    @PrimaryGeneratedColumn({ type: 'bigint' , unsigned: true })
    id: bigint;

    @Column({unique: true})
    userId: string;

    @Column({nullable: false})
    password: string;

    @Column({unique: true})
    email: string;

    @Column({nullable: false})
    role: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}