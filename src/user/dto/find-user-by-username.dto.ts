import { IsUsername } from "src/common/decorator/validators/username.decorator/username.decorator.decorator";

export class FindUserByUsernameDTO {
    @IsUsername()
    username: string;
}