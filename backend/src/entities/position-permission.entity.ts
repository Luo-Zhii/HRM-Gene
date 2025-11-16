import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";
import { Position } from "./position.entity";
import { Permission } from "./permission.entity";

@Entity({ name: "position_permission" })
export class PositionPermission {
  @PrimaryColumn()
  position_id!: number;

  @PrimaryColumn()
  permission_id!: number;

  @ManyToOne(() => Position, (p) => p.permissions)
  @JoinColumn({ name: "position_id" })
  position!: Position;

  @ManyToOne(() => Permission, (p) => p.positions)
  @JoinColumn({ name: "permission_id" })
  permission!: Permission;
}
