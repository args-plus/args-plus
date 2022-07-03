const splitStringByNewLine = (string: string) => {
    return string.split(/\r?\n/);
};

const generateId = (string: string) => {
    return string.toUpperCase().replace(/[ +]/g, "_");
};

class ArgsPlusUtils {
    public splitStringByNewLine(string: string) {
        return splitStringByNewLine(string);
    }

    public static splitStringByNewLine(string: string) {
        return splitStringByNewLine(string);
    }

    public generateId(string: string) {
        return generateId(string);
    }

    public static generateId(string: string) {
        return generateId(string);
    }
}

export default ArgsPlusUtils;
