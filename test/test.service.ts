import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/common/prisma.service";
import * as bcrypt from "bcrypt";
import type { User } from "generated/prisma/client";

@Injectable()
export class TestService {
    constructor(
        private prismaService: PrismaService
    ){}

    async deletrUser(){
        await this.prismaService.user.deleteMany(
            {
                where: {
                    username: 'test'
                }
            }
        );
    }

    async findUser(): Promise<User> {
        const user = await this.prismaService.user.findUnique(
            {
                where: {
                    username: 'test'
                }
            }
        );

        if (user) {
            return user;
        } else {
            throw new Error('User not found');
        }
    }

    async createUser(){
        await this.prismaService.user.create({
            data: {
                username: 'test',
                password: await bcrypt.hash('Test1234', 10),
                name: 'test',
                token: 'test'
            }
        });
    }
}