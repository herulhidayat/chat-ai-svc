import { Module } from "@nestjs/common";
import { CommonModule } from "src/common/common.module";
import { TestService } from "./test.service";

@Module({
    imports: [CommonModule],
    providers: [TestService]
})
export class TestModule {}
