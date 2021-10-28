import { Check } from "../../Handler";

const check = new Check("example");

check.run = (options) => {
    return true;
};

export default check;
