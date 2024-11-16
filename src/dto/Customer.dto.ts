import { IsEmail, IsNotEmpty, Length } from "class-validator";

export class CreateCustomerInputs {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @Length(7, 12)
  phone: string;

  @IsNotEmpty()
  @Length(7, 12)
  password: string;
}
export class UserLoginInputs {
  @IsEmail()
  email: string;

  @Length(7, 12)
  password: string;
}

export class EditCustomerProfileInput {
  @Length(3, 16)
  firstName: string;

  @Length(3, 16)
  lastName: string;

  @Length(6, 16)
  address: string;
}

export interface CustomerPayload {
  _id: string;
  email: string;
  verified: boolean;
}
