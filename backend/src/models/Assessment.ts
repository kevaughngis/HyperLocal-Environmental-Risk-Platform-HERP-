import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from "typeorm";

@Entity()
export class EnvironmentalAssessment {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column("decimal", { precision: 10, scale: 7 })
    @Index()
    latitude!: number;

    @Column("decimal", { precision: 10, scale: 7 })
    @Index()
    longitude!: number;

    @Column({
      type: 'geography',
      spatialFeatureType: 'Point',
      srid: 4326,
      nullable: true
    })
    @Index({ spatial: true })
    location!: string;

    @Column("int")
    riskScore!: number;

    @Column("jsonb")
    details!: any;

    @Column("text", { array: true })
    recommendations!: string[];

    @CreateDateColumn()
    createdAt!: Date;
}
