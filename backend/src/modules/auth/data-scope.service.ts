import { Injectable } from "@nestjs/common";
import {
  SelectQueryBuilder,
  UpdateQueryBuilder,
  DeleteQueryBuilder,
  ObjectLiteral,
} from "typeorm";

/**
 * Shape of req.user attached by JwtStrategy.validate().
 */
export interface RequestUser {
  employee_id: number;
  email: string;
  role: string;
  permissions: string[];
  department?: {
    department_id: number;
    department_name: string;
  };
  position?: {
    position_id: number;
    position_name: string;
  };
}

type ScopeLevel = "global" | "department" | "self";

interface EntityScopeConfig {
  selfField: string;
  deptField: string;
}

/**
 * Dot-notation field paths for each entity.
 * Default assumes entity has `employee_id` and `department.department_id`.
 */
const ENTITY_CONFIGS: Record<string, EntityScopeConfig> = {
  Employee: {
    selfField: "employee_id",
    deptField: "department.department_id",
  },
  LeaveRequest: {
    selfField: "employee.employee_id",
    deptField: "employee.department.department_id",
  },
  Contract: {
    selfField: "employee.employee_id",
    deptField: "employee.department.department_id",
  },
  SalaryConfig: {
    selfField: "employee.employee_id",
    deptField: "employee.department.department_id",
  },
  Timekeeping: {
    selfField: "employee.employee_id",
    deptField: "employee.department.department_id",
  },
  Violation: {
    selfField: "employee.employee_id",
    deptField: "employee.department.department_id",
  },
  Payslip: {
    selfField: "employee.employee_id",
    deptField: "employee.department.department_id",
  },
  KpiAssignment: {
    selfField: "employee.employee_id",
    deptField: "employee.department.department_id",
  },
  ResignationRequest: {
    selfField: "employee.employee_id",
    deptField: "employee.department.department_id",
  },
  Notification: {
    selfField: "employee.employee_id",
    deptField: "employee.department.department_id",
  },
};

const DEFAULT_CONFIG: EntityScopeConfig = {
  selfField: "employee_id",
  deptField: "department.department_id",
};

/**
 * Cross-functional overrides: when a user belongs to a department whose
 * name INCLUDES the given pattern, and the target entity matches, force
 * Global Scope regardless of the user's role.
 *
 * Department ALWAYS takes priority over role — if a department rule
 * fires, the role is ignored for that entity.
 */
const CROSS_FUNCTIONAL_OVERRIDES: [string, string[]][] = [
  ["HR", ["Employee", "LeaveRequest"]],
  ["Finance", ["Payroll", "SalaryConfig"]],
];

/**
 * Admin-level roles that ALWAYS get global scope across ALL entities.
 * Must match the bypass lists in RolesGuard and EndpointPermissionsGuard.
 * Matching logic: case-insensitive exact match OR includes-substring.
 */
const ADMIN_BYPASS_ROLES = [
  "admin",
  "system admin",
  "director",
  "hr manager",
  "hr",
];

/**
 * Convert a dot-path (e.g. "department.department_id") into a nested
 * TypeORM FindOptionsWhere-compatible object.
 */
function dotToNestedWhere(
  path: string,
  value: number | null,
): Record<string, any> {
  if (value == null) return { employee_id: -1 };
  const parts = path.split(".");
  if (parts.length === 1) return { [parts[0]]: value };
  const result: Record<string, any> = {};
  let current = result;
  for (let i = 0; i < parts.length - 1; i++) {
    current[parts[i]] = {};
    current = current[parts[i]];
  }
  current[parts[parts.length - 1]] = value;
  return result;
}

@Injectable()
export class DataScopeService {
  // ─── Public API ───────────────────────────────────────────────

  /**
   * Returns a TypeORM `where` fragment for repo.find() / repo.findOne().
   * Merge with spread: `{ ...scope, deleted_at: IsNull() }`.
   * Returns `{}` (empty object) for global scope — no filtering.
   */
  getScopeWhere(user: RequestUser, entityName: string): Record<string, any> {
    const level = this.computeScopeLevel(user, entityName);
    if (level === "global") return {};

    const config = ENTITY_CONFIGS[entityName] ?? DEFAULT_CONFIG;
    const path = level === "self" ? config.selfField : config.deptField;
    const value =
      level === "self"
        ? user.employee_id
        : user.department?.department_id ?? null;

    return dotToNestedWhere(path, value);
  }

  /**
   * Apply scoping AND WHERE clauses to a QueryBuilder.
   * Works for SELECT, UPDATE, and DELETE QueryBuilders.
   * For nested paths (e.g. "employee.department.department_id") this adds
   * LEFT JOINs so the WHERE condition resolves correctly.
   */
  applyScope<T extends ObjectLiteral>(
    qb:
      | SelectQueryBuilder<T>
      | UpdateQueryBuilder<T>
      | DeleteQueryBuilder<T>,
    user: RequestUser,
    entityName: string,
    alias: string,
  ): void {
    const level = this.computeScopeLevel(user, entityName);
    if (level === "global") return;

    const config = ENTITY_CONFIGS[entityName] ?? DEFAULT_CONFIG;
    const path = level === "self" ? config.selfField : config.deptField;
    const value =
      level === "self"
        ? user.employee_id
        : user.department?.department_id ?? null;

    if (value == null) {
      qb.andWhere("1 = 0");
      return;
    }

    this.applyPathScope(qb, path, value, alias);
  }

  // ─── Private helpers ──────────────────────────────────────────

  private computeScopeLevel(
    user: RequestUser,
    entityName: string,
  ): ScopeLevel {
    const role = (
      user.role ||
      user.position?.position_name ||
      ""
    ).toLowerCase();
    const deptName = (user.department?.department_name || "").toLowerCase();

    // ── TIER 1: Department-based rules (HIGHEST PRIORITY) ──────────
    // Cross-functional overrides: department context beats role context.
    for (const [deptPattern, entities] of CROSS_FUNCTIONAL_OVERRIDES) {
      if (
        deptName.includes(deptPattern.toLowerCase()) &&
        entities.some((e) => e.toLowerCase() === entityName.toLowerCase())
      ) {
        return "global";
      }
    }

    // ── TIER 2: Admin bypass roles (same list as RolesGuard) ───────
    // Admin / System Admin / Director / HR Manager / HR → global scope.
    if (
      ADMIN_BYPASS_ROLES.some(
        (r) => role === r || role.includes(r),
      )
    ) {
      return "global";
    }

    // ── TIER 3: Role-based scoping (fallback) ──────────────────────
    // Manager → department scope (sees all employees in own department)
    if (role.includes("manager")) {
      return "department";
    }

    // Staff / Intern / everyone else → self scope (sees only own record)
    return "self";
  }

  private applyPathScope<T>(
    qb: any,
    path: string,
    value: number,
    alias: string,
  ): void {
    const parts = path.split(".");
    const leafField = parts[parts.length - 1];
    const relationChain = parts.slice(0, -1);

    if (relationChain.length === 0) {
      qb.andWhere(`${alias}.${leafField} = :__scopeValue`, {
        __scopeValue: value,
      });
      return;
    }

    // Build join chain for nested paths
    let currentAlias = alias;
    for (const relation of relationChain) {
      const joinAlias = `__scope_${relation}`;
      qb.leftJoin(`${currentAlias}.${relation}`, joinAlias);
      currentAlias = joinAlias;
    }

    qb.andWhere(`${currentAlias}.${leafField} = :__scopeValue`, {
      __scopeValue: value,
    });
  }
}
