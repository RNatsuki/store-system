export {};

declare global {
  namespace Express {
    interface Request {
      csrfToken?: string;
      user?:{
        id:string;
        role:string;
        email:string;
        name?:string;
        lastname?:string;
        ssn?:string;
        rfc?:string;
        userId?:string;
      }
    }
  }
}
