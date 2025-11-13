export * from "./alnum";
export * from "./alnumFa";
export * from "./fileSize";
export * from "./fileType";
export * from "./ip";
export * from "./ipPort";
export * from "./irBankCard";
export * from "./irIBAN";
export * from "./irIdNumber";
export * from "./irMobile";
export * from "./irNationalCode";
export * from "./irPhone";
export * from "./irPostalCode";
export * from "./username";

/**
 * Union type representing all available extra validation method names.
 *
 * Use with `extendYup()` to selectively register additional validation methods
 * on Yup schemas.
 */
export type ExtraMethods =
    | "alnum"
    | "alnumfa"
    | "file_size"
    | "file_type"
    | "ip"
    | "ip_port"
    | "ir_bank_card"
    | "ir_iban"
    | "ir_id_number"
    | "ir_mobile"
    | "ir_national_code"
    | "ir_phone"
    | "ir_postal_code"
    | "username";
