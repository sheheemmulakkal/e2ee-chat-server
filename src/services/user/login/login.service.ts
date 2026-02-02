import { userRepository } from "../../../repositories";
import { User } from "../../../types";
import bcrypt from "bcrypt";

export const loginService = async (username: string, password: string): Promise<User> => {
    const isUserExist = await userRepository.getUserByUsername(username);
    if (!isUserExist) {
        throw new Error('Invalid username or password');
    }

    const isPasswordValid = await bcrypt.compare(password, isUserExist.password_hash);
    if (!isPasswordValid) {
        throw new Error('Invalid username or password');
    }

    return isUserExist;
}