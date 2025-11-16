import z, { ZodType } from "zod";
import { RegisterUserRequest } from "src/model/user.model";

export class UserValidation {
    static readonly REGISTER: ZodType<RegisterUserRequest> = z.object({
        username: z.string(),
        password: z.string(),
        name: z.string(),
    });
}
