import z, { ZodType } from "zod";

export class UserValidation {
    static readonly REGISTER: ZodType = z.object({
        username: z.string(),
        password: z.string(),
        name: z.string(),
    });

    static readonly LOGIN: ZodType = z.object({
        username: z.string(),
        password: z.string(),
    });
}
