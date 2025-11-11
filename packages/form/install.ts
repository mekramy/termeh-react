import * as methods from "./methods";

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
