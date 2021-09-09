import { Check } from "../Handler";

export const check = new Check();
check.name = "exampleCheck";
check.run = (options) => {
    return true;
};
