import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from "typeorm";

export enum HazardType {
  FLOODING = "Flooding",
  SMOKE = "Smoke/Fire",
  FALLEN_TREE = "Fallen Tree/Debris",
  POLLUTION = "Localized Pollution",
  OTHER = "Other"
}

@Entity()
export class CommunityReport {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column("decimal", { precision: 10, scale: 7 })
    latitude!: number;

    @Column("decimal", { precision: 10, scale: 7 })
    longitude!: number;

    @Column({
      type: "geometry",
      spatialFeatureType: "Point",
      srid: 4326,
      nullable: true
    })
    @Index({ spatial: true })
    location!: string;

    @Column({
      type: 'enum',
      enum: HazardType,
      default: HazardType.OTHER
    })
    type!: HazardType;

    @Column("text")
    description!: string;

    @Column({ type: "text", nullable: true })
    imageUrl?: string | null;

    @CreateDateColumn()
    createdAt!: Date;

    @Column({ default: true })
    isActive!: boolean;
}
