import { userRepository } from "../../../repositories"
import { User } from "../../../types";

export const signupService = async (username: string, plainPassword: string): Promise<User> => {
    const existingUser = await userRepository.getUserByUsername(username);
    if (existingUser) {
        throw new Error('Username already taken');
    }

    const newUser = await userRepository.createUser(username, plainPassword);
    return newUser;
}