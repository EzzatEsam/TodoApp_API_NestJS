export class TokenPayload {
  uid: number;
  email: string;

  constructor(uid: number, email: string) {
    this.uid = uid;
    this.email = email;
  }
}
