import * as methods from "./methods";

/**
 * Extends Yup with extra validation methods for specialized use cases.
 *
 * This function conditionally registers custom validation methods on Yup's
 * schema prototypes based on the provided method names. Call this once at
 * application startup to enable additional validators like Iranian phone, bank
 * card, file size, and IP address validation.
 *
 * @example
 *     ```typescript
 *     import { extendYup } from '@termeh/form';
 *     extendYup('ir_mobile', 'ir_national_code', 'alnum');
 *     ```;
 *
 * @param extraMethods - Variable number of method names to register. Valid
 *   values include:
 *
 *   - `"alnum"`: Alphanumeric string validation
 *   - `"alnumfa"`: Alphanumeric with Persian characters
 *   - `"file_size"`: File size validation
 *   - `"file_type"`: File type/MIME validation
 *   - `"ip"`: IPv4/IPv6 address validation
 *   - `"ip_port"`: IP address with port validation
 *   - `"ir_bank_card"`: Iranian bank card validation
 *   - `"ir_iban"`: Iranian IBAN validation
 *   - `"ir_id_number"`: Iranian ID number validation
 *   - `"ir_mobile"`: Iranian mobile phone validation
 *   - `"ir_national_code"`: Iranian national code validation
 *   - `"ir_phone"`: Iranian landline phone validation
 *   - `"ir_postal_code"`: Iranian postal code validation
 *   - `"username"`: Username format validation
 *
 * @returns Void
 */
export function extendYup(...extraMethods: methods.ExtraMethods[]) {
    // Conditionally add extra validation methods based on provided parameters
    if (extraMethods.includes("alnum")) methods.addAlphaNumericMethod();
    if (extraMethods.includes("alnumfa"))
        methods.addAlphaNumericWithPersianMethod();
    if (extraMethods.includes("file_size")) methods.addFileSizeMethod();
    if (extraMethods.includes("file_type")) methods.addFileTypeMethod();
    if (extraMethods.includes("ip")) methods.addIPMethod();
    if (extraMethods.includes("ip_port")) methods.addIPPortMethod();
    if (extraMethods.includes("ir_bank_card"))
        methods.addIranianBankCardMethod();
    if (extraMethods.includes("ir_iban")) methods.addIranianIBANMethod();
    if (extraMethods.includes("ir_id_number"))
        methods.addIranianIdNumberMethod();
    if (extraMethods.includes("ir_mobile")) methods.addIranianMobileMethod();
    if (extraMethods.includes("ir_national_code"))
        methods.addIranianNationalCodeMethod();
    if (extraMethods.includes("ir_phone")) methods.addIranianPhoneMethod();
    if (extraMethods.includes("ir_postal_code"))
        methods.addIranianPostalCodeMethod();
    if (extraMethods.includes("username")) methods.addUsernameMethod();
}
