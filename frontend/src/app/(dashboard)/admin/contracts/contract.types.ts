export enum ContractType {
    PROBATION = "Probation",
    OFFICIAL = "Official",
    PART_TIME = "Part-time",
}

export enum ContractStatus {
    ACTIVE = "Active",
    EXPIRED = "Expired",
    TERMINATED = "Terminated",
}

export interface Employee {
    employee_id: number;
    first_name: string;
    last_name: string;
    email: string;
}

export interface Contract {
    contract_id: number;
    contract_number: string;
    contract_type: ContractType;
    start_date: string;
    end_date?: string | null;
    status: ContractStatus;
    salary_rate: string;
    file_url?: string | null;
    employee: Employee;
}

export interface CreateContractDto {
    employee_id: number;
    contract_number: string;
    contract_type: ContractType;
    start_date: string;
    end_date?: string;
    status?: ContractStatus;
    salary_rate: string;
    file_url?: string;
}

export interface UpdateContractDto {
    contract_number?: string;
    contract_type?: ContractType;
    start_date?: string;
    end_date?: string;
    status?: ContractStatus;
    salary_rate?: string;
    file_url?: string;
}