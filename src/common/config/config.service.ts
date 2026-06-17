export const JwtAccesToken = {
    secret: process.env.Jwt_Acc,
    expiresIn: "20m"  
} as const;

export const JwtRefreshToken = {
    secret: process.env.Jwt_Ref,
    expiresIn: "20m" 
} as const;