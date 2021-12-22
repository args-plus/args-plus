import { Check } from "../../Handler";

const check = new Check("example");

check.run = () => {
    return true;
};

export default check;
