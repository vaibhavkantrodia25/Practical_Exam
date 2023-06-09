import { ROLE } from 'src/helper/role.enum';

export interface JwtPayload {
  email: string;
  role: ROLE;
}
