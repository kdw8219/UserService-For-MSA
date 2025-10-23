import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: 'users'})
export class User {
    @PrimaryGeneratedColumn({ type: 'bigint' , unsigned: true })
    id: number;

    @Column({unique: true})
    userId: string;

    @Column({nullable: false})
    password: string;

    @Column({unique: true})
    email: string;

    @Column({nullable: false})
    role: number;

    @Column()
    createdAt: Date;

    @Column()
    updatedAt: Date;
}