const handleInvalidFields = (invalid: string[]) => {
    let message = "";
    invalid.forEach((field) => {
        message += `${field} is invalid\n`;
    });
    return message;
}

const handleDuplicateFields = (duplicate: string[]) => {
    let message = "";
    duplicate.forEach((field) => {
        message += `${field} is duplicate\n`;
    });
    return message;
}

const handleMissingFields = (missing: string[]) => {
    let message = "";
    missing.forEach((field) => {
        message += `${field} is missing\n`;
    });
    return message;
}

export default {handleInvalidFields,handleDuplicateFields,handleMissingFields};