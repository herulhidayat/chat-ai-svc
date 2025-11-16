import { HttpException, Inject, Injectable } from "@nestjs/common";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { PrismaService } from "src/common/prisma.service";
import { ValidationService } from "src/common/validation.services";
import { LoginUserRequest, RegisterUserRequest, UserResponse } from "src/model/user.model";
import { Logger } from "winston";
import { UserValidation } from "./user.validation";
import * as bcrypt from "bcrypt";
import { randomUUID } from "crypto";
@Injectable()

export class UserService {
    constructor(
        private validationService: ValidationService,
        @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
        private prismaService: PrismaService
    ){}
    async register(request: RegisterUserRequest) : Promise<UserResponse> {
        this.logger.info(`UserService.register ${JSON.stringify(request)}`);
        const registerRequest:RegisterUserRequest = this.validationService.validate(UserValidation.REGISTER, request);
        
        const totalUserWithSameUsername = await this.prismaService.user.count({
            where: {
                username: registerRequest.username
            }
        });

        if (totalUserWithSameUsername !== 0) {
            throw new HttpException(
                `User with username ${registerRequest.username} already exists`,
                400
            )
        }

        registerRequest.password = await bcrypt.hash(registerRequest.password, 10);

        const user = await this.prismaService.user.create({
            data: registerRequest
        });

        return {
            username: user.username,
            name: user.name
        }
    }

    async login(request: LoginUserRequest) : Promise<UserResponse> {
        this.logger.info(`UserService.login ${JSON.stringify(request)}`);
        const loginUserRequest:LoginUserRequest = this.validationService.validate(UserValidation.LOGIN, request);

        let user = await this.prismaService.user.findUnique({
            where: {
                username: loginUserRequest.username
            }
        });

        if (!user) {
            throw new HttpException(
                `User or password is invalid`,
                400
            )
        }

        const isPasswordValid = await bcrypt.compare(loginUserRequest.password, user.password);

        if (!isPasswordValid) {
            throw new HttpException(
                `User or password is invalid`,
                400
            )
        }

        user = await this.prismaService.user.update({
            where: {
                username: loginUserRequest.username
            },
            data: {
                token: randomUUID()
            }
        });

        return {
            username: user.username,
            name: user.name,
            token: user.token
        }
    }
}
