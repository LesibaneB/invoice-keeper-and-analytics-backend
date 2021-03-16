export function generateOTP(): number {
  const digits = '0123456789';
  let otp = '';

  for (let i = 0; i < 6; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }

  return Number.parseInt(otp);
}

export function otpMatches(otpToMatch: number, storedOTP: number): boolean {
  return otpToMatch === storedOTP;
}

export function generateOTPExpiry(): Date {
  const date = new Date();
  date.setMinutes(date.getMinutes() + 10);
  return date;
}

export function checkOTPExpired(date: Date): boolean {
  return date.valueOf() < Date.now();
}
