import z, { ZodType } from "zod";
import { LoginUserRequest, RegisterUserRequest } from "src/model/user.model";

export class UserValidation {
    static readonly REGISTER: ZodType<RegisterUserRequest> = z.object({
        username: z.string(),
        password: z.string(),
        name: z.string(),
    });

    static readonly LOGIN: ZodType<LoginUserRequest> = z.object({
        username: z.string(),
        password: z.string(),
    });
}
